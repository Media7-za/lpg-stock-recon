import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  computeDeliveryEconomics,
  computeIllustrativeRecommendation,
  getSupplierCostSnapshot,
  hasMinimumIntake,
  missingIntakeFields,
} from '../hooks/usePricingDeskData';
import { getFixtureBundle, listFixtureCustomers, MARKET_OBSERVATIONS } from '../data/fixtures/pricingDeskFixtures';
import { usePricingDeskStore } from '../state/PricingDeskProvider';
import {
  CommercialDecisionRecord,
  CommercialStatus,
  CustomerCommercialContext,
  CustomerLane,
  DeliveryOrCollection,
  MobileProforma,
  OrderLine,
  PricingIntake,
} from '../types/pricingDesk';
import { CustomerSummaryCard } from './CustomerSummaryCard';
import { DeliveryEconomicsCard } from './DeliveryEconomicsCard';
import { SupplierCostCard } from './SupplierCostCard';
import { MarketContextCard } from './MarketContextCard';
import { RecommendationCard } from './RecommendationCard';
import { MissingFieldsBanner } from './MissingFieldsBanner';
import { MobileProformaPreview } from './MobileProformaPreview';

const CUSTOMER_LANES: CustomerLane[] = [
  'commodity_wholesale',
  'standard_wholesale',
  'consuming_customer',
  'relationship_account',
  'strategic_account',
];

const COMMERCIAL_STATUSES: CommercialStatus[] = [
  'new_prospect',
  'active_customer',
  'dormant_customer',
  'win_back',
  'churn_risk',
  'lost',
];

const EMPTY_CONTEXT: CustomerCommercialContext = { previousDecisionSummaries: [] };

function emptyIntake(): PricingIntake {
  return {
    customerCode: '',
    customerName: '',
    customerLane: null,
    commercialStatus: null,
    deliveryOrCollection: null,
    roundTripKm: null,
    orderLines: [],
    competitorReference: null,
    notes: null,
  };
}

export function QuoteWorkspace() {
  const { customerCode: routeCustomerCode } = useParams<{ customerCode?: string }>();
  const navigate = useNavigate();
  const { addDecision, updateDecisionState } = usePricingDeskStore();

  const initialFixture = routeCustomerCode ? getFixtureBundle(routeCustomerCode) : null;
  const [intake, setIntake] = useState<PricingIntake>(initialFixture ? initialFixture.intake : emptyIntake());
  const [approvedDecision, setApprovedDecision] = useState<CommercialDecisionRecord | null>(null);
  const [proforma, setProforma] = useState<MobileProforma | null>(null);
  const [generatingProforma, setGeneratingProforma] = useState(false);
  const [proformaError, setProformaError] = useState<string | null>(null);

  const fixture = getFixtureBundle(intake.customerCode);
  const context = fixture ? fixture.context : EMPTY_CONTEXT;

  const missing = missingIntakeFields(intake);
  const readyForRecommendation = hasMinimumIntake(intake);
  const deliveryEconomics = useMemo(() => computeDeliveryEconomics(intake), [intake]);
  const supplierCost = getSupplierCostSnapshot();
  const recommendation = useMemo(
    () => (readyForRecommendation ? computeIllustrativeRecommendation(intake) : null),
    [readyForRecommendation, intake]
  );

  function selectFixtureCustomer(code: string) {
    const bundle = getFixtureBundle(code);
    if (bundle) {
      setIntake(bundle.intake);
    } else {
      setIntake({ ...emptyIntake() });
    }
    setApprovedDecision(null);
    setProforma(null);
  }

  function updateOrderLine(index: number, patch: Partial<OrderLine>) {
    setIntake((prev) => ({
      ...prev,
      orderLines: prev.orderLines.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    }));
  }

  function addOrderLine() {
    setIntake((prev) => ({
      ...prev,
      orderLines: [...prev.orderLines, { description: '', qty: 1, kgPerUnit: 9 }],
    }));
  }

  function removeOrderLine(index: number) {
    setIntake((prev) => ({ ...prev, orderLines: prev.orderLines.filter((_, i) => i !== index) }));
  }

  async function handleApprove(approvedPricePerKg: number, decisionReason: string, approvedBy: string) {
    const decision = await addDecision({
      customerCode: intake.customerCode || 'MANUAL',
      customerName: intake.customerName,
      customerLane: intake.customerLane as CustomerLane,
      commercialStatus: intake.commercialStatus ?? 'new_prospect',
      approvedPricePerKg,
      approvedBy,
      decisionReason,
      pricingIntakeSnapshot: intake,
      customerContextSnapshot: fixture ? context : null,
      deliveryEconomicsSnapshot: deliveryEconomics,
      supplierCostSnapshot: supplierCost,
      marketContextSnapshot: MARKET_OBSERVATIONS,
    });
    setApprovedDecision(decision);
  }

  async function handleGenerateProforma() {
    if (!approvedDecision) return;
    setGeneratingProforma(true);
    setProformaError(null);
    try {
      const updated = await updateDecisionState(approvedDecision.decisionId, {
        state: 'quoted',
        quotedAt: new Date().toISOString(),
      });
      setApprovedDecision(updated);

      const items = updated.orderLines.map((line) => {
        const unitPrice = Number((updated.approvedPricePerKg * line.kgPerUnit).toFixed(2));
        return {
          description: line.description,
          qty: line.qty,
          unitPrice,
          lineTotal: Number((unitPrice * line.qty).toFixed(2)),
        };
      });
      const totalPayable = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
      setProforma({
        decisionId: updated.decisionId,
        customer: updated.customerName,
        contact: fixture?.customer.primaryContact,
        pricePerKg: updated.approvedPricePerKg,
        items,
        totalPayable,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setProformaError(err instanceof Error ? err.message : 'Failed to generate proforma.');
    } finally {
      setGeneratingProforma(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Quote Workspace</h1>
          <p className="mt-1 text-sm text-text-secondary">Move a customer from intake to an approved price.</p>
        </div>
        <button
          onClick={() => navigate('/pricing-desk')}
          className="text-sm font-bold text-text-secondary hover:text-text-primary"
        >
          Back to Home
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary block mb-1">
              Load Known Customer
            </label>
            <select
              value={intake.customerCode}
              onChange={(e) => selectFixtureCustomer(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded px-3 py-2 text-sm text-text-primary"
            >
              <option value="">Manual entry</option>
              {listFixtureCustomers().map((c) => (
                <option key={c.customerCode} value={c.customerCode}>
                  {c.customerCode} — {c.customerName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary block mb-1">
              Customer / ERP Account
            </label>
            <input
              type="text"
              value={intake.customerName}
              onChange={(e) => setIntake((prev) => ({ ...prev, customerName: e.target.value }))}
              placeholder="Customer name"
              className="w-full bg-surface-elevated border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary block mb-1">
              Customer Lane
            </label>
            <select
              value={intake.customerLane ?? ''}
              onChange={(e) => setIntake((prev) => ({ ...prev, customerLane: (e.target.value || null) as CustomerLane | null }))}
              className="w-full bg-surface-elevated border border-border rounded px-3 py-2 text-sm text-text-primary capitalize"
            >
              <option value="">Select lane</option>
              {CUSTOMER_LANES.map((lane) => (
                <option key={lane} value={lane}>{lane.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary block mb-1">
              Commercial Status
            </label>
            <select
              value={intake.commercialStatus ?? ''}
              onChange={(e) => setIntake((prev) => ({ ...prev, commercialStatus: (e.target.value || null) as CommercialStatus | null }))}
              className="w-full bg-surface-elevated border border-border rounded px-3 py-2 text-sm text-text-primary capitalize"
            >
              <option value="">Select status</option>
              {COMMERCIAL_STATUSES.map((status) => (
                <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary block mb-1">
              Delivery or Collection
            </label>
            <div className="flex gap-2">
              {(['delivery', 'collection'] as DeliveryOrCollection[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setIntake((prev) => ({ ...prev, deliveryOrCollection: opt }))}
                  className={`flex-1 text-sm font-bold py-2 rounded-lg border transition-colors capitalize ${
                    intake.deliveryOrCollection === opt
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-surface-elevated border-border text-text-secondary'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          {intake.deliveryOrCollection === 'delivery' && (
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary block mb-1">
                Round-Trip Distance (km)
              </label>
              <input
                type="number"
                value={intake.roundTripKm ?? ''}
                onChange={(e) => setIntake((prev) => ({ ...prev, roundTripKm: e.target.value ? Number(e.target.value) : null }))}
                className="w-full bg-surface-elevated border border-border rounded px-3 py-2 text-sm text-text-primary"
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary">Expected Order</label>
            <button onClick={addOrderLine} className="text-xs font-bold text-blue-400 hover:text-blue-300">
              + Add line
            </button>
          </div>
          <div className="space-y-2">
            {intake.orderLines.map((line, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="number"
                  value={line.qty}
                  onChange={(e) => updateOrderLine(i, { qty: Number(e.target.value) })}
                  className="w-16 bg-surface-elevated border border-border rounded px-2 py-1.5 text-sm text-text-primary"
                />
                <span className="text-text-secondary text-sm">x</span>
                <input
                  type="text"
                  value={line.description}
                  onChange={(e) => updateOrderLine(i, { description: e.target.value })}
                  placeholder="Description (e.g. 48kg Cylinder)"
                  className="flex-1 bg-surface-elevated border border-border rounded px-2 py-1.5 text-sm text-text-primary placeholder:text-text-secondary"
                />
                <input
                  type="number"
                  value={line.kgPerUnit}
                  onChange={(e) => updateOrderLine(i, { kgPerUnit: Number(e.target.value) })}
                  className="w-20 bg-surface-elevated border border-border rounded px-2 py-1.5 text-sm text-text-primary"
                  title="kg per unit"
                />
                <span className="text-text-secondary text-xs">kg</span>
                <button onClick={() => removeOrderLine(i)} className="text-text-secondary hover:text-red-400 text-sm px-1">
                  ×
                </button>
              </div>
            ))}
            {intake.orderLines.length === 0 && (
              <p className="text-sm text-text-secondary">No order lines yet.</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary block mb-1">
            Competitor Reference (optional)
          </label>
          <input
            type="text"
            value={intake.competitorReference ?? ''}
            onChange={(e) => setIntake((prev) => ({ ...prev, competitorReference: e.target.value || null }))}
            className="w-full bg-surface-elevated border border-border rounded px-3 py-2 text-sm text-text-primary"
          />
        </div>
      </div>

      <MissingFieldsBanner missingFields={missing} />

      {intake.customerLane && (
        <CustomerSummaryCard
          customerName={intake.customerName || 'Unnamed customer'}
          customerLane={intake.customerLane}
          commercialStatus={intake.commercialStatus ?? 'new_prospect'}
          context={context}
        />
      )}

      {deliveryEconomics && <DeliveryEconomicsCard economics={deliveryEconomics} />}
      <SupplierCostCard snapshot={supplierCost} />
      <MarketContextCard observations={MARKET_OBSERVATIONS} />

      {recommendation && (
        <RecommendationCard
          recommendation={recommendation}
          onApprove={handleApprove}
          approved={!!approvedDecision}
        />
      )}

      {approvedDecision && !proforma && (
        <div className="space-y-2">
          {proformaError && <p className="text-xs text-red-400">{proformaError}</p>}
          <button
            onClick={handleGenerateProforma}
            disabled={generatingProforma}
            className="w-full bg-surface-elevated hover:bg-surface border border-border disabled:opacity-60 text-text-primary text-sm font-black py-2.5 rounded-lg transition-colors"
          >
            {generatingProforma ? 'Generating…' : 'Generate Mobile Proforma'}
          </button>
        </div>
      )}

      {proforma && <MobileProformaPreview proforma={proforma} />}
    </div>
  );
}
