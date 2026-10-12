import { useState } from 'react';
import { usePaymentCollectionsStore } from '../state/PaymentCollectionsProvider';
import { PaymentOutcome } from '../types/paymentCollections';
import { PaymentAdminForm } from './PaymentAdminForm';
import { PaymentIntentPanel } from './PaymentIntentPanel';

type ColorKey = 'sage' | 'steel' | 'muted' | 'clay' | 'amber';

const COLORS: Record<ColorKey, { fg: string; bg: string; border: string }> = {
  sage: { fg: '#7A9B6E', bg: 'rgba(122,155,110,0.12)', border: 'rgba(122,155,110,0.35)' },
  steel: { fg: '#6B87AD', bg: 'rgba(107,135,173,0.12)', border: 'rgba(107,135,173,0.35)' },
  muted: { fg: '#8C8A85', bg: 'rgba(140,138,133,0.12)', border: 'rgba(140,138,133,0.35)' },
  clay: { fg: '#C1735F', bg: 'rgba(184,92,74,0.14)', border: 'rgba(184,92,74,0.4)' },
  amber: { fg: '#E8963D', bg: 'rgba(232,150,61,0.14)', border: 'rgba(232,150,61,0.4)' },
};

const OUTCOME_META: Record<PaymentOutcome, { label: string; color: ColorKey }> = {
  PAYMENT_RECEIVED: { label: 'Payment received', color: 'sage' },
  STILL_OUTSTANDING: { label: 'Still outstanding', color: 'steel' },
  ESCALATED: { label: 'Escalate', color: 'clay' },
  PAYMENT_PLAN_AGREED: { label: 'Payment plan agreed', color: 'amber' },
};

const STATUS_META: Record<string, { label: string; color: ColorKey }> = {
  OUTSTANDING: { label: 'outstanding', color: 'clay' },
  PAYMENT_PLAN: { label: 'payment plan', color: 'amber' },
  ESCALATED: { label: 'escalated', color: 'clay' },
};

function formatCurrency(amount: number): string {
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Badge({ children, color = 'muted' }: { children: React.ReactNode; color?: ColorKey }) {
  const c = COLORS[color];
  return (
    <span
      className="text-[11px] font-semibold uppercase tracking-wider rounded px-2 py-0.5 inline-block"
      style={{ color: c.fg, background: c.bg, border: `1px solid ${c.border}` }}
    >
      {children}
    </span>
  );
}

export function PaymentDesk() {
  const { records, currentRecord, loading, error, log, logOutcome } = usePaymentCollectionsStore();
  const [activeOutcome, setActiveOutcome] = useState<PaymentOutcome | null>(null);
  const [showAdminForm, setShowAdminForm] = useState(false);

  const handleSubmit = async (detail: string, followUpDate?: string) => {
    if (!activeOutcome) return;
    await logOutcome(activeOutcome, detail, followUpDate);
    setActiveOutcome(null);
  };

  const statusMeta = currentRecord ? STATUS_META[currentRecord.status] : null;

  return (
    <div className="min-h-screen bg-background text-text-primary px-4 py-7 pb-16">
      <div className="max-w-[640px] mx-auto">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <span className="font-semibold text-[15px] tracking-wide">PAYMENT COLLECTIONS</span>
          <div className="flex items-center gap-2">
            <div className="font-mono text-xs text-text-secondary border border-border rounded-full px-3 py-1.5 bg-surface">
              {currentRecord ? `${records.length} outstanding` : loading ? 'Loading…' : 'None outstanding'}
            </div>
            <button
              onClick={() => setShowAdminForm((v) => !v)}
              className="text-xs font-semibold uppercase tracking-wider rounded-md px-3 py-2 border cursor-pointer"
              style={{ color: COLORS.steel.fg, background: COLORS.steel.bg, borderColor: COLORS.steel.border }}
            >
              {showAdminForm ? 'Close' : '+ Add outstanding payment'}
            </button>
          </div>
        </div>

        {showAdminForm && <PaymentAdminForm onClose={() => setShowAdminForm(false)} />}

        {error && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
            <p className="text-sm font-bold text-amber-400">Couldn't load outstanding payments</p>
            <p className="text-xs text-text-secondary mt-1">{error}</p>
          </div>
        )}

        {!error && loading && (
          <div className="bg-surface border border-border rounded-xl p-6 animate-pulse">
            <div className="h-5 w-48 bg-surface-elevated rounded mb-3" />
            <div className="h-3 w-32 bg-surface-elevated rounded" />
          </div>
        )}

        {!error && !loading && currentRecord && (
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="font-bold text-[22px] leading-tight mb-2">{currentRecord.customerName}</div>
                <div className="flex gap-1.5 flex-wrap mb-2.5">
                  {statusMeta && <Badge color={statusMeta.color}>{statusMeta.label}</Badge>}
                  {currentRecord.followUpDate && <Badge>follow up {currentRecord.followUpDate}</Badge>}
                </div>
                <div
                  className="flex items-center gap-1.5 text-sm font-mono"
                  style={{ color: currentRecord.contactPhone ? '#F2EEE6' : '#8C8A85' }}
                >
                  {currentRecord.primaryContact ? `${currentRecord.primaryContact} — ` : ''}
                  {currentRecord.contactPhone || 'no contact on file'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-2xl font-semibold" style={{ color: COLORS.clay.fg }}>
                  {formatCurrency(currentRecord.amountDue)}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-text-secondary mt-0.5">amount due</div>
              </div>
            </div>

            {currentRecord.statementUrl && (
              <div className="mt-4 pt-4 border-t border-border">
                <a
                  href={currentRecord.statementUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold underline"
                  style={{ color: COLORS.steel.fg }}
                >
                  View statement of account{currentRecord.statementFilename ? ` (${currentRecord.statementFilename})` : ''}
                </a>
              </div>
            )}

            {currentRecord.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Last note
                </div>
                <div className="text-sm text-text-secondary">{currentRecord.notes}</div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(OUTCOME_META) as PaymentOutcome[]).map((outcome) => {
                const meta = OUTCOME_META[outcome];
                const c = COLORS[meta.color];
                const isActive = activeOutcome === outcome;
                return (
                  <button
                    key={outcome}
                    onClick={() => setActiveOutcome(isActive ? null : outcome)}
                    className="text-[12.5px] font-semibold rounded-md px-3 py-2 border cursor-pointer transition-colors"
                    style={{
                      color: c.fg,
                      background: isActive ? c.bg : 'transparent',
                      borderColor: isActive ? c.border : '#34333A',
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>

            {activeOutcome && (
              <PaymentIntentPanel outcome={activeOutcome} onSubmit={handleSubmit} onCancel={() => setActiveOutcome(null)} />
            )}
          </div>
        )}

        {!error && !loading && !currentRecord && (
          <div className="bg-surface border border-border rounded-xl p-10 text-center">
            <div className="font-semibold text-lg">Nothing outstanding</div>
            <div className="text-sm text-text-secondary mt-1">
              No unresolved outstanding-payment records right now.
            </div>
          </div>
        )}

        {log.length > 0 && (
          <div className="mt-6">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-2.5">Session log</div>
            <div className="flex flex-col gap-1.5">
              {log.map((entry, i) => {
                const meta = OUTCOME_META[entry.outcome];
                const c = COLORS[meta.color];
                return (
                  <div key={i} className="flex items-center gap-2.5 bg-surface border border-border rounded-lg px-3 py-2 text-[12.5px]">
                    <span className="font-semibold min-w-[150px]" style={{ color: c.fg }}>
                      {meta.label}
                    </span>
                    <span className="text-text-primary flex-1">{entry.customerName}</span>
                    <span className="text-text-secondary font-mono text-[11.5px] truncate max-w-[220px]">{entry.detail}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
