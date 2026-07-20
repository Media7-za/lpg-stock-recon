export function formatZAR(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value < 0 ? `R-${formatted}` : `R${formatted}`;
}

export function docKeyFromParam(param: string | undefined): string {
  if (!param) return '';
  return param.replace(/^0+/, '') || '0';
}

export function findInvoiceDoc(bundle: { entities: { invoices: Record<string, { docKey: string; doc: string }> } }, docKey: string) {
  return Object.values(bundle.entities.invoices).find((inv) => inv.docKey === docKey)?.doc ?? docKey.padStart(8, '0');
}

export function findPaymentDoc(bundle: { entities: { payments: Record<string, { docKey: string; doc: string }> } }, docKey: string) {
  return Object.values(bundle.entities.payments).find((p) => p.docKey === docKey)?.doc ?? docKey.padStart(8, '0');
}
