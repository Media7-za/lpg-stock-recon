export const ALLOCATION_LABELS = {
  domain: 'Allocation',
  invoice: 'Invoice',
  payment: 'Payment',
  creditNote: 'Credit Note',
  relationship: 'Relationship',
  case: 'Investigation Case',
  outstanding: 'Outstanding',
  exceptions: 'Exceptions',
  home: 'Home',
  search: 'Search',
};

export const DOCTRINE_LABELS: Record<string, string> = {
  'Tier 1': 'Tier 1 — Open balance primary',
  'Tier 2': 'Tier 2 — Explicit / rounding',
  'Tier 3': 'Tier 3 — CN offset',
  'Tier 4': 'Tier 4 — Proximity',
  'Tier 5': 'Tier 5 — Review / unallocated',
};

export const HEALTH_LABELS = {
  healthy: 'Healthy',
  needs_review: 'Needs review',
  conflict: 'Conflict',
  incomplete: 'Incomplete',
};
