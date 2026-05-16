import { NormalizedDocument, ReconScoringWeights } from '../types';

/**
 * Calculates a recommendation score (0-100) between an invoice and a potential credit/payment.
 */
export function calculateRecommendationScore(
  invoice: NormalizedDocument,
  credit: NormalizedDocument,
  weights: ReconScoringWeights
): number {
  let score = 0;

  // 1. Exact Amount Match (Primary Signal)
  // We use a small epsilon for floating point comparison
  if (Math.abs(invoice.total_amount - credit.total_amount) < 0.01) {
    score += weights.EXACT_AMOUNT;
  }

  // 2. Item Signature Overlap (Product Affinity)
  const invoiceBuckets = Object.keys(invoice.item_signature);
  if (invoiceBuckets.length > 0) {
    let matches = 0;
    invoiceBuckets.forEach(bucket => {
      if (credit.item_signature[bucket] && Math.abs(invoice.item_signature[bucket] - credit.item_signature[bucket]) < 0.001) {
        matches++;
      }
    });
    const matchRatio = matches / invoiceBuckets.length;
    score += weights.ITEM_OVERLAP * matchRatio;
  }

  // 3. Date Proximity (Temporal Affinity)
  const invDate = new Date(invoice.tx_date).getTime();
  const crdDate = new Date(credit.tx_date).getTime();
  const diffDays = Math.abs(invDate - crdDate) / (1000 * 60 * 60 * 24);
  
  // Decays over 14 days
  if (diffDays <= 14) {
    score += weights.DATE_PROXIMITY * (1 - diffDays / 14);
  }

  // Normalize to 100
  // Note: Total potential score can exceed 100 if weights are high, but we cap it for UI simplicity
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Normalizes item quantities into business buckets for signature comparison
 */
export function buildItemSignature(items: any[], classifications: Record<string, string>): Record<string, number> {
  const signature: Record<string, number> = {};
  
  items.forEach(item => {
    const bucket = classifications[item.stock_no] || 'OTHER';
    signature[bucket] = (signature[bucket] || 0) + (item.qty || 0);
  });
  
  return signature;
}
