import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DispatchEligibleInvoice } from '../types';

export function useDispatchInvoices(selectedDate?: string) {
  const [invoices, setInvoices] = useState<DispatchEligibleInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('dispatch_eligible_invoices')
        .select('*');
      
      if (selectedDate) {
        query = query.eq('tx_date', selectedDate);
      }

      const { data, error: supabaseError } = await query.order('doc_no', { ascending: false });

      if (supabaseError) throw supabaseError;
      setInvoices(data || []);
    } catch (err: any) {
      console.error('[useDispatchInvoices] Error:', err);
      setError(err.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, loading, error, refresh: fetchInvoices };
}

export function useMaxTxDate() {
  const [maxDate, setMaxDate] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMaxDate() {
      if (!supabase) return;
      const { data } = await supabase
        .from('transaction_headers')
        .select('tx_date')
        .order('tx_date', { ascending: false })
        .limit(1);
      
      if (data && data[0]) {
        setMaxDate(data[0].tx_date);
      }
    }
    fetchMaxDate();
  }, []);

  return maxDate;
}
