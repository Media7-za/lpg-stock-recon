# JEN001 — Opening Balance Bridge (2026-09-01)

**Purpose:** Itemise DEBENQ B/F for customer Statement of Account account-level section.

| Component | Amount (R) | Basis |
| :--- | ---: | :--- |
| Invoice 48675 (08 Jan 2026, DN-21759) | 2,589.05 | Pre-Jul 2026 open LPG |
| Invoice 49752 (16 Mar 2026, DN#22130) | 1,471.95 | Pre-Jul 2026 open LPG |
| Invoice 50146 (09 Apr 2026, DN-22304) | 3,448.83 | Pre-Jul 2026 open LPG |
| Invoice 50318 (20 Apr 2026, DN-22337) | 3,448.83 | Pre-Jul 2026 open LPG |
| Invoice 50536 (05 May 2026, DN#22364) | 5,082.47 | Pre-Jul 2026 open LPG |
| Invoice 50754 (18 May 2026, DN#22734) | 4,140.00 | Pre-Jul 2026 open LPG |
| Invoice 50970 (01 Jun 2026, DN#22452) | 2,920.68 | Pre-Jul 2026 open LPG |
| Cylinder deposit net (1 Jul 2026) | -517.50 | v5 Part 1B opening |
| LPG opening tie to ERP B/F (Part 1A vs invoice list) | -496.21 | Closes gap to DEBENQ B/F R22,088.10 |
| **Total (ERP B/F)** | **22,088.10** | PROVEN — `raw/DEBENQ.TXT` line 14 |

Regenerate SOA after `--write`:
```bash
npm run debtors:customer-statement -- --debtor JEN001 --as-at 2026-09-01 --pdf
```
