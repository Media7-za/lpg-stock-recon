#!/bin/bash

# =============================================================================
# E2E Test: Enter Count Function
# 1. Start a new session (POST /sessions/start)
# 2. Submit counts (POST /inventory/counts)
# 3. Verify session state is COUNTING (GET /sessions)
# =============================================================================

set -e

# Load env variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

URL="${VITE_SUPABASE_URL}/functions/v1"
KEY="${VITE_SUPABASE_ANON_KEY}"

# Generate unique IDs
IDEM_KEY_START="start-$(date +%s)"
IDEM_KEY_COUNT="count-$(date +%s)"
TEST_DATE=$(date +%Y-%m-%d)

echo "🚀 Starting E2E Test: Enter Count"

# --- STEP 1: Start Session ---
echo "--- Step 1: Starting Session ---"
START_RES=$(curl -s --max-time 30 -X POST "${URL}/sessions/start" \
  -H "Authorization: Bearer ${KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"date\": \"${TEST_DATE}\", \"idempotencyKey\": \"${IDEM_KEY_START}\"}")

SESSION_ID=$(echo $START_RES | jq -r '.sessionId')

if [ "$SESSION_ID" == "null" ] || [ -z "$SESSION_ID" ]; then
  echo "❌ Failed to start session: $START_RES"
  exit 1
fi

echo "✅ Session started: $SESSION_ID"

# --- STEP 2: Submit Counts ---
echo "--- Step 2: Submitting Counts ---"
COUNT_PAYLOAD='[{"sku": "LPG-9KG", "brand": "TOTAL", "zone": "A1", "quantity": 10}, {"sku": "LPG-19KG", "brand": "EASIGAS", "zone": "A1", "quantity": 5}]'
SUBMIT_RES=$(curl -s --max-time 30 -X POST "${URL}/inventory/counts" \
  -H "Authorization: Bearer ${KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"${SESSION_ID}\", \"payload\": ${COUNT_PAYLOAD}, \"idempotencyKey\": \"${IDEM_KEY_COUNT}\"}")

echo "✅ Counts submitted: $SUBMIT_RES"

# --- STEP 3: Verify Session State ---
echo "--- Step 3: Verifying Session State ---"
SESSION_INFO=$(curl -s --max-time 30 -X GET "${URL}/sessions?sessionId=${SESSION_ID}" \
  -H "Authorization: Bearer ${KEY}")

CURRENT_STATE=$(echo $SESSION_INFO | jq -r '.current_state')

if [ "$CURRENT_STATE" == "COUNTING" ]; then
  echo "✅ TEST PASSED: Session state is $CURRENT_STATE"
else
  echo "❌ TEST FAILED: Expected state COUNTING, got $CURRENT_STATE"
  echo "Full response: $SESSION_INFO"
  exit 1
fi

echo "🎉 E2E Test Completed Successfully!"
