import { useEffect, useMemo, useState } from 'react';
import type { KnowledgeBundle } from '../types/knowledgeBundle';

const BUNDLE_URL = (debtorCode: string) => `/debtor-knowledge/${debtorCode}/knowledge-bundle.json`;

export function useKnowledgeBundle(debtorCode: string | undefined) {
  const [bundle, setBundle] = useState<KnowledgeBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!debtorCode) {
      setBundle(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(BUNDLE_URL(debtorCode))
      .then((res) => {
        if (!res.ok) throw new Error(`Knowledge bundle not found for ${debtorCode}`);
        return res.json() as Promise<KnowledgeBundle>;
      })
      .then((data) => {
        if (!cancelled) setBundle(data);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setBundle(null);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debtorCode]);

  const indexes = useMemo(() => {
    if (!bundle) return null;

    const relationshipsById = new Map(bundle.relationships.map((r) => [r.id, r]));
    const casesById = new Map(bundle.cases.map((c) => [c.allocationGroupId, c]));
    const invoicesByKey = new Map(
      Object.values(bundle.entities.invoices).map((inv) => [inv.docKey, inv])
    );
    const paymentsByKey = new Map(
      Object.values(bundle.entities.payments).map((p) => [p.docKey, p])
    );
    const creditNotesByKey = new Map(
      Object.values(bundle.entities.creditNotes).map((cn) => [cn.docKey, cn])
    );

    return {
      relationshipsById,
      casesById,
      invoicesByKey,
      paymentsByKey,
      creditNotesByKey,
    };
  }, [bundle]);

  return { bundle, loading, error, indexes };
}

export async function probeKnowledgeBundle(debtorCode: string): Promise<boolean> {
  try {
    const res = await fetch(BUNDLE_URL(debtorCode), { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}
