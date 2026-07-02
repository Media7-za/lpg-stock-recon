import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { CommercialDecisionRecord } from '../types/pricingDesk';

interface PricingDeskStore {
  decisions: CommercialDecisionRecord[];
  addDecision: (decision: CommercialDecisionRecord) => void;
}

const PricingDeskContext = createContext<PricingDeskStore | null>(null);

export function PricingDeskProvider({ children }: { children: ReactNode }) {
  const [decisions, setDecisions] = useState<CommercialDecisionRecord[]>([]);

  const addDecision = useCallback((decision: CommercialDecisionRecord) => {
    setDecisions((prev) => [decision, ...prev]);
  }, []);

  return (
    <PricingDeskContext.Provider value={{ decisions, addDecision }}>
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
