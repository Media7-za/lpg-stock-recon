export const VALID_TRANSITIONS: Record<string, string[]> = {
  "OPEN": ["COUNTING", "CLOSED"],
  "COUNTING": ["SYNCED", "RECONCILING", "CLOSED"],
  "SYNCED": ["RECONCILING", "CLOSED"],
  "RECONCILING": ["RECONCILED", "FAILED"],
  "RECONCILED": ["REVIEWED", "RECONCILING"],
  "REVIEWED": ["CLOSED"],
  "FAILED": ["RECONCILING"],
  "CLOSED": []
};

export const assertValidTransition = (
  currentState: string,
  targetState: string
) => {
  const allowed = VALID_TRANSITIONS[currentState] || [];

  if (!allowed.includes(targetState)) {
    throw {
      code: "INVALID_STATE_TRANSITION",
      message: `Cannot transition from ${currentState} → ${targetState}`
    };
  }
};
