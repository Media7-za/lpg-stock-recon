import { useState } from 'react';
import { PaymentOutcome } from '../types/paymentCollections';

interface PaymentIntentPanelProps {
  outcome: PaymentOutcome;
  onSubmit: (detail: string, followUpDate?: string) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full bg-background border border-border rounded-md text-text-primary px-3 py-2 font-mono text-sm outline-none focus-visible:border-[#4A90A4]';
const labelClass = 'block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5';
const primaryBtnClass =
  'bg-[#4A90A4] text-[#0E1113] rounded-md px-4 py-2 font-semibold text-sm cursor-pointer hover:opacity-90';
const ghostBtnClass =
  'bg-transparent text-text-secondary border border-border rounded-md px-4 py-2 font-semibold text-sm cursor-pointer hover:border-text-secondary';

function addDays(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function PaymentIntentPanel({ outcome, onSubmit, onCancel }: PaymentIntentPanelProps) {
  const [note, setNote] = useState('');
  const [followUpDays, setFollowUpDays] = useState(outcome === 'PAYMENT_PLAN_AGREED' ? 14 : 7);

  const submit = () => {
    switch (outcome) {
      case 'PAYMENT_RECEIVED':
        onSubmit(note || 'Payment received');
        break;
      case 'STILL_OUTSTANDING':
        onSubmit(note || 'Still outstanding', addDays(Number(followUpDays) || 7));
        break;
      case 'ESCALATED':
        onSubmit(note || 'Escalated to manager/legal');
        break;
      case 'PAYMENT_PLAN_AGREED':
        onSubmit(note || 'Payment plan agreed', addDays(Number(followUpDays) || 14));
        break;
    }
  };

  return (
    <div className="mt-3.5 p-4 bg-surface-elevated border border-border rounded-lg">
      {outcome === 'PAYMENT_RECEIVED' && (
        <>
          <label className={labelClass}>Note (optional)</label>
          <input
            className={inputClass}
            placeholder="e.g. paid in full via EFT"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          />
        </>
      )}

      {outcome === 'STILL_OUTSTANDING' && (
        <>
          <label className={labelClass}>Note</label>
          <input
            className={inputClass}
            placeholder="e.g. promised to pay by Friday"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          />
          <label className={`${labelClass} mt-2.5`}>Follow up in (days)</label>
          <input
            className={`${inputClass} w-24`}
            type="number"
            value={followUpDays}
            onChange={(e) => setFollowUpDays(Number(e.target.value))}
          />
        </>
      )}

      {outcome === 'ESCALATED' && (
        <>
          <label className={labelClass}>Reason for escalation</label>
          <input
            className={inputClass}
            placeholder="e.g. no response after 3 attempts, needs manager"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          />
        </>
      )}

      {outcome === 'PAYMENT_PLAN_AGREED' && (
        <>
          <label className={labelClass}>Plan details</label>
          <input
            className={inputClass}
            placeholder="e.g. R1000/week starting Monday"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          />
          <label className={`${labelClass} mt-2.5`}>Check back in (days)</label>
          <input
            className={`${inputClass} w-24`}
            type="number"
            value={followUpDays}
            onChange={(e) => setFollowUpDays(Number(e.target.value))}
          />
        </>
      )}

      <div className="flex gap-2 mt-3.5">
        <button onClick={submit} className={primaryBtnClass}>
          Log outcome
        </button>
        <button onClick={onCancel} className={ghostBtnClass}>
          Cancel
        </button>
      </div>
    </div>
  );
}
