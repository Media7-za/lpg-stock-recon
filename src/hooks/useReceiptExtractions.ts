import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ReceiptExtraction, ReceiptReviewStatus } from '../types';

export function useReceiptExtractions(status?: ReceiptReviewStatus) {
  const [extractions, setExtractions] = useState<ReceiptExtraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExtractions = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('receipt_extractions')
        .select('*');

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error: supabaseError } = await query.order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setExtractions(data || []);
    } catch (err) {
      console.error('[useReceiptExtractions] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch receipt extractions');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchExtractions();
  }, [fetchExtractions]);

  return { extractions, loading, error, refresh: fetchExtractions };
}
