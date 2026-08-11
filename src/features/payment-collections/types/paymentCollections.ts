export type PaymentStatus = 'OUTSTANDING' | 'PAYMENT_PLAN' | 'ESCALATED' | 'PAID';

export type PaymentOutcome = 'PAYMENT_RECEIVED' | 'STILL_OUTSTANDING' | 'ESCALATED' | 'PAYMENT_PLAN_AGREED';

export interface OutstandingPayment {
  id: string;
  commercialCustomerId: string;
  amountDue: number;
  statementUrl: string | null;
  statementFilename: string | null;
  status: PaymentStatus;
  followUpDate: string | null;
  notes: string | null;
  lastContactedAt: string | null;
  customerName: string;
  primaryContact: string | null;
  contactPhone: string | null;
}

export interface CustomerSearchResult {
  id: string;
  customerName: string;
  contactPhone: string | null;
}

export interface PaymentSessionLogEntry {
  customerName: string;
  outcome: PaymentOutcome;
  detail: string;
}

export interface ClassifyPaymentPayload {
  paymentId: string;
  outcome: PaymentOutcome;
  note: string;
  followUpDate?: string;
}
