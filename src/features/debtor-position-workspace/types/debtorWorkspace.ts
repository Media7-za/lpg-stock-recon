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
    exceptions: WorkspaceException[];
  };
  allocationEvidence: AllocationEvidenceEntry[];
  artifacts: DebtorArtifacts;
}
