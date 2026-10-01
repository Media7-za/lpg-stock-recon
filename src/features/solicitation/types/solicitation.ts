export type QueueStatus = 'PENDING' | 'LEAD' | 'REVIEW_FLAGGED' | 'ON_HOLD' | 'ORDERED' | 'DECLINED';

export type Desk = 'targets' | 'leads' | 'review';

export type CommercialStatus =
  | 'new_prospect'
  | 'active_customer'
  | 'dormant_customer'
  | 'win_back'
  | 'churn_risk'
  | 'lost';

export interface SolicitationTarget {
  queueId: string;
  commercialCustomerId: string;
  status: QueueStatus;
  predictedDueDate: string | null;
  notes: string | null;
  lastContactedAt: string | null;
  customerName: string;
  commercialStatus: CommercialStatus | null;
  avgCycleDays: number | null;
  primaryContact: string | null;
  contactPhone: string | null;
  lastLpgOrderDate: string | null;
}

export type Intent =
  | 'ORDERED'
  | 'SNOOZE'
  | 'NO_ANSWER'
  | 'DECLINED'
  | 'UPDATE_CONTACT'
  | 'CLARIFY'
  | 'ACCOUNT_ON_HOLD'
  | 'IGNORE_INDIVIDUAL'
  | 'CONFIRM_BUSINESS'
  | 'LEAD_CONTACTED'
  | 'LEAD_INTERESTED'
  | 'LEAD_CONVERTED'
  | 'LEAD_DEAD';

export interface ClassifyPayload {
  queueId?: string;
  intent: Intent;
  replyText: string;
  nDays?: number;
  name?: string;
  phone?: string;
  commercialCustomerId?: string;
}

export interface SessionLogEntry {
  customerName: string;
  intent: Intent;
  detail: string;
}
