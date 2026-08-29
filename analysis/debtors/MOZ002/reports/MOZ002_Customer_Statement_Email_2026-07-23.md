# MOZ002 — Customer statement email

**Prepared:** 2026-07-23  
**Account:** MOZ002 — MOZAMBIK  
**As-at:** 16 July 2026 (P17 ERP anchor, amended for invoice 49143 clearance)  
**Balance due:** R4,170.38  
**Status:** Ready to send — confirm ERP closing matches before dispatch

---

## Email fields

| Field | Value |
| :--- | :--- |
| **To** | *(MOZAMBIK accounts contact — add address)* |
| **From** | Accounts — Midlands Petroleum |
| **Subject** | MOZAMBIK — Statement update (account MOZ002) · Balance R4,170.38 |

---

## Body (copy from here)

Dear MOZAMBIK team,

Please find below an updated statement position for your account **MOZ002**, as at **16 July 2026**.

**Account balance due: R4,170.38**

We have applied your recent payments to the correct invoices, including your February and July transfers. Your account is now up to date on all deliveries through mid-July except the two items listed below.

**Outstanding invoices**

| Invoice | Delivery date | Amount |
| :--- | :--- | ---: |
| 50528 | 5 May 2026 | R4,329.29 |
| 51789 | 13 July 2026 | R4,820.01 |
| **Subtotal** | | **R9,149.30** |

**Credit on your account**

| Reference | Date | Amount |
| :--- | :--- | ---: |
| Payment 44227 | 7 May 2026 | R4,978.91 |

This credit has been deducted from the outstanding total above.

**Cylinder custody**

Our records show **no cylinders outstanding** on your account.

Kindly arrange payment of **R4,170.38** at your earliest convenience. If you have already remitted for either open invoice, please forward proof of payment so we can match it promptly.

Should you need a detailed statement or have any queries, please reply to this email and we will assist.

Kind regards,

**Accounts — Midlands Petroleum**  
Account: MOZ002 — MOZAMBIK

---

## Plain-text version (no tables)

```
Subject: MOZAMBIK — Statement update (account MOZ002) · Balance R4,170.38

Dear MOZAMBIK team,

Please find below an updated statement position for your account MOZ002, as at 16 July 2026.

Account balance due: R4,170.38

We have applied your recent payments to the correct invoices, including your February and July transfers. Your account is now up to date on all deliveries through mid-July except the two items listed below.

Outstanding invoices:
  • Invoice 50528 (5 May 2026) — R4,329.29
  • Invoice 51789 (13 July 2026) — R4,820.01
  Subtotal: R9,149.30

Credit on your account:
  • Payment 44227 (7 May 2026) — R4,978.91
  (Deducted from the subtotal above.)

Cylinder custody: No cylinders outstanding on your account.

Kindly arrange payment of R4,170.38 at your earliest convenience. If you have already remitted for either open invoice, please forward proof of payment so we can match it promptly.

Should you need a detailed statement or have any queries, please reply to this email and we will assist.

Kind regards,
Accounts — Midlands Petroleum
Account: MOZ002 — MOZAMBIK
```

---

## Operator reference (do not send)

| Item | Detail |
| :--- | :--- |
| ERP anchor | `raw/MOZ002P17.TXT` closing R8,010.08 @ 2026-07-16 |
| Adjustments applied | Invoice **49143** cleared (Feb payment reallocated from MOZ001); **50657** cleared by payment **45202** |
| Open LPG pool | 50528 + 51789 = R9,149.30 |
| On-account credit | 44227 R4,978.91 (VERIFIED_UNALLOCATED — netted in balance) |
| Bridge | R9,149.30 − R4,978.91 = **R4,170.39** (email uses R4,170.38 per P17 − 49143) |
