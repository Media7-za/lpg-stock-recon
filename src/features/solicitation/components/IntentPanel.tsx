import { useState } from 'react';
import { ClassifyPayload, Intent } from '../types/solicitation';

interface IntentPanelProps {
  intent: Intent;
  onSubmit: (detail: string, extra?: Omit<ClassifyPayload, 'queueId' | 'intent' | 'replyText'>) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full bg-background border border-border rounded-md text-text-primary px-3 py-2 font-mono text-sm outline-none focus-visible:border-[#4A90A4]';
const labelClass = 'block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5';
const primaryBtnClass =
  'bg-[#4A90A4] text-[#0E1113] rounded-md px-4 py-2 font-semibold text-sm cursor-pointer hover:opacity-90';
const ghostBtnClass =
  'bg-transparent text-text-secondary border border-border rounded-md px-4 py-2 font-semibold text-sm cursor-pointer hover:border-text-secondary';

export function IntentPanel({ intent, onSubmit, onCancel }: IntentPanelProps) {
  const [snoozeDays, setSnoozeDays] = useState(7);
  const [orderText, setOrderText] = useState('');
  const [note, setNote] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const submit = () => {
    switch (intent) {
      case 'SNOOZE':
        onSubmit(`Snoozed ${snoozeDays} day(s)${note ? ` — ${note}` : ''}`, { nDays: Number(snoozeDays) || 7 });
        break;
      case 'NO_ANSWER':
        onSubmit('No answer, retry tomorrow');
        break;
      case 'ORDERED':
      case 'LEAD_CONVERTED':
        onSubmit(orderText || 'Order details not entered');
        break;
      case 'DECLINED':
        onSubmit(note ? `Declined — ${note}` : 'Declined');
        break;
      case 'LEAD_DEAD':
        onSubmit(note ? `Lead dead — ${note}` : 'Lead dead');
        break;
      case 'ACCOUNT_ON_HOLD':
        onSubmit(note ? `On hold — ${note}` : 'On hold');
        break;
      case 'IGNORE_INDIVIDUAL':
        onSubmit(note ? `Excluded (individual) — ${note}` : 'Excluded — looks like an individual, not a business');
        break;
      case 'CONFIRM_BUSINESS':
        onSubmit(note ? `Confirmed business — ${note}` : 'Confirmed business');
        break;
      case 'LEAD_CONTACTED':
        onSubmit(note || 'Contacted, no commitment yet');
        break;
      case 'LEAD_INTERESTED':
        onSubmit(note || 'Expressed interest');
        break;
      case 'UPDATE_CONTACT':
        onSubmit(note || 'Contact updated', { name: contactName || undefined, phone: contactPhone || undefined });
        break;
      case 'CLARIFY':
        onSubmit(note || 'Needs clarification');
        break;
      default:
        onSubmit(note || 'No reply');
    }
  };

  return (
    <div className="mt-3.5 p-4 bg-surface-elevated border border-border rounded-lg">
      {(intent === 'ORDERED' || intent === 'LEAD_CONVERTED') && (
        <>
          <label className={labelClass}>Order detail</label>
          <input
            className={inputClass}
            placeholder="e.g. 5 x 9kg"
            value={orderText}
            onChange={(e) => setOrderText(e.target.value)}
            autoFocus
          />
          <div className="text-[11px] text-text-secondary mt-2">
            Reminder: this closes the queue row only — confirm the sale is entered in POS separately.
          </div>
        </>
      )}

      {intent === 'SNOOZE' && (
        <>
          <label className={labelClass}>Snooze for (days)</label>
          <input
            className={`${inputClass} w-24`}
            type="number"
            value={snoozeDays}
            onChange={(e) => setSnoozeDays(Number(e.target.value))}
            autoFocus
          />
          <label className={`${labelClass} mt-2.5`}>Reason (optional)</label>
          <input
            className={inputClass}
            placeholder="e.g. appliances broke down"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </>
      )}

      {intent === 'NO_ANSWER' && (
        <div className="text-[12.5px] text-text-secondary">Pushes due date to tomorrow. No other fields needed.</div>
      )}

      {intent === 'UPDATE_CONTACT' && (
        <>
          <label className={labelClass}>Contact name</label>
          <input
            className={inputClass}
            placeholder="e.g. Sarah"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            autoFocus
          />
          <label className={`${labelClass} mt-2.5`}>Phone number</label>
          <input
            className={inputClass}
            placeholder="e.g. 082 123 4567"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </>
      )}

      {(intent === 'DECLINED' ||
        intent === 'CLARIFY' ||
        intent === 'ACCOUNT_ON_HOLD' ||
        intent === 'IGNORE_INDIVIDUAL' ||
        intent === 'CONFIRM_BUSINESS' ||
        intent === 'LEAD_DEAD' ||
        intent === 'LEAD_CONTACTED' ||
        intent === 'LEAD_INTERESTED') && (
        <>
          <label className={labelClass}>
            {intent === 'DECLINED'
              ? 'Reason (sets status to lost)'
              : intent === 'CLARIFY'
              ? 'What needs clarifying'
              : intent === 'ACCOUNT_ON_HOLD'
              ? 'Reason for hold'
              : intent === 'IGNORE_INDIVIDUAL'
              ? 'Note (sets status to lost, permanent)'
              : intent === 'CONFIRM_BUSINESS'
              ? 'Note (optional) — moves to the reorder desk'
              : intent === 'LEAD_DEAD'
              ? 'Reason (sets status to lost, permanent)'
              : 'Note (optional)'}
          </label>
          <input
            className={inputClass}
            placeholder={
              intent === 'DECLINED'
                ? 'e.g. moved to new supplier'
                : intent === 'CLARIFY'
                ? 'e.g. unclear if this is a business'
                : intent === 'ACCOUNT_ON_HOLD'
                ? 'e.g. account in dispute with debtors'
                : 'e.g. spoke to owner, said call back next month'
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
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
