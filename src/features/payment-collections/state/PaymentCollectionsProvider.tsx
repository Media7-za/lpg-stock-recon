import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import {
  classifyPayment,
  createOrUpdatePayment,
  listPaymentRecords,
} from '../lib/paymentCollectionsRepository';
import { OutstandingPayment, PaymentOutcome, PaymentSessionLogEntry } from '../types/paymentCollections';

interface PaymentCollectionsStore {
  records: OutstandingPayment[];
  currentRecord: OutstandingPayment | null;
  loading: boolean;
  error: string | null;
  log: PaymentSessionLogEntry[];
  refresh: () => Promise<void>;
  addPayment: (input: {
    commercialCustomerId: string;
    amountDue: number;
    file?: { base64: string; name: string; contentType: string };
  }) => Promise<void>;
  logOutcome: (outcome: PaymentOutcome, detail: string, followUpDate?: string) => Promise<void>;
}

const PaymentCollectionsContext = createContext<PaymentCollectionsStore | null>(null);

export function PaymentCollectionsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<OutstandingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<PaymentSessionLogEntry[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listPaymentRecords();
      setRecords(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load outstanding payments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const currentRecord = records[0] ?? null;

  const addPayment = useCallback(
    async (input: {
      commercialCustomerId: string;
      amountDue: number;
      file?: { base64: string; name: string; contentType: string };
    }) => {
      await createOrUpdatePayment(input);
      await refresh();
    },
    [refresh],
  );

  const logOutcome = useCallback(
    async (outcome: PaymentOutcome, detail: string, followUpDate?: string) => {
      if (!currentRecord) return;

      await classifyPayment({ paymentId: currentRecord.id, outcome, note: detail, followUpDate });

      setLog((l) => [{ customerName: currentRecord.customerName, outcome, detail }, ...l]);
      setRecords((prev) => prev.filter((r) => r.id !== currentRecord.id));
    },
    [currentRecord],
  );

  return (
    <PaymentCollectionsContext.Provider
      value={{ records, currentRecord, loading, error, log, refresh, addPayment, logOutcome }}
    >
      {children}
    </PaymentCollectionsContext.Provider>
  );
}

export function usePaymentCollectionsStore(): PaymentCollectionsStore {
  const store = useContext(PaymentCollectionsContext);
  if (!store) {
    throw new Error('usePaymentCollectionsStore must be used within a PaymentCollectionsProvider');
  }
  return store;
}
