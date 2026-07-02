import { useNavigate } from 'react-router-dom';
import { listFixtureCustomers, MARKET_OBSERVATIONS, SUPPLIER_COST_SNAPSHOT } from '../data/fixtures/pricingDeskFixtures';
import { usePricingDeskStore } from '../state/PricingDeskProvider';
import { ActivityFeed } from './ActivityFeed';
import { MarketContextCard } from './MarketContextCard';
import { SupplierCostCard } from './SupplierCostCard';

export function PricingDeskHome() {
  const navigate = useNavigate();
  const { decisions, loading } = usePricingDeskStore();
  const customers = listFixtureCustomers();
  const winBacks = customers.filter((c) => c.commercialStatus === 'win_back');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="mb-2">
        <h1 className="text-2xl font-black text-text-primary">Pricing Desk</h1>
        <p className="mt-1 text-sm text-text-secondary">Quote, review and record commercial pricing decisions.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/pricing-desk/quote')}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-black px-4 py-2.5 rounded-lg transition-colors"
        >
          Quote Customer
        </button>
        <button
          onClick={() => navigate('/pricing-desk/quote')}
          className="bg-surface-elevated hover:bg-surface border border-border text-text-primary text-sm font-black px-4 py-2.5 rounded-lg transition-colors"
        >
          Review Customer
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-3">Win-Back Opportunities</h3>
          {winBacks.length === 0 ? (
            <p className="text-sm text-text-secondary">No active win-backs.</p>
          ) : (
            <div className="space-y-2">
              {winBacks.map((customer) => (
                <button
                  key={customer.customerCode}
                  onClick={() => navigate(`/pricing-desk/quote/${customer.customerCode}`)}
                  className="w-full text-left bg-surface-elevated hover:bg-surface-elevated/60 rounded-lg p-3 transition-colors"
                >
                  <p className="text-sm font-black text-text-primary">
                    {customer.customerCode} — {customer.customerName}
                  </p>
                  <p className="text-xs text-amber-400">Win-back — action: complete quote</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <SupplierCostCard snapshot={SUPPLIER_COST_SNAPSHOT} />
        <MarketContextCard observations={MARKET_OBSERVATIONS} />
        <ActivityFeed decisions={decisions} loading={loading} />
      </div>
    </div>
  );
}
