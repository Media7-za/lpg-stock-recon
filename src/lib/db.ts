import Dexie, { Table } from 'dexie';
import type { ERPSnapshot, PhysicalCountSession, MovementData, ReconciliationReport } from '../types';

export class LPGReconDatabase extends Dexie {
  erpSnapshots!: Table<ERPSnapshot, string>;
  physicalCounts!: Table<PhysicalCountSession, string>;
  movementData!: Table<MovementData, string>;
  reconciliationReports!: Table<ReconciliationReport, string>;

  constructor() {
    super('LPGReconDB');

    this.version(2).stores({
      erpSnapshots: 'id, timestamp, exportTime, snapshotType',
      physicalCounts: 'id, timestamp, sessionType, status',
      movementData: 'id, timestamp, period',
      reconciliationReports: 'id, timestamp, status'
    });
  }
}

export const db = new LPGReconDatabase();
