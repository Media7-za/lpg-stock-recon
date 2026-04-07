import { db } from './db';
import type { PhysicalCountSession, ERPSnapshot, MovementData } from '../types';

export type DexieExportPayload = {
  exportedAt: string; // ISO
  erpSnapshots: ERPSnapshot[];
  physicalCounts: PhysicalCountSession[];
  movementData: MovementData[];
};

export async function buildDexieExportPayload(): Promise<DexieExportPayload> {
  const [erpSnapshots, physicalCounts, movementData] = await Promise.all([
    db.erpSnapshots.toArray(),
    db.physicalCounts.toArray(),
    db.movementData.toArray(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    erpSnapshots,
    physicalCounts,
    movementData,
  };
}

export function downloadJson(payload: unknown, filename: string) {
  const text = JSON.stringify(payload, null, 2);
  const blob = new Blob([text], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

