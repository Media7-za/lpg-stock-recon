export function docKey(paddedOrPlain) {
  const raw = String(paddedOrPlain ?? '').trim();
  if (!raw) return '';
  const stripped = raw.replace(/^0+/, '');
  return stripped || '0';
}

export function docPadded(key) {
  const stripped = docKey(key);
  return stripped.padStart(8, '0');
}

export function docLabel(key) {
  return docKey(key);
}
