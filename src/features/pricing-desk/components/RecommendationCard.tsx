import { useState } from 'react';
import { PricingRecommendation } from '../types/pricingDesk';

interface RecommendationCardProps {
  recommendation: PricingRecommendation;
  onApprove: (approvedPricePerKg: number, decisionReason: string) => void;
  approved: boolean;
}

export function RecommendationCard({ recommendation, onApprove, approved }: RecommendationCardProps) {
  const [approvedPrice, setApprovedPrice] = useState(recommendation.recommendedPricePerKg);
  const [reason, setReason] = useState('');

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-black uppercase tracking-wider text-text-secondary">Price Recommendation</h3>
        {recommendation.illustrative && (
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-surface-elevated px-2 py-0.5 rounded">
            Illustrative — Phase 1
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-surface-elevated rounded-lg p-3 text-center">
          <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-1">Floor</p>
          <p className="text-sm font-mono font-bold text-text-primary">R{recommendation.floorPricePerKg}</p>
        </div>
        <div className="bg-surface-elevated rounded-lg p-3 text-center">
          <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-1">Target</p>
          <p className="text-sm font-mono font-bold text-text-primary">R{recommendation.targetPricePerKg}</p>
        </div>
        <div className="bg-surface-elevated rounded-lg p-3 text-center">
          <p className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-1">Stretch</p>
          <p className="text-sm font-mono font-bold text-text-primary">R{recommendation.stretchPricePerKg}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
          <p className="text-[10px] font-black uppercase tracking-wider text-blue-400 mb-1">Recommended</p>
          <p className="text-sm font-mono font-bold text-blue-400">R{recommendation.recommendedPricePerKg}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-1">Why</p>
        <ul className="text-sm text-text-primary list-disc list-inside space-y-0.5">
          {recommendation.reasoning.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>

      {approved ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm font-bold text-green-400">
          Approved at R{approvedPrice}/kg
        </div>
      ) : (
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs font-black uppercase tracking-wider text-text-secondary" htmlFor="approved-price">
              Approve at (R/kg)
            </label>
            <input
              id="approved-price"
              type="number"
              step="0.01"
              value={approvedPrice}
              onChange={(e) => setApprovedPrice(Number(e.target.value))}
              className="w-28 bg-surface-elevated border border-border rounded px-2 py-1 text-sm font-mono text-text-primary"
            />
          </div>
          <input
            type="text"
            placeholder="Decision reason (why this price)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-surface-elevated border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary"
          />
          <button
            onClick={() => onApprove(approvedPrice, reason || 'Approved at recommended price')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-black py-2 rounded-lg transition-colors"
          >
            Approve Price
          </button>
        </div>
      )}
    </div>
  );
}
