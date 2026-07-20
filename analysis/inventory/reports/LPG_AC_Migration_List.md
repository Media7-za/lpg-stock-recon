# LPG AC Migration List

**Generated:** 2026-07-17  
**Source:** `transaction_items` where `category='AGR'` and `product_group='LPG AC'`  
**On hand source:** `ERP RAW DATA/STOCK COUNT 28_02_2026 - STKCOUNT.csv` (TOTAL column, snapshot 28-Feb-2026)  
**Action:** Reclassify to `FIT / ACC` and register in `item_classifications` as `LPG_ACCESSORY / Accessory`

## Summary

| Metric | Value |
|--------|-------|
| SKUs | 57 |
| Transaction lines | 652 |
| Priority A (fast movers) | 3 |
| Priority B (moderate) | 14 |
| Priority C (slow / dormant) | 40 |
| On hand in STKCOUNT | 44 of 57 |
| Below minimum stock | 2 |
| Date range (sales) | 2023-08-03 → 2026-06-26 |

## Taxonomy change

| Field | Before | After |
|-------|--------|-------|
| category | AGR | FIT |
| product_group | LPG AC | ACC |
| business_bucket | — | LPG_ACCESSORY |
| logical_group | — | Accessory |

## Priority rules

- **A:** ≥10 sold in 90d OR ≥50 sold in 365d → min ≈ 1.5 months cover, reorder ≈ 3 months
- **B:** ≥3 sold in 90d OR ≥10 in 365d OR ≥15 lifetime → min ≈ 2 months, reorder ≈ 3 months
- **C:** everything else → min 1, reorder 3 (order on demand)

## Stock status

- **OK** — on hand ≥ minimum
- **LOW** — on hand &lt; minimum but &gt; 0
- **OUT** — on hand ≤ 0
- **—** — not found in STKCOUNT snapshot

## Full SKU list

| # | Stock no | Description | Pri | 365d | 90d | On hand | Min | Reorder | Last sale |
|---|----------|-------------|-----|------|-----|---------|-----|---------|-----------|
| 1 | 00000304 | 1/2 M X 1/2 OD COUPLER (68-8A) | A | 114 | 24 | 40 | 15 | 29 | 2026-06-25 |
| 2 | 00000236 | SHUT OFF VALVE 1/2 | A | 66 | 18 | 5 **LOW** | 9 | 18 | 2026-06-25 |
| 3 | 00000266 | 3/8 M X 1/2 OD COUPLER (66-8C) | A | 53 | 5 | 24 | 8 | 15 | 2026-06-22 |
| 4 | 00000306 | 1/2 MALE HOSE TAIL | B | 18 | 0 | 26 | 3 | 5 | 2026-03-16 |
| 5 | 00000245 | LOW PRESSURE C/O REG KIT 5KG(S) CRIMPED | B | 18 | 1 | 6 | 3 | 5 | 2026-05-11 |
| 6 | 00000274 | 1/2 F X 1/2 OD COUPLER | B | 18 | 5 | 5 | 4 | 5 | 2026-05-11 |
| 7 | 00000267 | 3/8 M X 3/8 OD COUPLER (68-6B) | B | 17 | 0 | 4 | 3 | 5 | 2026-03-04 |
| 8 | 00000246 | CHANGE OVER PIGTAIL 7/16 (500MM) BRASS | B | 16 | 9 | 3 **LOW** | 6 | 9 | 2026-06-22 |
| 9 | 00000305 | COUPLER 1/2 COPPER TO 8MM HOSE | B | 15 | 0 | 3 | 3 | 5 | 2026-02-25 |
| 10 | 00000251 | BULLNOSE REGULATOR LOW PRESSURE | B | 14 | 1 | 6 | 3 | 5 | 2026-06-04 |
| 11 | 00000277 | 3/8 F X 3/8 OD COUPLER (66-6C) | B | 14 | 2 | 6 | 3 | 5 | 2026-05-18 |
| 12 | 00000243 | LOW PRESSURE REG SINGLE 5KG (S) CRIMPED | B | 12 | 4 | 7 | 3 | 5 | 2026-06-12 |
| 13 | 00000263 | 1/2 X 1/2 UNION COUPLER (62-8) | B | 10 | 0 | 9 | 3 | 5 | 2026-04-09 |
| 14 | 00000271 | 1/4 M X 1/4 OD COUPLER (68-4A) | B | 7 | 7 | 5 | 5 | 7 | 2026-05-18 |
| 15 | 00000264 | 1/2M X 3/8 OD COUPLER (68-6C) | B | 5 | 5 | 9 | 4 | 5 | 2026-06-25 |
| 16 | 00000262 | 1/2 FEMALE HOSETAIL WASHER | B | 5 | 3 | 13 | 3 | 5 | 2026-06-25 |
| 17 | 00000242 | LOW PRESSURE INLINE REG SINGLE (M)BRASS | C | 4 | 0 | 3 | 1 | 3 | 2026-03-29 |
| 18 | 00000249 | GAS FILLING HOSE | C | 4 | 2 | 3 | 1 | 3 | 2026-06-23 |
| 19 | 00000237 | SHUT OFF VALVE 1/4 | C | 4 | 0 | 5 | 1 | 3 | 2026-02-17 |
| 20 | 00000268 | 3/8 M X 1/4 OD COUPLER (68-4C) | C | 4 | 0 | 1 | 1 | 3 | 2025-09-18 |
| 21 | 00000269 | 1/4 M X 1/2 OD COUPLER (68-8B) | C | 3 | 0 | 2 | 1 | 3 | 2025-11-30 |
| 22 | 00000252 | BULLNOSE REGULATOR WITH GAUGE | C | 3 | 0 | — | 1 | 3 | 2025-11-17 |
| 23 | 00000239 | SHUT OFF VALVE 3/8 BUTTERFLY | B | 3 | 3 | 7 | 3 | 5 | 2026-06-22 |
| 24 | 00000253 | BULLNOSE REGULATOR FOR OUTDOOR USE (4KG) | C | 3 | 0 | 7 | 1 | 3 | 2025-11-03 |
| 25 | 00000270 | 1/4'' M X 3/8'' OD COUPLER (68-6) | C | 2 | 0 | — | 1 | 3 | 2025-11-30 |
| 26 | 00000244 | LOW PRESSURE C/O REGULATOR KIT(M)BRASS | C | 2 | 0 | 3 | 1 | 3 | 2026-03-30 |
| 27 | 00000260 | 1/4 FEMALE HOSE TAIL | C | 2 | 1 | 1 | 1 | 3 | 2026-04-30 |
| 28 | 00000240 | UNIVERSAL THERMOCOUPLE 1500 MM | C | 2 | 0 | — | 1 | 3 | 2025-10-29 |
| 29 | 00000238 | SHUT OFF VALVE 1/4 BUTTERFLY | C | 1 | 0 | 6 | 1 | 3 | 2025-11-30 |
| 30 | 00000265 | 1/2M X 1/4 OD COUPLER (68-4D) | C | 1 | 0 | 3 | 1 | 3 | 2025-07-27 |
| 31 | 00000232 | BULLNOSE 'O' RING FOR PIGTAIL | C | 1 | 1 | 11 | 1 | 3 | 2026-06-14 |
| 32 | 00000256 | BRASS 'T' CONECTOR - 8MM | C | 1 | 0 | — | 1 | 3 | 2026-01-22 |
| 33 | 00000247 | CHANGEOVER VALVE | C | 0 | 0 | 9 | 1 | 3 | 2025-07-03 |
| 34 | 00000233 | BULLNOSE HANDWHEEL | C | 0 | 0 | 6 | 1 | 3 | 2025-05-01 |
| 35 | 00000278 | 1/4 F X 3/8 OD COUPLER | C | 0 | 0 | 3 | 1 | 3 | 2025-06-25 |
| 36 | 00000259 | 1/8 FEMALE HOSE TAIL | C | 0 | 0 | — | 1 | 3 | 2024-12-17 |
| 37 | 00000255 | ADAPTOR B X H | C | 0 | 0 | 9 | 1 | 3 | 2025-01-10 |
| 38 | 00000235 | SHUT OFF VALVE 3/4 | C | 0 | 0 | — | 1 | 3 | 2025-02-03 |
| 39 | 00000276 | 3/8 M X 1/2 OD COUPLER (66-8C) | C | 0 | 0 | — | 1 | 3 | 2024-10-22 |
| 40 | 00000317 | CHANGE OVER PIGTAIL 7/16 (1000MM) | C | 0 | 0 | — | 1 | 3 | 2025-02-06 |
| 41 | 00000248 | ADAPTOR C X B | C | 0 | 0 | 4 | 1 | 3 | 2025-03-14 |
| 42 | 00000241 | UNIVERSAL THERMOCOUPLE 900MM | C | 0 | 0 | 1 | 1 | 3 | 2025-04-02 |
| 43 | 00000129 | C40 GAS BURNER | C | 0 | 0 | — | 1 | 3 | 2023-09-10 |
| 44 | 00000257 | BRASS Y CONNECTOR - 8 MM | C | 0 | 0 | 1 | 1 | 3 | 2025-02-24 |
| 45 | 00000300 | LPG FILLING HOSE QAV TO BULLNOSE | C | 0 | 0 | — | 1 | 3 | 2024-07-24 |
| 46 | 00000258 | GAS HOSE 8MM 30M | C | 0 | 0 | 1 | 1 | 3 | 2024-11-25 |
| 47 | 00000113 | UNIVERSAL THERMOCOUPLE | C | 0 | 0 | 5 | 1 | 3 | — |
| 48 | 00000234 | LIQUID STEM | C | 0 | 0 | 4 | 1 | 3 | — |
| 49 | 00000254 | ADAPTOR C X B 45'' | C | 0 | 0 | — | 1 | 3 | — |
| 50 | 00000279 | 1/4 F X 1/4 OD COUPLER (66-4A) | C | 0 | 0 | 10 | 1 | 3 | — |
| 51 | 00000299 | PEX SLEEVE TAN 25MM | C | 0 | 0 | 50 | 1 | 3 | — |
| 52 | 00000250 | C40 GAS BURNER | C | 0 | 0 | — | 1 | 3 | — |
| 53 | 00000301 | PEX HOLDER BAT CLOSED 25MM | C | 0 | 0 | 50 | 1 | 3 | — |
| 54 | 00000272 | 1/4 M X 5/16 OD COUPLER (68-5A) | C | 0 | 0 | 3 | 1 | 3 | — |
| 55 | 00000273 | COUPLER 1/8M X 3/8 OD (68-6A) | C | 0 | 0 | 5 | 1 | 3 | — |
| 56 | 00000261 | 1/2 SOFT DRAWN COPPER-PER 15.24M COIL | C | 0 | 0 | — | 1 | 3 | — |
| 57 | 00000275 | 1/2F X 3/8 OD COUPLER (66-6D) | C | 0 | 0 | 2 | 1 | 3 | — |

### SKUs missing from STKCOUNT (13)

- 00000252
- 00000270
- 00000240
- 00000256
- 00000259
- 00000235
- 00000276
- 00000317
- 00000129
- 00000300
- 00000254
- 00000250
- 00000261

### Reorder alerts (2)

| Stock no | Description | On hand | Min | Suggested reorder |
|----------|-------------|---------|-----|-------------------|
| 00000236 | SHUT OFF VALVE 1/2 | 5 | 9 | 18 |
| 00000246 | CHANGE OVER PIGTAIL 7/16 (500MM) BRASS | 3 | 6 | 9 |


## Files

- CSV: `analysis/inventory/data/lpg_ac_migration_list.csv`
- SQL: `analysis/inventory/scripts/lpg_ac_reclassify.sql`

## ERP action (Pastel)

Bulk-update all 57 stock codes:

```
Category:      AGR  →  FIT
Product group: LPG AC  →  ACC
```

## Supabase action

Run `analysis/inventory/scripts/lpg_ac_reclassify.sql` in the SQL Editor.  
Review the PREVIEW queries before committing.
