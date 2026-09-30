import { apiClient } from "./client";
import { v4 as uuidv4 } from 'uuid';
import type { CalculateDeliveryCostInput } from '../../features/pricing-desk/types/deliveryCostCalculator';

export const startCountSession = (date: string) =>
  apiClient.post("/sessions/start", { date, idempotencyKey: uuidv4() });

export const getSession = (sessionId: string) =>
  apiClient.get(`/sessions?sessionId=${sessionId}`);

export const closeSession = (sessionId: string) =>
  apiClient.post(`/sessions/close?sessionId=${sessionId}`, { idempotencyKey: uuidv4() });

export const fetchInventorySnapshot = (date: string) =>
  apiClient.get(`/inventory/snapshot?date=${date}`);

export const submitErpSnapshot = (snapshot: any) =>
  apiClient.post("/inventory/snapshot", { snapshot, idempotencyKey: uuidv4() });

export const submitPhysicalCount = (sessionId: string, payload: any) =>
  apiClient.post("/inventory/counts", { sessionId, payload, idempotencyKey: uuidv4() });

export const submitMovementData = (movement: any) =>
  apiClient.post("/inventory/movements", { movement, idempotencyKey: uuidv4() });

export const startReconciliation = (sessionId: string) =>
  apiClient.post("/reconciliation/start", { sessionId, idempotencyKey: uuidv4() });

export const getReconciliationStatus = (sessionId: string) =>
  apiClient.get(`/reconciliation/status?sessionId=${sessionId}`);

export const getReconciliationReport = (sessionId: string) =>
  apiClient.get(`/reconciliation/report?sessionId=${sessionId}`);

export const upsertDiscrepancyNote = (sessionId: string, note: string) =>
  apiClient.post("/discrepancies/notes", { sessionId, note, idempotencyKey: uuidv4() });

export const calculateDeliveryCost = (payload: CalculateDeliveryCostInput) =>
  apiClient.post("/pricing/delivery-cost-calculate", { ...payload, idempotencyKey: uuidv4() });

export const getDeliveryCostCalculation = (calculationId: string) =>
  apiClient.get(`/pricing/delivery-cost?calculationId=${calculationId}`);
