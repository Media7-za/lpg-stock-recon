# LIN001 — Proof of Event 4 shortage R477.83

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD  
**Window:** last 4 events (DN#22936 → reconstructed Event 4)  
**Identity:** `Invoice − Credit note − Surplus from last event − Payment = Total`  
Negative Total = Surplus carried forward. Positive Total = Shortage.

Two independent routes give the same figure. Both use Decimal (2 d.p.).

---

## Route 1 — event-by-event roll-forward

### Event 1 — DN#22936 (2026-07-08)

| Line | Amount | Source | Tag |
|---|---:|---|---|
| Invoice 51681 | R134,049.19 | ERP | PROVEN |
| Less CN 15215 | R80,097.50 | ERP | PROVEN |
| **Balance** | **R53,951.69** | 134,049.19 − 80,097.50 | PROVEN |
| Surplus from last event | R0.00 | first event in this chain | — |
| Add payment EXT-2744666881 | R54,981.36 | bank receipt | ASSERTED |
| **Total** | **Surplus R1,029.67** | 53,951.69 − 0 − 54,981.36 | computed |

### Event 2 — DN#23974 (2026-08-24)

| Line | Amount | Source | Tag |
|---|---:|---|---|
| Invoice 52768 | R69,652.80 | ERP | PROVEN |
| Less CN 15543 | R39,445.00 | ERP | PROVEN |
| **Balance** | **R30,207.80** | 69,652.80 − 39,445.00 | PROVEN |
| Surplus from last event | R1,029.67 | Event 1 Total | computed |
| Add payment EXT-2901239645 | R34,721.00 | bank receipt | ASSERTED |
| **Total** | **Surplus R5,542.87** | 30,207.80 − 1,029.67 − 34,721.00 | computed |

### Event 3 — DN#24947 (2026-09-02)

| Line | Amount | Source | Tag |
|---|---:|---|---|
| Invoice 52924 | R74,433.70 | ERP | PROVEN |
| Less CN 15592 | R69,000.00 | ERP (header = 5-SKU sum) | PROVEN |
| **Balance** | **R5,433.70** | 74,433.70 − 69,000.00 | PROVEN |
| Surplus from last event | R5,542.87 | Event 2 Total | computed |
| Add payment 45961 | R28,163.00 | ERP PC-76-35 | ASSERTED |
| **Total** | **Surplus R28,272.17** | 5,433.70 − 5,542.87 − 28,163.00 | computed |

### Event 4 — Proforma 2026-09-04 (ERP forthcoming)

| Line | Amount | Source | Tag |
|---|---:|---|---|
| Invoice LPG 70×9kg @ R232.74 | R16,291.80 | proforma image | ASSERTED |
| Invoice CYL 70×9.1 @ R517.50 | R36,225.00 | dual-line reconstruction | ASSUMED |
| **Invoice total** | **R52,516.80** | 16,291.80 + 36,225.00 | computed |
| Less CN 8×48kg @ R1,207.50 | R9,660.00 | operator: ERP will post | ASSERTED |
| **Balance** | **R42,856.80** | 52,516.80 − 9,660.00 | computed |
| Surplus from last event | R28,272.17 | Event 3 Total | computed |
| Add payment (R13,416.80 + R690.00) | R14,106.80 | two bank receipts | ASSERTED |
| **Total** | **Shortage R477.83** | 42,856.80 − 28,272.17 − 14,106.80 | computed |

```
R42,856.80
− R28,272.17
────────────
  R14,584.63
− R14,106.80
────────────
  R   477.83  Shortage
```

---

## Route 2 — one-line aggregate (same four events)

Does not depend on which event the surplus is attributed to.

```
Σ Invoices     R330,652.49
− Σ Credit notes  R198,202.50
────────────────────────────
Σ Balances        R132,449.99
− Σ Payments      R131,972.16
────────────────────────────
                  R    477.83  Shortage
```

| Component | Amount |
|---|---:|
| 51681 + 52768 + 52924 + reconstructed Event 4 | R134,049.19 + R69,652.80 + R74,433.70 + R52,516.80 = **R330,652.49** |
| 15215 + 15543 + 15592 + 8×48kg CN | R80,097.50 + R39,445.00 + R69,000.00 + R9,660.00 = **R198,202.50** |
| EXT-2744666881 + EXT-2901239645 + 45961 + two Event 4 receipts | R54,981.36 + R34,721.00 + R28,163.00 + R14,106.80 = **R131,972.16** |

**Route 1 Total = Route 2 result = R477.83.** Both routes agree exactly.

---

## What this figure is — and is not

**It is:** the mechanical result of rolling Events 1–3 closing surplus into Event 4, after reconstructing Event 4 as LPG + 70×9.1 invoice minus a forthcoming 8×48kg CN.

**It is not:** an ERP current-balance figure. Event 4 invoice and CN are **not yet in Supabase**. The 70×9.1 invoice slice is **ASSUMED** (qty matches fills). The 8×48kg CN is **ASSERTED** (operator: ERP will post). Event 1–2 payments are bank receipts, not ERP payment docs.

**It also does not mean the 9kg deposits are settled.** The R9,660 CN is 48kg only. **70 × 9.1 = R36,225.00** remains on Event 4’s invoice after this CN.

If Event 3 surplus is **not** applied to Event 4, the same Event 4 balance vs payments is:

```
R42,856.80 − R14,106.80 = R28,750.00  Shortage
```

R477.83 is only the running-carry version.

---

## Artifacts

| Artifact | Path |
|---|---|
| Event cards | `LIN001_event_DN22936.md`, `LIN001_event_DN23974.md`, `LIN001_event_DN24947.md`, `LIN001_event_2026-09-04_proforma.md` |
| Structured data | `analysis/debtors/LIN001/config/events.json` |
