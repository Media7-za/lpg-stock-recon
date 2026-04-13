import { describe, it, expect } from 'vitest';
import { runReconciliation } from './reconciliationEngine';
import type { ERPSnapshot, PhysicalCountSession, MovementData, ZoneCount } from '../types';

describe('Reconciliation Engine Math Logic', () => {

    const mockInitialErp: ERPSnapshot = {
        id: 'mock-erp',
        timestamp: new Date(),
        exportTime: new Date(),
        snapshotType: 'PM',
        data: [
            { sku: '9.4', quantity: 100, description: '9Kg Full Oryx', category: 'fulls', group: 'oryx', uom: 'ea' },
            { sku: '9.1', quantity: 300, description: '9Kg Empty', category: 'empties', group: 'any', uom: 'ea' },
            { sku: '19.4', quantity: 50, description: '19Kg Full Oryx', category: 'fulls', group: 'oryx', uom: 'ea' },
        ],
    };

    const emptyZone = (): ZoneCount => ({
        id: 'z1',
        name: 'Zone 1',
        entries: [],
    });

    it('Scenario 1: Special Shell Logic - Counting FULLS automatically increments EMPTIES', () => {
        // Physical count ONLY counts Fulls. 
        // 10x 9kg Oryx Fulls
        const pmPhysical: PhysicalCountSession = {
            id: 'pm-1',
            timestamp: new Date(),
            sessionType: 'PM',
            status: 'completed',
            zones: [{
                ...emptyZone(),
                entries: [
                    { category: 'fulls', size: '9kg', brand: 'Oryx', quantity: 10 }
                ]
            }]
        };

        const result = runReconciliation(mockInitialErp, pmPhysical);

        // Shell/Deposit check
        const shellRecon = result.depositReconciliation.find(v => v.sku === '9.1');
        expect(shellRecon).toBeDefined();
        // Even though physical only counted fulls, shell count should be +10 here
        expect(shellRecon?.afternoonPhysical).toBe(10);
        
        // SOH Variance check for shells: we expected 300 from ERP, have 10. Variance = 10 - 300 = -290.
        expect(shellRecon?.sohVariance).toBe(-290);
        
        // Fulls/Content check 
        const contentRecon = result.contentReconciliation.find(v => v.sku === '9.4');
        expect(contentRecon?.afternoonPhysical).toBe(10);
        // SOH variance for fulls: we expected 100, have 10. Variance = -90
        expect(contentRecon?.sohVariance).toBe(-90);
    });

    it('Scenario 2: TIER 2 Movement Variance (Missing Paperwork)', () => {
        // Morning we have exactly 10 cylinders
        const amPhysical: PhysicalCountSession = {
            id: 'am-1', timestamp: new Date(), sessionType: 'AM', status: 'completed',
            zones: [{ ...emptyZone(), entries: [{ category: 'fulls', size: '19kg', brand: 'Oryx', quantity: 10 }] }]
        };

        // We receive a GRV (delivery) of +5 cylinders during the day
        const movement: MovementData = {
            id: 'mov-1', timestamp: new Date(), period: 'today',
            syncedAt: new Date(),
            movements: [
                { sku: '19.4', transactionType: 'GRV', quantity: 5, date: 'today', description: 'Restock' }
            ]
        };

        // But afternoon count, we only count 12 cylinders! We are missing 3.
        const pmPhysical: PhysicalCountSession = {
            id: 'pm-1', timestamp: new Date(), sessionType: 'PM', status: 'completed',
            zones: [{ ...emptyZone(), entries: [{ category: 'fulls', size: '19kg', brand: 'Oryx', quantity: 12 }] }]
        };

        const result = runReconciliation(mockInitialErp, pmPhysical, amPhysical, movement);
        const contentRecon = result.contentReconciliation.find(v => v.sku === '19.4');

        // AM = 10, GRV = +5. Expected Afternoon = 15.
        expect(contentRecon?.expectedAfternoon).toBe(15);
        expect(contentRecon?.systemMovement).toBe(5);

        // Afternoon is 12. Variance = 12 - 15 = -3.
        expect(contentRecon?.movementVariance).toBe(-3);
        
        // Timeline Variance: (12 - 10) - 5 = 2 - 5 = -3.
        expect(contentRecon?.timelineVariance).toBe(-3);
        expect(contentRecon?.status).toBe('minor'); // Abs(3) <= 5 is minor
    });

    it('Scenario 3: Zero counts and graceful handling', () => {
        // ERP expects 0, Physical count is 0
        const zeroErp: ERPSnapshot = { ...mockInitialErp, data: [{ sku: 'SV01', quantity: 0, description: 'SV Empty', category: 'empties', group: 'any', uom: 'ea' }] };
        const result = runReconciliation(zeroErp, {
            id: 'pm-0', timestamp: new Date(), sessionType: 'PM', status: 'completed', zones: []
        });

        // Since it's in the ERP data, it should appear in the results, with zeros
        const recon = result.depositReconciliation.find(v => v.sku === 'SV01');
        expect(recon).toBeUndefined(); // Wait, SV01 is not a deposit sku in skuConfig. 
        
        // Let's test a known deposit SKU like '9.1' (with 0 quantity in ERP)
        const knownZeroErp: ERPSnapshot = { ...mockInitialErp, data: [{ sku: '9.1', quantity: 0, description: '9kg Empty', category: 'empties', group: 'any', uom: 'ea' }] };
        const result2 = runReconciliation(knownZeroErp, {
            id: 'pm-0', timestamp: new Date(), sessionType: 'PM', status: 'completed', zones: []
        });
        
        const recon91 = result2.depositReconciliation.find(v => v.sku === '9.1');
        expect(recon91?.expectedAfternoon).toBe(0);
        expect(recon91?.sohVariance).toBe(0);
        expect(recon91?.status).toBe('match');
    });
});
