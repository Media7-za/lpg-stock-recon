import { DebtorWorkspaceState } from '../types/debtorWorkspace';
import JEN001 from '../data/fixtures/JEN001.v4.json';
import FAM000 from '../data/fixtures/FAM000.v4.json';
import TAN001 from '../data/fixtures/TAN001.v4.json';

const FIXTURES: Record<string, DebtorWorkspaceState> = {
  JEN001: JEN001 as unknown as DebtorWorkspaceState,
  FAM000: FAM000 as unknown as DebtorWorkspaceState,
  TAN001: TAN001 as unknown as DebtorWorkspaceState,
};

export function useDebtorWorkspace(debtorCode: string): DebtorWorkspaceState | null {
  return FIXTURES[debtorCode] ?? null;
}

export function useDebtorList(): DebtorWorkspaceState[] {
  return Object.values(FIXTURES);
}
