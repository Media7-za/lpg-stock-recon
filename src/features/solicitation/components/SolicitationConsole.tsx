import { useState } from 'react';
import { useSolicitationStore } from '../state/SolicitationProvider';
import { ClassifyPayload, Desk, Intent } from '../types/solicitation';
import { PressureGauge } from './PressureGauge';
import { IntentPanel } from './IntentPanel';
import { useRouteManifest } from '../../../hooks/useRouteManifest';

type ColorKey = 'sage' | 'steel' | 'muted' | 'clay' | 'amber' | 'blue';

const COLORS: Record<ColorKey, { fg: string; bg: string; border: string }> = {
  sage: { fg: '#7A9B6E', bg: 'rgba(122,155,110,0.12)', border: 'rgba(122,155,110,0.35)' },
  steel: { fg: '#6B87AD', bg: 'rgba(107,135,173,0.12)', border: 'rgba(107,135,173,0.35)' },
  muted: { fg: '#8C8A85', bg: 'rgba(140,138,133,0.12)', border: 'rgba(140,138,133,0.35)' },
  clay: { fg: '#C1735F', bg: 'rgba(184,92,74,0.14)', border: 'rgba(184,92,74,0.4)' },
  amber: { fg: '#E8963D', bg: 'rgba(232,150,61,0.14)', border: 'rgba(232,150,61,0.4)' },
  blue: { fg: '#4A90A4', bg: 'rgba(74,144,164,0.14)', border: 'rgba(74,144,164,0.4)' },
};

const INTENT_META: Record<Intent, { label: string; color: ColorKey }> = {
  ORDERED: { label: 'Ordered', color: 'sage' },
  SNOOZE: { label: 'Snooze', color: 'steel' },
  NO_ANSWER: { label: 'No answer', color: 'muted' },
  DECLINED: { label: 'Declined', color: 'clay' },
  UPDATE_CONTACT: { label: 'Update contact', color: 'steel' },
  CLARIFY: { label: 'Clarify', color: 'amber' },
  ACCOUNT_ON_HOLD: { label: 'Put on hold', color: 'muted' },
  IGNORE_INDIVIDUAL: { label: 'Not a business', color: 'clay' },
  CONFIRM_BUSINESS: { label: 'Confirm business', color: 'sage' },
  LEAD_CONTACTED: { label: 'Contacted', color: 'steel' },
  LEAD_INTERESTED: { label: 'Interested', color: 'blue' },
  LEAD_CONVERTED: { label: 'Ordered', color: 'sage' },
  LEAD_DEAD: { label: 'Dead lead', color: 'clay' },
};

const DESK_INTENTS: Record<Desk, Intent[]> = {
  targets: ['ORDERED', 'SNOOZE', 'NO_ANSWER', 'DECLINED', 'UPDATE_CONTACT', 'ACCOUNT_ON_HOLD', 'IGNORE_INDIVIDUAL', 'CLARIFY'],
  leads: ['LEAD_CONVERTED', 'LEAD_CONTACTED', 'LEAD_INTERESTED', 'LEAD_DEAD', 'UPDATE_CONTACT', 'ACCOUNT_ON_HOLD', 'IGNORE_INDIVIDUAL', 'CLARIFY'],
  review: ['CONFIRM_BUSINESS', 'IGNORE_INDIVIDUAL', 'UPDATE_CONTACT', 'CLARIFY'],
};

const DESK_LABEL: Record<Desk, string> = {
  targets: 'Reorder desk',
  leads: 'Leads desk',
  review: 'Review desk',
};

function statusColor(status: string | null): ColorKey {
  if (status === 'churn_risk') return 'amber';
  if (status === 'dormant_customer') return 'clay';
  if (status === 'win_back') return 'blue';
  return 'steel';
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

function daysBetween(dateStr: string | null): number {
  if (!dateStr) return 0;
  const d = new Date(`${dateStr}T00:00:00Z`);
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function SolicitationConsole() {
  const { desk, setDesk, targets, currentTarget, loading, error, log, logOutcome } = useSolicitationStore();
  const [activeIntent, setActiveIntent] = useState<Intent | null>(null);

  // Lets /solicitation be "Add to Home Screen"-installed as its own named,
  // iconed app, distinct from the main reconciliation system's manifest.
  useRouteManifest({
    manifestHref: '/solicitation-manifest.webmanifest',
    appTitle: 'Solicitation Desk',
    appleTouchIconHref: '/icons/solicitation-apple-touch.png',
  });

  const overdue = currentTarget ? daysBetween(currentTarget.predictedDueDate) : 0;

  const handleSubmit = async (detail: string, extra?: Omit<ClassifyPayload, 'queueId' | 'intent' | 'replyText'>) => {
    if (!activeIntent) return;
    await logOutcome(activeIntent, detail, extra);
    setActiveIntent(null);
  };

  const switchDesk = (next: Desk) => {
    setActiveIntent(null);
    setDesk(next);
  };

  return (
    <div className="min-h-screen bg-background text-text-primary px-4 py-7 pb-16">
      <div className="max-w-[640px] mx-auto">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <span className="font-semibold text-[15px] tracking-wide">SOLICITATION DESK</span>
          <div className="font-mono text-xs text-text-secondary border border-border rounded-full px-3 py-1.5 bg-surface">
            {currentTarget ? `${targets.length} in queue` : loading ? 'Loading…' : 'Queue clear'}
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          {(['targets', 'leads', 'review'] as Desk[]).map((d) => (
            <button
              key={d}
              onClick={() => switchDesk(d)}
              className="text-xs font-semibold uppercase tracking-wider rounded-md px-3 py-2 border cursor-pointer"
              style={
                desk === d
                  ? { color: COLORS.blue.fg, background: COLORS.blue.bg, borderColor: COLORS.blue.border }
                  : { color: '#8C8A85', background: 'transparent', borderColor: '#34333A' }
              }
            >
              {DESK_LABEL[d]}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
            <p className="text-sm font-bold text-amber-400">Couldn't load the {DESK_LABEL[desk].toLowerCase()}</p>
            <p className="text-xs text-text-secondary mt-1">{error}</p>
          </div>
        )}

        {!error && loading && (
          <div className="bg-surface border border-border rounded-xl p-6 animate-pulse">
            <div className="h-5 w-48 bg-surface-elevated rounded mb-3" />
            <div className="h-3 w-32 bg-surface-elevated rounded" />
          </div>
        )}

        {!error && !loading && currentTarget && (
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="font-bold text-[22px] leading-tight mb-2">{currentTarget.customerName}</div>
                <div className="flex gap-1.5 flex-wrap mb-2.5">
                  {currentTarget.commercialStatus && (
                    <Badge color={statusColor(currentTarget.commercialStatus)}>
                      {currentTarget.commercialStatus.replace(/_/g, ' ')}
                    </Badge>
                  )}
                  {currentTarget.avgCycleDays !== null && <Badge>avg cycle {currentTarget.avgCycleDays}d</Badge>}
                </div>
                <div
                  className="flex items-center gap-1.5 text-sm font-mono"
                  style={{ color: currentTarget.contactPhone ? '#F2EEE6' : '#8C8A85' }}
                >
                  {currentTarget.primaryContact ? `${currentTarget.primaryContact} — ` : ''}
                  {currentTarget.contactPhone || 'no contact on file'}
                </div>
              </div>
              <PressureGauge daysOverdue={overdue} />
            </div>

            <div className="mt-4.5 pt-4 border-t border-border">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Last LPG order {currentTarget.lastLpgOrderDate ? `— ${currentTarget.lastLpgOrderDate}` : ''}
              </div>
              <div className="font-mono text-sm text-text-secondary">
                {currentTarget.lastLpgOrderDate ? 'See transaction history for line items.' : 'No LPG order history on file yet.'}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {DESK_INTENTS[desk].map((intent) => {
                const meta = INTENT_META[intent];
                const c = COLORS[meta.color];
                const isActive = activeIntent === intent;
                return (
                  <button
                    key={intent}
                    onClick={() => setActiveIntent(isActive ? null : intent)}
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

            {activeIntent && (
              <IntentPanel intent={activeIntent} onSubmit={handleSubmit} onCancel={() => setActiveIntent(null)} />
            )}
          </div>
        )}

        {!error && !loading && !currentTarget && (
          <div className="bg-surface border border-border rounded-xl p-10 text-center">
            <div className="font-semibold text-lg">Queue clear</div>
            <div className="text-sm text-text-secondary mt-1">
              Nothing waiting on the {DESK_LABEL[desk].toLowerCase()} right now.
            </div>
          </div>
        )}

        {log.length > 0 && (
          <div className="mt-6">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-2.5">Session log</div>
            <div className="flex flex-col gap-1.5">
              {log.map((entry, i) => {
                const meta = INTENT_META[entry.intent];
                const c = COLORS[meta.color];
                return (
                  <div key={i} className="flex items-center gap-2.5 bg-surface border border-border rounded-lg px-3 py-2 text-[12.5px]">
                    <span className="font-semibold min-w-[110px]" style={{ color: c.fg }}>
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
