export type DebtorWorkspaceStatus =
  | 'clean'
  | 'cylinder_variance'
  | 'erp_exception'
  | 'pending_review'
  | 'approved_internal'
  | 'customer_ready'
  | 'sent';

export type ExceptionSeverity = 'info' | 'warning' | 'critical';

export type AllocationConfidence = 'Confirmed' | 'Probable' | 'Assumed' | 'Exception';

export interface CustodyLine {
  sku: string;
  label: string;
  qty: number;
  depositRate: number;
  exposure: number;
}

export interface WorkspaceException {
  type: string;
  severity: ExceptionSeverity;
  title: string;
  description: string;
}

export type StatementExceptionType = 'SOURCE_GAP' | 'VARIANCE' | 'CUSTODY' | 'CLASSIFICATION' | 'OTHER';

/**
 * v5 statement-generator exceptions use the doctrine's epistemic vocabulary
 * (DEBTORS_DOCTRINE.md §6: PROVEN/ASSERTED/ASSUMED), not v4's UI-severity
 * vocabulary (ExceptionSeverity: info/warning/critical) — these are different
 * axes (truth-quality vs. display-priority), not a renaming of the same thing.
 *
 * Boundary: a StatementException describes a Statement-of-Account reconciliation
 * gap. It is NOT a D18 collections blocker and must never be copied into
 * `collections.blockers` automatically — that requires a separate, evidence-backed
 * assessment under D18, not an inference from statement exceptions.
 */
export interface StatementException {
  type: StatementExceptionType;
  basis: 'PROVEN' | 'ASSERTED' | 'ASSUMED';
  status: 'open' | 'resolved';
  description: string;
}

export interface AllocationEvidenceEntry {
  event: string;
  date: string;
  classification: AllocationConfidence;
  evidenceSource: string;
  confidence: string;
  summary: string;
}

export interface DebtorArtifacts {
  statementMarkdown?: string;
  baselineMarkdown?: string;
  defaultHtml?: string;
  internalHtml?: string;
  customerHtml?: string;
  exportFile?: string;
}

export interface DebtorWorkspaceState {
  debtorCode: string;
  debtorName: string;
  period: { from: string; to: string };
  version: 'v4' | 'v5';
  /**
   * Application workflow status only — where this generated statement sits in the
   * human review/send workflow. It does NOT represent constitutional reconciliation
   * state (`project.json.reconState`), collections eligibility (D17/D18), or ingest
   * health (`ingestGate.displayStatus`). A workspace may legitimately be
   * `pending_review` even when reconciliation is constitutionally closed — the two
   * questions are independent and must never be inferred from one another.
   */
  workspaceStatus: DebtorWorkspaceStatus;
  lastGeneratedAt?: string;
  financialPosition: {
    lpgGasDebt: number;
    cylinderFinancialBalance: number;
    totalDebtorBalance: number;
    erpStatedBalance: number;
    erpVariance: number;
  };
  custodyPosition: {
    totalCustodyExposure: number;
    lines: CustodyLine[];
  };
  reconciliationPosition: {
    cylinderVariance: number;
    erpVariance: number;
    /** v5 only — combined (1A+1B) vs. running-balance tie-out. Absent on v4. */
    subLedgerVariance?: number;
    /** v4 emits WorkspaceException[] (UI severity); v5 emits StatementException[] (epistemic basis). */
    exceptions: WorkspaceException[] | StatementException[];
  };
  allocationEvidence: AllocationEvidenceEntry[];
  artifacts: DebtorArtifacts;
}
