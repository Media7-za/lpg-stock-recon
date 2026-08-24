// Auto-match logic for Slice B — Card Statement Reconciliation.
// docs/Card-Recon/Dev_Plan.md Section 3. Pure logic, no Supabase calls,
// so it's independently unit-testable (mirrors reconciliationEngine.ts).

export interface MatchableStatementLine {
  id: string;
  date: string; // ISO date (yyyy-MM-dd)
  amount: number;
}

export interface MatchableLedgerEntry {
  id: string;
  date: string;
  amount: number;
}

export type AutoMatchMethod = 'AUTO_EXACT' | 'AUTO_FUZZY';

export interface AutoMatchResult {
  statementLineId: string;
  ledgerEntryId: string;
  matchMethod: AutoMatchMethod;
}

// Not specified anywhere in the locked docs — a reasonable default
// pending PM confirmation, same status as MAX_PDF_SIZE_BYTES in
// receiptProcessing.ts.
export const FUZZY_DATE_WINDOW_DAYS = 3;

const AMOUNT_EPSILON = 0.005; // guards against float round-trip noise, not real cent differences

function amountsMatch(a: number, b: number): boolean {
  return Math.abs(a - b) < AMOUNT_EPSILON;
}

function daysBetween(a: string, b: string): number {
  const diffMs = Math.abs(new Date(`${a}T00:00:00Z`).getTime() - new Date(`${b}T00:00:00Z`).getTime());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// Greedy two-pass matcher: AUTO_EXACT claims first (amount + date exact),
// then AUTO_FUZZY fills remaining unclaimed lines (amount exact, date
// within FUZZY_DATE_WINDOW_DAYS, closest date wins ties). Each line and
// each entry can only be claimed once.
export function computeAutoMatches(
  statementLines: MatchableStatementLine[],
  ledgerEntries: MatchableLedgerEntry[]
): AutoMatchResult[] {
  const results: AutoMatchResult[] = [];
  const claimedEntryIds = new Set<string>();
  const claimedLineIds = new Set<string>();

  for (const line of statementLines) {
    const match = ledgerEntries.find(
      (e) => !claimedEntryIds.has(e.id) && amountsMatch(e.amount, line.amount) && e.date === line.date
    );
    if (match) {
      results.push({ statementLineId: line.id, ledgerEntryId: match.id, matchMethod: 'AUTO_EXACT' });
      claimedEntryIds.add(match.id);
      claimedLineIds.add(line.id);
    }
  }

  for (const line of statementLines) {
    if (claimedLineIds.has(line.id)) continue;
    const candidates = ledgerEntries
      .filter(
        (e) =>
          !claimedEntryIds.has(e.id) &&
          amountsMatch(e.amount, line.amount) &&
          daysBetween(e.date, line.date) <= FUZZY_DATE_WINDOW_DAYS
      )
      .sort((a, b) => daysBetween(a.date, line.date) - daysBetween(b.date, line.date));
    const match = candidates[0];
    if (match) {
      results.push({ statementLineId: line.id, ledgerEntryId: match.id, matchMethod: 'AUTO_FUZZY' });
      claimedEntryIds.add(match.id);
      claimedLineIds.add(line.id);
    }
  }

  return results;
}
