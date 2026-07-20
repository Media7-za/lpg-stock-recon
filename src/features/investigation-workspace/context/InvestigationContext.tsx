import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { KnowledgeBundle, WorkspaceSelection } from '../types/knowledgeBundle';

interface InvestigationContextValue {
  bundle: KnowledgeBundle;
  selection: WorkspaceSelection;
  setSelection: (selection: WorkspaceSelection) => void;
}

const InvestigationContext = createContext<InvestigationContextValue | null>(null);

export function InvestigationProvider({
  bundle,
  children,
}: {
  bundle: KnowledgeBundle;
  children: ReactNode;
}) {
  const [selection, setSelection] = useState<WorkspaceSelection>(null);
  const value = useMemo(
    () => ({ bundle, selection, setSelection }),
    [bundle, selection]
  );

  return <InvestigationContext.Provider value={value}>{children}</InvestigationContext.Provider>;
}

export function useInvestigationContext() {
  const ctx = useContext(InvestigationContext);
  if (!ctx) throw new Error('useInvestigationContext must be used within InvestigationProvider');
  return ctx;
}
