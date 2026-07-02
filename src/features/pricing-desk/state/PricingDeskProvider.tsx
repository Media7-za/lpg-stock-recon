import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import {
  CommercialDecisionRecord,
  CreateCommercialDecisionRecordInput,
  DecisionState,
} from '../types/pricingDesk';
import {
  createCommercialDecisionRecord,
  listRecentCommercialDecisionRecords,
  updateCommercialDecisionRecordState,
} from '../lib/cdrRepository';

interface PricingDeskStore {
  decisions: CommercialDecisionRecord[];
  loading: boolean;
  error: string | null;
  addDecision: (input: CreateCommercialDecisionRecordInput) => Promise<CommercialDecisionRecord>;
  updateDecisionState: (
    decisionId: string,
    patch: { state: DecisionState; quotedAt?: string }
  ) => Promise<CommercialDecisionRecord>;
}

const PricingDeskContext = createContext<PricingDeskStore | null>(null);

export function PricingDeskProvider({ children }: { children: ReactNode }) {
  const [decisions, setDecisions] = useState<CommercialDecisionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listRecentCommercialDecisionRecords()
      .then((rows) => {
        if (!cancelled) setDecisions(rows);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load pricing decisions.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addDecision = useCallback(async (input: CreateCommercialDecisionRecordInput) => {
    const decision = await createCommercialDecisionRecord(input);
    setDecisions((prev) => [decision, ...prev]);
    return decision;
  }, []);

  const updateDecisionState = useCallback(
    async (decisionId: string, patch: { state: DecisionState; quotedAt?: string }) => {
      const updated = await updateCommercialDecisionRecordState(decisionId, patch);
      setDecisions((prev) => prev.map((d) => (d.decisionId === updated.decisionId ? updated : d)));
      return updated;
    },
    []
  );

  return (
    <PricingDeskContext.Provider value={{ decisions, loading, error, addDecision, updateDecisionState }}>
      {children}
    </PricingDeskContext.Provider>
  );
}

export function usePricingDeskStore(): PricingDeskStore {
  const store = useContext(PricingDeskContext);
  if (!store) {
    throw new Error('usePricingDeskStore must be used within a PricingDeskProvider');
  }
  return store;
}
