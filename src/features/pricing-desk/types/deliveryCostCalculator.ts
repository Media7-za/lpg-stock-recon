export type VehicleSelectionMode = 'recommend' | 'override';
export type CalculationStatus = 'calculated' | 'partial' | 'error';
export type CostProfileStatus = 'provisional' | 'published' | 'superseded' | 'archived';

export interface CalculateDeliveryCostInput {
  customer_id?: string;
  order?: {
    total_lpg_kg: number;
  };
  route: {
    round_trip_km: number;
    estimated_trip_hours: number;
    tolls?: number;
  };
  vehicle: {
    mode: VehicleSelectionMode;
    vehicle_id?: string;
    override_reason?: string;
  };
  calculation_date?: string;
}

export interface VehicleSnapshot {
  vehicle_id: string;
  selection: VehicleSelectionMode;
  maximum_payload_kg: number;
  registration?: string;
}

export interface LoadSnapshot {
  total_lpg_kg: number;
  required_trips: number;
}

export interface RouteSnapshot {
  round_trip_km: number;
  trip_hours: number;
}

export interface CostsSnapshot {
  running_cost: number;
  labour_cost: number;
  tolls: number;
  total_execution_cost: number;
}

export interface AllocationSnapshot {
  delivery_cost_per_kg: number;
}

export interface CalculationSnapshot {
  vehicle_cost_profile_id: string;
  calculated_at: string;
  cost_profile_status: CostProfileStatus;
  cost_profile_source?: string;
}

export interface CalculateDeliveryCostOutput {
  calculation_id: string;
  status: CalculationStatus;
  vehicle: VehicleSnapshot;
  load: LoadSnapshot;
  route: RouteSnapshot;
  costs: CostsSnapshot;
  allocation: AllocationSnapshot;
  snapshot: CalculationSnapshot;
  warnings: string[];
}

export interface GetDeliveryCostCalculationInput {
  calculation_id: string;
}

export interface DeliveryCostCalculationRecord {
  id: string;
  calculation_code: string;
  customer_id?: string;
  quote_id?: string;
  order_id?: string;
  calculated_at: Date;
  calculation_date: Date;
  total_lpg_kg: number;
  vehicle_id: string;
  vehicle_selection_mode: VehicleSelectionMode;
  vehicle_override_reason?: string;
  payload_limit_kg: number;
  required_trips: number;
  round_trip_km: number;
  trip_hours: number;
  tolls: number;
  vehicle_cost_profile_id: string;
  running_cost_per_km_snapshot: number;
  driver_hourly_rate_snapshot?: number;
  assistant_hourly_rate_snapshot?: number;
  running_cost: number;
  labour_cost: number;
  toll_cost: number;
  total_execution_cost: number;
  delivery_cost_per_kg: number;
  delivery_cost_per_unit?: number;
  status: CalculationStatus;
  warnings: string[];
  input_snapshot: Record<string, unknown>;
  result_snapshot: Record<string, unknown>;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}
