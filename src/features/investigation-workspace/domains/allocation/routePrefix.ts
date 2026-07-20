export function investigationBasePath(debtorCode: string): string {
  return `/debtors/${debtorCode}/investigate`;
}

export function casePath(debtorCode: string, caseId: string): string {
  return `${investigationBasePath(debtorCode)}/cases/${encodeURIComponent(caseId)}`;
}

export function relationshipPath(debtorCode: string, relationshipId: string): string {
  return `${investigationBasePath(debtorCode)}/relationships/${encodeURIComponent(relationshipId)}`;
}

export function invoicePath(debtorCode: string, docKey: string): string {
  return `${investigationBasePath(debtorCode)}/invoices/${docKey}`;
}

export function paymentPath(debtorCode: string, docKey: string): string {
  return `${investigationBasePath(debtorCode)}/payments/${docKey}`;
}

export function creditNotePath(debtorCode: string, docKey: string): string {
  return `${investigationBasePath(debtorCode)}/credit-notes/${docKey}`;
}
