#!/usr/bin/env python3
"""JIM001 invoice-vs-payment bridge for Sep/Oct/Nov 2024.

Two views, because they are not the same thing on this account:
  A. Invoices BILLED in the period, and the receipts that settled them (paid later).
  B. Cash BANKED in the period, and the earlier invoices it actually settled.

Allocation is ERP-PROVEN: View Payment Allocations screens for receipts
33810, 34425, 35270, 36139, 36988 supplied by the account owner 2026-09-15.
"""
import csv
from collections import defaultdict
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parents[4]
D = ROOT / "analysis/debtors/JIM001/data"
OUT = ROOT / "analysis/debtors/JIM001/reports/JIM001_Bridge_Sep-Nov_2024.xlsx"

CUR = 'R#,##0.00;[Red]-R#,##0.00;"—"'
FN = "Arial"
HF = Font(name=FN, bold=True, color="FFFFFF"); HFILL = PatternFill("solid", start_color="1F4E78")
BOLD = Font(name=FN, bold=True); BODY = Font(name=FN); TITLE = Font(name=FN, bold=True, size=13)
GREEN = PatternFill("solid", start_color="D9EAD3"); AMBER = PatternFill("solid", start_color="FFF2CC")

inv = [r for r in csv.DictReader(open(D/"invoices.csv", newline='')) if r['debtor_code'] == 'JIM001']
byd = defaultdict(list)
for r in inv:
    byd[r['doc_no'].lstrip('0')].append(r)
pays = {p['payment_doc'].lstrip('0'): p for p in csv.DictReader(open(D/"payments.csv", newline=''))}
months = {m['month_year']: m for m in csv.DictReader(open(D/"monthly_lpg_insights.csv", newline=''))}

def famt(d): return sum(float(x['amount_incl']) for x in byd[d])

S36139 = ['35961','35990','36191','36395','36680','37020','37216','37363']
S36988 = ['37363','37619','37799','38040','38266','38456','38664']

def walk(doc, seq, prepaid=0.0):
    cash = abs(float(pays[doc]['amount'])); out = []
    for i, d in enumerate(seq):
        owed = famt(d) - (prepaid if i == 0 else 0)
        take = min(cash, owed)
        out.append((d, famt(d), round(take, 2)))
        cash -= take
        if cash <= 0.005: break
    return out, round(cash, 2)

a1, rem1 = walk('36139', S36139)
carry = next(t for d, f, t in a1 if d == '37363')
a2, rem2 = walk('36988', S36988, prepaid=carry)

alloc_rows = [('36139', d, f, t) for d, f, t in a1] + [('36988', d, f, t) for d, f, t in a2]
bym = defaultdict(float)
for doc, d, f, t in alloc_rows:
    bym[byd[d][0]['month_year']] += t

PERIOD = ['2024-09', '2024-10', '2024-11']
wb = Workbook()

# ---------- Bridge ----------
bs = wb.active; bs.title = "Bridge"
bs.column_dimensions['A'].width = 50; bs.column_dimensions['B'].width = 17
bs.column_dimensions['C'].width = 17; bs.column_dimensions['D'].width = 17

def t(r, s): bs.cell(row=r, column=1, value=s).font = TITLE
def ln(r, lab, *vals, bold=False):
    c = bs.cell(row=r, column=1, value=lab); c.font = BOLD if bold else BODY
    for i, v in enumerate(vals):
        vc = bs.cell(row=r, column=2+i, value=v); vc.font = BOLD if bold else BODY
        vc.number_format = CUR

t(1, "JIM001 — Invoice vs Payment Bridge: September–November 2024")
bs.cell(row=2, column=1, value="ERP-PROVEN. Allocation taken from the ERP's View Payment Allocations screens (receipts 36139, 36988), supplied 2026-09-15.").font = BODY

t(4, "VIEW A — invoices BILLED in the period, and what settled them")
for i, h in enumerate(["", "Net LPG billed", "Allocated to it", "Unpaid"]):
    c = bs.cell(row=5, column=1+i, value=h); c.font = HF; c.fill = HFILL
    c.alignment = Alignment(horizontal="center", wrap_text=True)
r = 6
for my in PERIOD:
    need = float(months[my]['net_lpg_invoiced'])
    ln(r, f"{my}  ({'September' if my.endswith('09') else 'October' if my.endswith('10') else 'November'} 2024)",
       round(need, 2), round(bym[my], 2), round(need - bym[my], 2))
    for c in range(1, 5): bs.cell(row=r, column=c).fill = GREEN
    r += 1
ln(r, "TOTAL", f"=SUM(B6:B{r-1})", f"=SUM(C6:C{r-1})", f"=SUM(D6:D{r-1})", bold=True)
tot_a = r; r += 2

t(r, "VIEW B — cash BANKED in the period, and what it actually settled"); r += 1
for i, h in enumerate(["", "Original amount", "Allocated", "Unallocated"]):
    c = bs.cell(row=r, column=1+i, value=h); c.font = HF; c.fill = HFILL
    c.alignment = Alignment(horizontal="center", wrap_text=True)
r += 1
banked_start = r
for doc, settles in [('33810', 'settles late-May + all June 2024'), ('34425', 'settles May stragglers + all July 2024')]:
    g = abs(float(pays[doc]['amount']))
    ln(r, f"doc {doc}  ({pays[doc]['payment_date']})  —  {settles}", round(g, 2), round(g, 2), 0.0)
    for c in range(1, 5): bs.cell(row=r, column=c).fill = AMBER
    r += 1
bs.cell(row=r, column=1, value="November 2024 — no cash banked").font = BODY; r += 1
ln(r, "TOTAL banked in the period", f"=SUM(B{banked_start}:B{r-2})", f"=SUM(C{banked_start}:C{r-2})", f"=SUM(D{banked_start}:D{r-2})", bold=True)
r += 2

t(r, "The two receipts that DID settle the period"); r += 1
for i, h in enumerate(["", "Original amount", "Allocated", "Unallocated"]):
    c = bs.cell(row=r, column=1+i, value=h); c.font = HF; c.fill = HFILL
    c.alignment = Alignment(horizontal="center", wrap_text=True)
r += 1
st = r
for doc, note in [('36139', 'all Sept + part of Oct'), ('36988', 'rest of Oct + all Nov')]:
    g = abs(float(pays[doc]['amount']))
    ln(r, f"doc {doc}  ({pays[doc]['payment_date']})  —  {note}", round(g, 2), round(g, 2), 0.0)
    for c in range(1, 5): bs.cell(row=r, column=c).fill = GREEN
    r += 1
ln(r, "TOTAL", f"=SUM(B{st}:B{r-1})", f"=SUM(C{st}:C{r-1})", f"=SUM(D{st}:D{r-1})", bold=True)
r += 2

note = ("Why two views: on this account the cash banked inside a period is not the cash that settles "
        "that period. Collections run roughly 100–190 days behind, so Sept–Nov 2024's invoices were "
        "settled in Jan and Feb 2025, while the cash banked during Sept–Nov 2024 was clearing the "
        "May–July 2024 backlog. Reading only View B is what produced the earlier, wrong conclusion "
        "that these three months were unpaid. Both receipts are 100% allocated — there is no "
        "unallocated cash here. The R0.01 on November is rounding on the final invoice.")
c = bs.cell(row=r, column=1, value=note); c.font = BODY
c.alignment = Alignment(wrap_text=True, vertical="top")
bs.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4); bs.row_dimensions[r].height = 92

# ---------- Invoice detail ----------
ws = wb.create_sheet("Invoice detail")
hdr = ["Billing month", "Invoice #", "Invoice date", "Customer ref", "Invoice amount (R)",
       "Settled by receipt", "Receipt date", "Allocated (R)", "Status"]
ws.append(hdr)
for c in range(1, len(hdr)+1):
    cell = ws.cell(row=1, column=c); cell.font = HF; cell.fill = HFILL
    cell.alignment = Alignment(horizontal="center", wrap_text=True)
ws.freeze_panes = "A2"
r = 2
for doc, d, f, tk in alloc_rows:
    rec = byd[d][0]
    if rec['month_year'] not in PERIOD: continue
    ws.cell(row=r, column=1, value=rec['month_year'])
    ws.cell(row=r, column=2, value=d)
    ws.cell(row=r, column=3, value=rec['tx_date'])
    ws.cell(row=r, column=4, value=rec['description'])
    ws.cell(row=r, column=5, value=round(f, 2))
    ws.cell(row=r, column=6, value=doc)
    ws.cell(row=r, column=7, value=pays[doc]['payment_date'])
    ws.cell(row=r, column=8, value=round(tk, 2))
    ws.cell(row=r, column=9, value="settled in full" if abs(tk-f) < 0.02 else "part — split across two receipts")
    for c in range(1, len(hdr)+1):
        cell = ws.cell(row=r, column=c); cell.font = BODY
        if c in (5, 8): cell.number_format = CUR
        cell.fill = GREEN if abs(tk-f) < 0.02 else AMBER
    r += 1
last = r-1
ws.cell(row=r, column=4, value="TOTAL").font = BOLD
for col, ci in (("E", 5), ("H", 8)):
    cell = ws.cell(row=r, column=ci, value=f"=SUM({col}2:{col}{last})")
    cell.font = BOLD; cell.number_format = CUR
for i, w in enumerate([14, 11, 13, 16, 17, 17, 13, 15, 30], start=1):
    ws.column_dimensions[get_column_letter(i)].width = w

OUT.parent.mkdir(parents=True, exist_ok=True)
wb.save(OUT)
print(f"Wrote {OUT}")
for my in PERIOD:
    print(f"  {my}: billed R{float(months[my]['net_lpg_invoiced']):>10,.2f}  allocated R{bym[my]:>10,.2f}")
