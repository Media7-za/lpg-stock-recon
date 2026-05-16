import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  NormalizedDocument, 
  ReconScoringWeights, 
  ReconciliationSession,
  EntryType
} from '../types';
import { calculateRecommendationScore, buildItemSignature } from '../lib/allocationEngine';

export function useAllocationEngine(accountNo: string) {
  const [invoices, setInvoices] = useState<NormalizedDocument[]>([]);
  const [credits, setCredits] = useState<NormalizedDocument[]>([]);
  const [weights, setWeights] = useState<ReconScoringWeights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ReconciliationSession | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);

  const fetchData = useCallback(async () => {
    if (!supabase || !accountNo) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Configuration & Classifications
      const [configRes, classRes] = await Promise.all([
        supabase.from('app_config').select('*').eq('config_key', 'RECON_SCORING_WEIGHTS').single(),
        supabase.from('item_classifications').select('*')
      ]);

      if (configRes.data) setWeights(configRes.data.config_data as ReconScoringWeights);
      
      const classMap: Record<string, string> = {};
      classRes.data?.forEach(c => { classMap[c.stock_no] = c.business_bucket; });

      // 2. Fetch Session or create DRAFT
      let { data: activeSession, error: sessionFetchErr } = await supabase
        .from('reconciliation_sessions')
        .select('*')
        .eq('account_no', accountNo)
        .neq('status', 'FINALIZED')
        .maybeSingle();

      if (sessionFetchErr) {
        throw sessionFetchErr;
      }

      if (activeSession) {
        setSession(activeSession);
      } else {
        const { data: newSession, error: insertErr } = await supabase
          .from('reconciliation_sessions')
          .insert([{ account_no: accountNo, status: 'OPEN' }])
          .select()
          .maybeSingle();
        
        if (insertErr) {
          // Handle race condition: if someone else inserted it between our maybeSingle and INSERT
          if (insertErr.code === '23505') { // Unique violation
            const { data: retrySession } = await supabase
              .from('reconciliation_sessions')
              .select('*')
              .eq('account_no', accountNo)
              .neq('status', 'FINALIZED')
              .maybeSingle();
            setSession(retrySession);
          } else {
            throw insertErr;
          }
        } else if (newSession) {
          setSession(newSession);
        }
      }

      // 3. Fetch Transaction Headers (Unallocated)
      const { data: headers, error: headerErr } = await supabase
        .from('transaction_headers')
        .select('*')
        .eq('account_no', accountNo)
        .gt('available_balance', 0)
        .order('tx_date', { ascending: true });

      if (headerErr) throw headerErr;

      // 4. Fetch Items for these headers to build signatures
      const docNos = headers.map(h => h.doc_no);
      const { data: items } = await supabase
        .from('transaction_items')
        .select('doc_no, stock_no, qty')
        .in('doc_no', docNos);

      const itemsByDoc: Record<string, any[]> = {};
      items?.forEach(item => {
        if (!itemsByDoc[item.doc_no]) itemsByDoc[item.doc_no] = [];
        itemsByDoc[item.doc_no].push(item);
      });

      // 5. Normalize and Separate
      const normalized: NormalizedDocument[] = headers.map(h => ({
        id: h.id,
        doc_no: h.doc_no,
        account_no: h.account_no,
        tx_date: h.tx_date,
        entry_type: h.entry_type as EntryType,
        total_amount: h.amount_excl + h.tax_amount,
        available_balance: h.available_balance,
        item_signature: buildItemSignature(itemsByDoc[h.doc_no] || [], classMap),
        raw_items: (itemsByDoc[h.doc_no] || []).map(item => ({ stock_no: item.stock_no, qty: item.qty }))
      }));

      setInvoices(normalized.filter(d => d.entry_type === 'Invoice'));
      setCredits(normalized.filter(d => d.entry_type !== 'Invoice'));

    } catch (err: any) {
      console.error('[useAllocationEngine] Error:', err);
      setError(err.message || 'Failed to initialize allocation engine');
    } finally {
      setLoading(false);
    }
  }, [accountNo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Computed State for UI ---

  const focusInvoice = invoices[focusIndex] || null;

  const scoredCredits = useMemo(() => {
    if (!focusInvoice || !weights || credits.length === 0) return credits;
    
    return credits
      .map(c => ({
        ...c,
        score: calculateRecommendationScore(focusInvoice, c, weights)
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [focusInvoice, weights, credits]);

  // The 3+1+3 Queue logic
  const queue = useMemo(() => {
    const start = Math.max(0, focusIndex - 3);
    const end = Math.min(invoices.length, focusIndex + 4);
    return invoices.slice(start, end);
  }, [invoices, focusIndex]);

  const nextInvoice = useCallback(() => {
    if (focusIndex < invoices.length - 1) {
      setFocusIndex(prev => prev + 1);
    }
  }, [focusIndex, invoices.length]);

  const prevInvoice = useCallback(() => {
    if (focusIndex > 0) {
      setFocusIndex(prev => prev - 1);
    }
  }, [focusIndex]);

  return {
    invoices,
    credits: scoredCredits,
    focusInvoice,
    queue,
    loading,
    error,
    session,
    nextInvoice,
    prevInvoice,
    setFocusIndex,
    refresh: fetchData
  };
}
