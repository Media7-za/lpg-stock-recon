// --- ERP Models ---
export interface ERPItem {
  sku: string;
  category: string;
  group: string;
  description: string;
  uom: string;
  quantity: number;
}

export interface ERPSnapshot {
  id: string;
  timestamp: Date;
  exportTime: Date;
  snapshotType: 'AM' | 'PM';
  data: ERPItem[];
}

// --- PWA Physical Count Models ---
export type CylinderSize = '9kg' | '14kg' | '19kg' | 'SV' | 'DV';
export type CountCategory = 'fulls' | 'empties';

// A single item count
export interface CountEntry {
  category: CountCategory;
  size: CylinderSize;
  brand: string;      // e.g., 'Oryx', 'Easigas', 'Multibrand'
  sku?: string;       // explicit SKU if known (e.g. '9.4', '901')
  quantity: number;
}

export interface ZoneCount {
  id: string;
  name: string;
  entries: CountEntry[];
}

export interface PhysicalCountSession {
  id: string;
  timestamp: Date;
  sessionType: 'AM' | 'PM';
  status: 'in_progress' | 'completed';
  current_state?: 'OPEN' | 'COUNTING' | 'SYNCED' | 'RECONCILING' | 'RECONCILED' | 'REVIEWED' | 'FAILED' | 'CLOSED';
  zones: ZoneCount[];
  counterName?: string;
  notes?: string;
  syncedAt?: Date;
}

// --- Movement Data Models ---
export interface MovementItem {
  date: string;
  sku: string;
  description: string;
  quantity: number;
  transactionType: "Invoice" | "GRV" | "Credit Note";
  reference?: string;
}

export interface MovementData {
  id: string;
  timestamp: Date;
  period: string; // e.g. "2026-02-28"
  movements: MovementItem[];
  syncedAt?: Date;
}

// --- Reconciliation Models ---
export interface ReconciliationVariance {
  sku: string;
  description: string;
  systemSOH: number;               // From PM ERP Snapshot
  morningPhysical: number;         // From AM Physical
  afternoonPhysical: number;       // From PM Physical
  systemMovement: number;          // Net from CURRENT.TXT (GRV/Credit = +, Invoice = -)
  expectedAfternoon: number;       // morningPhysical + systemMovement

  // The Three-Tier Logic Results
  sohVariance: number;             // afternoonPhysical - systemSOH
  movementVariance: number;        // afternoonPhysical - expectedAfternoon
  timelineVariance: number;        // (afternoonPhysical - morningPhysical) - systemMovement

  status: 'match' | 'minor' | 'critical';

  // Investigation
  investigationNote?: string;
  resolutionStatus?: 'open' | 'investigating' | 'resolved' | 'written_off';
}


export interface ReconciliationResult {
  depositReconciliation: ReconciliationVariance[];
  contentReconciliation: ReconciliationVariance[];
  totalDepositVariance: number;
  totalContentVariance: number;
  criticalCount: number;
  minorCount: number;
}

// --- Investigation / Notes ---
export interface DiscrepancyNote {
  id: string;
  reconciliationReportId: string;
  sku: string;
  note: string;
  resolutionStatus: 'open' | 'investigating' | 'resolved' | 'written_off';
  createdAt: Date;
  updatedAt: Date;
}

export interface ReconciliationReport {
  id: string;
  timestamp: Date;
  status: 'draft' | 'finalized';

  morningPhysicalId: string;
  afternoonPhysicalId: string;
  morningErpId: string;
  afternoonErpId: string;
  movementDataId?: string;

  results: ReconciliationResult;
}
// --- Granular Reconciliation Models (Relational) ---

export type EntryType = 'Invoice' | 'Payment' | 'Crd Note' | 'GRV' | 'STK XFER' | 'Journal' | 'Deb Note';

export interface Account {
  id: string;
  accountNo: string;
  currentName: string;
  accountType?: string;
}

export interface Product {
  id: string;
  stockNo: string;
  description: string;
  category?: string;
  group?: string;
}

export interface TransactionHeader {
  id: string;
  entryType: EntryType;
  period: number;
  accountNo: string;
  accountName: string;
  docNo: string;
  invNo?: string;
  date: Date;
  amount: number;
  taxAmount: number;
  isPaid: boolean;

  lineItems?: TransactionLineItem[];
  allocationsSource?: AllocationEvent[];
  allocationsTarget?: AllocationEvent[];
}

export interface TransactionLineItem {
  id: string;
  transactionId: string;
  docNo: string;
  stockNo: string;
  description: string;
  quantity: number;
  retailPrice: number;
  costPrice: number;
  category?: string;
}

export type AllocationEventType = 'ALLOCATE' | 'DEALLOCATE' | 'ADJUST';

export interface AllocationEvent {
  id: string;
  sourceId: string;
  targetId: string;
  amount: number;
  eventType: AllocationEventType;
  createdAt: Date;
}

// --- Dispatch Models ---
export interface DispatchEligibleInvoice {
  doc_no: string;
  tx_date: string;
  account_no: string;
  account_name: string;
  amount_inc: number;
  whatsapp_number: string | null;
  last_status: 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED' | null;
  last_sent_at: string | null;
}

export interface DispatchLogEntry {
  id: string;
  doc_no: string;
  sent_at: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED';
  error_details?: string;
  signed_doc_url?: string;
  merged_doc_url?: string;
  actor_id?: string;
}

export interface Customer {
  account_code: string;
  name: string;
  whatsapp_number: string;
}
