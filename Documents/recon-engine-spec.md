# Reconciliation Engine — PRD & Technical Specification

---

## 1. Product Requirements Document (PRD)

### 1.1 Focus & Scope

The Reconciliation Engine is the core intelligence of the LPG Stock Recon App. Its sole purpose is to surface **quantity discrepancies** between what is physically in the yard and what the ERP system believes is in the yard — pointing directly to unrecorded movements, missing invoices, or uncaptured GRVs.

> **Scope Decision:** This system reconciles **quantities of cylinders only**. It does not calculate, store, or display financial (ZAR) values. Financial analysis is the responsibility of the ERP/Finance team and is intentionally excluded from this tool.

---

### 1.2 User Personas & Goals

| Persona | Goal |
|---|---|
| **Yard Counter** | Use a mobile device to capture an accurate physical count per zone. Submit when complete. |
| **Depot Manager** | See which SKUs have quantity mismatches between physical and system. Understand if the discrepancy grew or shrunk vs the previous session. |
| **Auditor / Investigator** | Drill into a specific SKU variance, review the Tier 1-3 math, read or write investigation notes, and mark the item as Resolved. |

---

### 1.3 Core User Journeys

1. **Physical Count** → Yard counter submits a completed count session. The app stores it locally and syncs to cloud when connectivity is available.
2. **Physical vs. System SOH** → Manager selects a single physical count plus an ERP snapshot (`STKCOUNT.csv`) and runs a Tier 1 variance check.
3. **Physical vs. Physical (Timeline Drift)** → Manager selects a Start Count (AM), an End Count (PM), and a Movement Data file (`CURRENT.TXT`) to run Tier 2 & 3 checks that reveal unrecorded transactions.
4. **Discrepancy Investigation** → On any flagged SKU, the user can tap to drill down, view the raw counts versus the calculated expectation, write investigation notes (e.g., "Found 5 units on the driver's truck — GRV pending"), and set a resolution status.

---

### 1.4 Expected Outcomes & KPIs

- **Speed to Insight:** Reconciliation results generated in under 5 seconds.
- **Accuracy:** All specific brands (Oryx, Easigas/Multibrand) are automatically mapped to generic ERP SKUs. No manual SKU lookup required.
- **Actionable Visuals:** SKU cards are sorted by variance magnitude (highest discrepancy first). Red/Amber/Green indicators provide instant triage.
- **Full Audit Trail:** Every count, upload, reconciliation run, and investigation note is timestamped and persisted.

---

### 1.5 Operational Rules & Constraints

- **Single Depot:** The system manages one physical depot location.
- **Count Frequency:** Counts are performed 2–3 times per day (Baseline/Morning, Midday, End-of-Day/Closing).
- **Concurrent Users:** Up to 2–3 users may be active simultaneously. For this version, concurrent joint counting (two counters splitting zones in real-time) is **out of scope**.
- **ERP Snapshots:** Immutable once uploaded and stored. Each reconciliation run is tied to a specific snapshot.
- **Quantity Only:** No ZAR values, no unit costs, no financial impact columns anywhere in the UI or database.
- **Investigation Notes & Resolution:** Users can write notes on specific SKU variances and set status: `Open` | `Investigating` | `Resolved` | `Written Off`.

---

## 2. Technical Specification

### 2.1 Inputs (Data Models)

1. **Physical Count (`PhysicalCountSession`):** Zones → Entries grouped by size and brand. Flattened to a `Map<SKU, Quantity>` before reconciliation.
2. **ERP Snapshot (`STKCOUNT.csv`):** Contains `[ITEM NUMBER]` and `[TOTAL]` columns.
3. **Movement Data (`CURRENT.TXT`):** Ledger of `Invoices`, `GRVs`, and `Credit Notes` with `[STOCKNO]` and `[QTY]`.

---

### 2.2 SKU Mapping (Shell Extraction Rule)

Every physical count entry is mapped to a standard ERP SKU:

**Deposit (Empties — `.1` SKUs):**
Every full OR empty cylinder of a given size contributes to its `.1` shell count.

| Physical Size | ERP Deposit SKU |
|---|---|
| 9kg | `9.1` |
| 14kg | `14.1` |
| 19kg | `19.1` |
| SV (Small Valve 48kg) | `S.1` |
| DV (Dual Valve 48kg) | `D.1` |

**Content (Fulls — brand-specific SKUs):**

| Physical Input | ERP Content SKU |
|---|---|
| 9kg + Oryx | `9.4` |
| 9kg + Multibrand (Easigas etc.) | `901` |
| 14kg + Oryx | `14.4` |
| 14kg + Multibrand | `1401` |
| 19kg + Oryx | `19.4` |
| 19kg + Multibrand | `1901` |
| SV + Oryx | `S.4` |
| SV + Multibrand | `S01` |
| DV + Oryx | `D.4` |
| DV + Multibrand | `D01` |

---

### 2.3 The Reconciliation Math Engine (Quantity Only)

**Tier 1: SOH Variance**
```
Variance = Physical SOH − System SOH
```
*Purpose: Immediate mismatch between the yard and the ERP at a single point in time.*

**Tier 2: Movement Variance**
```
Expected PM Physical = AM Physical + Net System Movement
Movement Variance    = Actual PM Physical − Expected PM Physical
```
*Purpose: Did the yard change by exactly as many units as the system recorded?*

**Tier 3: Timeline Variance**
```
Physical Change    = PM Physical − AM Physical
Timeline Variance  = Physical Change − Net System Movement
```
*Purpose: Identifies delayed invoice/GRV capturing (paperwork lag).*

**Variance Status Tags (Quantity-Based Thresholds):**
- `MATCH` — Variance = 0
- `MINOR` — |Variance| ≤ 5 units
- `CRITICAL` — |Variance| > 5 units

---

### 2.4 Data Processing Pipeline

1. **Extract & Flatten:** Retrieve records from local Dexie DB (or Supabase cloud). Flatten zones into a `Map<SKU, Quantity>`.
2. **Map SKUs:** Apply Shell Extraction and brand-to-content mapping rules.
3. **Calculate Variances:** Compute Tier 1, 2, and 3 for every SKU that appears in either the ERP snapshot or the physical count.
4. **Tag:** Assign `MATCH` / `MINOR` / `CRITICAL` based on quantity thresholds.
5. **Return Output:** Two arrays — `depositReconciliation` and `contentReconciliation` — sorted by absolute variance descending.
6. **Persist & Track:** Save the `ReconciliationReport` to the database. Notes and status updates are persisted per SKU variance row.

---

## 3. Phase 7 — Cloud Architecture & Synchronization

### 3.1 Deployment Context

| Parameter | Decision |
|---|---|
| Number of Sites | 1 (Single Depot) |
| Concurrent Users | 2–3 |
| Cloud Provider | Supabase (existing project) |
| Remote DB | Supabase PostgreSQL |
| Auth / Roles | Not in scope for this version |
| Region | Existing Supabase project region |

---

### 3.2 Offline-First Foundation (Unchanged)

The app continues to function fully offline. Dexie.js (`IndexedDB`) remains the **local, authoritative store during yard operations**. Network connectivity is unreliable in metal-dense cylinder environments.

---

### 3.3 Sync Strategy: Auto-Sync on Reconnect

| Trigger | Behaviour |
|---|---|
| App goes online | Automatically push all locally-completed sessions to Supabase |
| App is already online | Sync immediately on session completion |
| Sync fails | Retry with exponential backoff; record remains local until confirmed |
| Conflict (same session ID on server) | Server record wins; flag for user review |

A **sync status indicator** on the Dashboard will show: `Synced` / `Pending` / `Failed`.

---

### 3.4 Cloud Data Scope

All of the following will be synced to and stored in Supabase PostgreSQL:

| Table | Notes |
|---|---|
| `physical_count_sessions` | Full session including all zones and entries |
| `erp_snapshots` | Full `STKCOUNT.csv` parsed data + metadata |
| `movement_data` | Full `CURRENT.TXT` parsed data + metadata |
| `reconciliation_reports` | Output of every engine run |
| `discrepancy_notes` | Investigation notes and resolution status per SKU variance |

---

### 3.5 Prisma Schema Impact

The existing `prisma/schema.prisma` will be used as the source of truth for the Supabase PostgreSQL schema. Tables above will be added/migrated. The local Dexie schema and the Prisma schema must remain in sync via a lightweight adapter layer (`src/lib/syncService.ts`).
