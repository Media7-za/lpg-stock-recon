import { db } from './db';
import type { ERPSnapshot, PhysicalCountSession, MovementData } from '../types';

export async function seedSampleData() {
  const existingSnapshots = await db.erpSnapshots.count();
  if (existingSnapshots > 0) {
    console.log('Sample data already exists. Skipping seed.');
    return;
  }

  // 1. Mock PM ERP Snapshot
  const pmSnapshotId = crypto.randomUUID();
  const samplePMERPSnapshot: ERPSnapshot = {
    id: pmSnapshotId,
    timestamp: new Date(),
    exportTime: new Date(),
    snapshotType: 'PM',
    data: [
      { sku: '9.1', category: 'D', group: '9kg', description: '9kg Deposit', uom: 'EA', quantity: 245 },
      { sku: '14.1', category: 'D', group: '14kg', description: '14kg Deposit', uom: 'EA', quantity: 77 },
      { sku: '19.1', category: 'D', group: '19kg', description: '19kg Deposit', uom: 'EA', quantity: 105 },
      { sku: 'S.1', category: 'D', group: 'SV', description: 'SV Deposit', uom: 'EA', quantity: 86 },
      { sku: 'D.1', category: 'D', group: 'DV', description: 'DV Deposit', uom: 'EA', quantity: 133 },
      { sku: '9.3', category: 'C', group: '9kg', description: '9kg Easigas Full', uom: 'EA', quantity: 32 },
      { sku: '9.4', category: 'C', group: '9kg', description: '9kg Oryx Full', uom: 'EA', quantity: 20 },
      { sku: '901', category: 'C', group: '9kg', description: '9kg Generic Full', uom: 'EA', quantity: 316 },
      { sku: '14.3', category: 'C', group: '14kg', description: '14kg Easigas Full', uom: 'EA', quantity: 14 },
      { sku: '14.4', category: 'C', group: '14kg', description: '14kg Oryx Full', uom: 'EA', quantity: 32 },
    ],
  };

  await db.erpSnapshots.add(samplePMERPSnapshot);

  // 2. Mock AM Physical Count
  const amPhysicalId = crypto.randomUUID();
  const sampleAMPhysical: PhysicalCountSession = {
    id: amPhysicalId,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    sessionType: 'AM',
    status: 'completed',
    counterName: 'John Doe',
    zones: [
      {
        id: 'zone-1',
        name: 'Main Yard',
        entries: [
          { category: 'empties', size: '9kg', brand: 'Oryx', quantity: 25 },
          { category: 'empties', size: '9kg', brand: 'Easigas', quantity: 15 },
          { category: 'fulls', size: '9kg', brand: 'Oryx', quantity: 100 },
        ]
      }
    ]
  };

  await db.physicalCounts.add(sampleAMPhysical);

  // 3. Mock PM Physical Count
  const pmPhysicalId = crypto.randomUUID();
  const samplePMPhysical: PhysicalCountSession = {
    id: pmPhysicalId,
    timestamp: new Date(),
    sessionType: 'PM',
    status: 'completed',
    counterName: 'Jane Smith',
    zones: [
      {
        id: 'zone-1',
        name: 'Main Yard',
        entries: [
          { category: 'empties', size: '9kg', brand: 'Oryx', quantity: 30 },
          { category: 'empties', size: '9kg', brand: 'Easigas', quantity: 10 },
          { category: 'fulls', size: '9kg', brand: 'Oryx', quantity: 80 },
        ]
      }
    ]
  };

  await db.physicalCounts.add(samplePMPhysical);

  // 4. Mock Movement Data
  const movementId = crypto.randomUUID();
  const sampleMovement: MovementData = {
    id: movementId,
    timestamp: new Date(),
    period: new Date().toISOString().split('T')[0],
    movements: [
      { date: '01/03/2026', sku: '9.3', description: '9kg Easigas Full', quantity: 10, transactionType: 'Invoice', reference: 'INV-101' },
      { date: '01/03/2026', sku: '9.4', description: '9kg Oryx Full', quantity: 20, transactionType: 'Invoice', reference: 'INV-102' },
      { date: '01/03/2026', sku: '9.1', description: '9kg Deposit', quantity: 5, transactionType: 'GRV', reference: 'GRV-001' },
    ]
  };

  await db.movementData.add(sampleMovement);

  console.log('Sample data seeded successfully!');
}
