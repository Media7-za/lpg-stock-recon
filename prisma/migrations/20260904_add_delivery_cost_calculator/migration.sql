-- CreateEnum
CREATE TYPE "VehicleSelectionMode" AS ENUM ('RECOMMEND', 'OVERRIDE');

-- CreateEnum
CREATE TYPE "CalculationStatus" AS ENUM ('CALCULATED', 'PARTIAL', 'ERROR');

-- CreateEnum
CREATE TYPE "CostProfileStatus" AS ENUM ('PROVISIONAL', 'PUBLISHED', 'SUPERSEDED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "registration" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "activeStatus" TEXT NOT NULL DEFAULT 'active',
    "minEconomicPayloadKg" DECIMAL(10,2),
    "recommendedPayloadKg" DECIMAL(10,2),
    "maximumPayloadKg" DECIMAL(10,2),
    "driverCount" INTEGER,
    "assistantCount" INTEGER,
    "governedStatus" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_cost_profiles" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "profile_code" TEXT NOT NULL,
    "status" "CostProfileStatus" NOT NULL DEFAULT 'PROVISIONAL',
    "source" TEXT,
    "fuel_consumption_l_per_km" DECIMAL(10,4),
    "fuel_price_per_litre" DECIMAL(10,4),
    "active_tyres" INTEGER,
    "tyre_unit_cost" DECIMAL(10,2),
    "tyre_lifespan_km" DECIMAL(12,0),
    "service_interval_km" DECIMAL(12,0),
    "standard_service_cost" DECIMAL(10,2),
    "maintenance_cost_per_km" DECIMAL(10,4),
    "annual_insurance_cost" DECIMAL(10,2),
    "annual_licensing_cost" DECIMAL(10,2),
    "purchase_value" DECIMAL(12,2),
    "depreciation_period_years" INTEGER,
    "residual_value" DECIMAL(12,2),
    "expected_utilisation_km_per_month" DECIMAL(10,0),
    "driver_hourly_rate" DECIMAL(10,2),
    "assistant_hourly_rate" DECIMAL(10,2),
    "fuel_cost_per_km" DECIMAL(10,4),
    "tyre_cost_per_km" DECIMAL(10,4),
    "service_cost_per_km" DECIMAL(10,4),
    "insurance_cost_per_km" DECIMAL(10,4),
    "licensing_cost_per_km" DECIMAL(10,4),
    "depreciation_cost_per_km" DECIMAL(10,4),
    "total_running_cost_per_km" DECIMAL(10,4),
    "published_at" TIMESTAMP(3),
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_cost_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_cost_calculations" (
    "id" TEXT NOT NULL,
    "calculation_code" TEXT NOT NULL,
    "customer_id" TEXT,
    "quote_id" TEXT,
    "order_id" TEXT,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculation_date" DATE NOT NULL,
    "total_lpg_kg" DECIMAL(10,2) NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "vehicle_selection_mode" "VehicleSelectionMode" NOT NULL DEFAULT 'RECOMMEND',
    "vehicle_override_reason" TEXT,
    "payload_limit_kg" DECIMAL(10,2) NOT NULL,
    "required_trips" INTEGER NOT NULL,
    "round_trip_km" DECIMAL(10,2) NOT NULL,
    "trip_hours" DECIMAL(10,2) NOT NULL,
    "tolls" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "vehicle_cost_profile_id" TEXT NOT NULL,
    "running_cost_per_km_snapshot" DECIMAL(10,4) NOT NULL,
    "driver_hourly_rate_snapshot" DECIMAL(10,2),
    "assistant_hourly_rate_snapshot" DECIMAL(10,2),
    "running_cost" DECIMAL(12,2) NOT NULL,
    "labour_cost" DECIMAL(12,2) NOT NULL,
    "toll_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_execution_cost" DECIMAL(12,2) NOT NULL,
    "delivery_cost_per_kg" DECIMAL(10,4) NOT NULL,
    "delivery_cost_per_unit" DECIMAL(10,4),
    "status" "CalculationStatus" NOT NULL DEFAULT 'CALCULATED',
    "warnings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "input_snapshot" JSONB NOT NULL,
    "result_snapshot" JSONB NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_cost_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_registration_key" ON "vehicles"("registration");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_cost_profiles_profile_code_key" ON "vehicle_cost_profiles"("profile_code");

-- CreateIndex
CREATE INDEX "vehicle_cost_profiles_vehicle_id_idx" ON "vehicle_cost_profiles"("vehicle_id");

-- CreateIndex
CREATE INDEX "vehicle_cost_profiles_status_idx" ON "vehicle_cost_profiles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_cost_calculations_calculation_code_key" ON "delivery_cost_calculations"("calculation_code");

-- CreateIndex
CREATE INDEX "delivery_cost_calculations_customer_id_idx" ON "delivery_cost_calculations"("customer_id");

-- CreateIndex
CREATE INDEX "delivery_cost_calculations_quote_id_idx" ON "delivery_cost_calculations"("quote_id");

-- CreateIndex
CREATE INDEX "delivery_cost_calculations_order_id_idx" ON "delivery_cost_calculations"("order_id");

-- CreateIndex
CREATE INDEX "delivery_cost_calculations_vehicle_id_idx" ON "delivery_cost_calculations"("vehicle_id");

-- CreateIndex
CREATE INDEX "delivery_cost_calculations_calculated_at_idx" ON "delivery_cost_calculations"("calculated_at");

-- AddForeignKey
ALTER TABLE "vehicle_cost_profiles" ADD CONSTRAINT "vehicle_cost_profiles_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_cost_calculations" ADD CONSTRAINT "delivery_cost_calculations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_cost_calculations" ADD CONSTRAINT "delivery_cost_calculations_vehicle_cost_profile_id_fkey" FOREIGN KEY ("vehicle_cost_profile_id") REFERENCES "vehicle_cost_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
