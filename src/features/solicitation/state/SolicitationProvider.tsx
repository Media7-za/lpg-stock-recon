import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { classify as classifyRequest, listDesk } from '../lib/solicitationRepository';
import { ClassifyPayload, Desk, Intent, SessionLogEntry, SolicitationTarget } from '../types/solicitation';

interface SolicitationStore {
  desk: Desk;
  setDesk: (desk: Desk) => void;
  targets: SolicitationTarget[];
  currentTarget: SolicitationTarget | null;
  loading: boolean;
  error: string | null;
  log: SessionLogEntry[];
  refresh: () => Promise<void>;
  logOutcome: (intent: Intent, detail: string, extra?: Omit<ClassifyPayload, 'queueId' | 'intent' | 'replyText'>) => Promise<void>;
}

const SolicitationContext = createContext<SolicitationStore | null>(null);

export function SolicitationProvider({ children }: { children: ReactNode }) {
  const [desk, setDesk] = useState<Desk>('targets');
  const [targets, setTargets] = useState<SolicitationTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<SessionLogEntry[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listDesk(desk);
      setTargets(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load the ${desk} desk.`);
    } finally {
      setLoading(false);
    }
  }, [desk]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const currentTarget = targets[0] ?? null;

  const logOutcome = useCallback(
    async (intent: Intent, detail: string, extra: Omit<ClassifyPayload, 'queueId' | 'intent' | 'replyText'> = {}) => {
      if (!currentTarget) return;

      // CLARIFY writes nothing (per SOLICITATION_RULEBOOK) — it keeps the
      // conversation on the same target instead of advancing the queue.
      if (intent === 'CLARIFY') {
        setLog((l) => [{ customerName: currentTarget.customerName, intent, detail }, ...l]);
        return;
      }

      await classifyRequest({
        queueId: currentTarget.queueId,
        commercialCustomerId: currentTarget.commercialCustomerId,
        intent,
        replyText: detail,
        ...extra,
      });

      setLog((l) => [{ customerName: currentTarget.customerName, intent, detail }, ...l]);
      setTargets((prev) => prev.filter((t) => t.queueId !== currentTarget.queueId));
    },
    [currentTarget],
  );

  return (
    <SolicitationContext.Provider
      value={{ desk, setDesk, targets, currentTarget, loading, error, log, refresh, logOutcome }}
    >
      {children}
    </SolicitationContext.Provider>
  );
}

export function useSolicitationStore(): SolicitationStore {
  const store = useContext(SolicitationContext);
  if (!store) {
    throw new Error('useSolicitationStore must be used within a SolicitationProvider');
  }
  return store;
}
