export type DoctrineTier = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' | 'Tier 5';

export type CaseHealth = 'healthy' | 'needs_review' | 'conflict' | 'incomplete';

export type CaseLifecycle = 'new' | 'investigating' | 'resolved' | 'exception' | 'archived';

export type EvidenceResult = 'PASS' | 'FAIL' | 'WARN' | 'NA';

export type EvidenceType =
  | 'OPEN_BALANCE'
  | 'ERP_REFERENCE'
  | 'ROUNDING'
  | 'REVIEW_FLAG'
  | 'ALLOCATION_EDGE';

export interface EvidenceProvenance {
  source: string;
  column?: string;
  derivedBy: string;
  runner?: string;
}

export interface EvidenceItem {
  type: EvidenceType;
  result: EvidenceResult;
  detail?: string;
  provenance: EvidenceProvenance;
}

export interface EntityRef {
  kind: 'payment' | 'invoice' | 'credit_note';
  doc: string;
  docKey: string;
}

export interface Relationship {
  id: string;
  from: EntityRef;
  to: EntityRef;
  amount: number;
  paymentSliceAmount: number;
  doctrine: DoctrineTier;
  confidence: 'Confirmed' | 'Probable' | 'Exception';
  allocationType: string;
  targetLane: string;
  evidence: EvidenceItem[];
  reviewRequired: boolean;
  sourceEdgeId: string;
  paymentDate: string;
  batchRef: string;
  statNo: string;
  notes: string;
  source: EvidenceProvenance;
}

export interface InvestigationCase {
  allocationGroupId: string;
  title: string;
  health: CaseHealth;
  lifecycle: CaseLifecycle;
  relationshipIds: string[];
  primaryInvoiceDoc: string | null;
  primaryPaymentDoc: string | null;
  openBalance: number;
  paidAmount: number;
}

export interface InvoiceEntity {
  doc: string;
  docKey: string;
  entryType: string;
  txDate: string;
  lanes: string[];
  amountIncl: number;
  amountExcl: number;
  lineCount: number;
  isLpg: boolean;
  isCyl: boolean;
}

export interface PaymentEntity {
  doc: string;
  docKey: string;
  paymentDate: string;
  batchRef: string;
  statNo: string;
  totalAmount: number;
  sliceCount: number;
  relationshipCount: number;
}

export interface CreditNoteEntity {
  doc: string;
  docKey: string;
  entryType: string;
  txDate: string;
  lanes: string[];
  amountIncl: number;
  amountExcl: number;
  lineCount: number;
}

export interface WorkspaceSummary {
  relationshipCount: number;
  caseCount: number;
  outstandingCount: number;
  outstandingAmount: number;
  confirmedAllocations: number;
  openBalanceMatches: number;
  exceptionCount: number;
  healthCounts: Record<CaseHealth, number>;
  totalDebtorBalance: number | null;
}

export interface OutstandingItem {
  invoiceDoc: string;
  invoiceDocKey: string;
  txDate: string;
  engineOpen: number;
  paid: number;
  netTarget: number;
  caseId: string;
}

export interface ExceptionItem {
  relationshipId: string;
  sourceEdgeId: string;
  paymentDocKey: string;
  invoiceDocKey: string | null;
  allocationType: string;
  confidence: string;
  notes: string;
  caseId: string | null;
}

export interface TimelineBucket {
  period: string;
  edgeCount: number;
  allocatedAmount: number;
}

export interface SearchIndexEntry {
  id: string;
  kind: 'invoice' | 'payment' | 'credit_note' | 'case' | 'relationship' | 'doctrine' | 'stat_batch';
  label: string;
  route: string;
  keywords: string[];
}

export interface DecisionEntry {
  id: string;
  caseId: string;
  subject: string;
  decision: string;
  reason: string;
  approvedBy?: string;
  decidedAt: string;
  relationshipIds?: string[];
}

export interface KnowledgeBundle {
  schemaVersion: '1.0';
  domain: 'allocation';
  debtorCode: string;
  debtorName: string;
  generatedAt: string;
  compiledBy: string;
  relationships: Relationship[];
  cases: InvestigationCase[];
  entities: {
    invoices: Record<string, InvoiceEntity>;
    payments: Record<string, PaymentEntity>;
    creditNotes: Record<string, CreditNoteEntity>;
  };
  views: {
    summary: WorkspaceSummary;
    outstanding: OutstandingItem[];
    exceptions: ExceptionItem[];
    timelineBuckets: TimelineBucket[];
    recentRelationships: Array<{
      id: string;
      paymentDate: string;
      fromDocKey: string;
      toDocKey: string;
      amount: number;
      allocationType: string;
    }>;
    recentCases: Array<{
      allocationGroupId: string;
      title: string;
      health: CaseHealth;
      lifecycle: CaseLifecycle;
      relationshipCount: number;
    }>;
    needsReviewCases: InvestigationCase[];
    largestOutstanding: OutstandingItem[];
    searchIndex: SearchIndexEntry[];
  };
  decisionLog: DecisionEntry[];
}

export type WorkspaceSelection =
  | { kind: 'case'; caseId: string }
  | { kind: 'invoice'; docKey: string }
  | { kind: 'payment'; docKey: string }
  | { kind: 'relationship'; relationshipId: string }
  | null;
