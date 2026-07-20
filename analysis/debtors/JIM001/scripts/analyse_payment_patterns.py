"""
analyse_payment_patterns.py — JIM001 Pattern Interrogation Script 3
====================================================================
Broad pattern scan across all 540 payment rows. Three analyses:

  A) STAT sequence integrity — identifies gaps, duplicates, and
     out-of-order STAT numbers in the batch reference sequence

  B) Payment consolidation — groups multi-row ERP payment docs into
     single economic events, showing total cash per payment date

  C) Residual analysis — for each consolidated payment, shows how
     much remains unmatched after current allocation_edges are applied,
     and attempts to identify candidate unpaid invoices for each residual

Outputs:
  - Console report for all three analyses
  - Writes: analysis/debtors/JIM001/data/payment_pattern_analysis.csv
"""

import os
import re
import csv
from datetime import datetime
from collections import defaultdict
from sqlalchemy import create_engine, text
import pandas as pd

DEBTOR_CODE = "JIM001"
OUTPUT_DIR = f"analysis/debtors/{DEBTOR_CODE}/data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "payment_pattern_analysis.csv")
ALLOC_FILE = os.path.join(OUTPUT_DIR, "allocation_edges.csv")

SUPABASE_URL = os.environ.get(
    "SUPABASE_URL",
    os.environ['DATABASE_URL']
)


def load_data():
    try:
        engine = create_engine(SUPABASE_URL)
        with engine.connect() as conn:
            df_pmts = pd.read_sql_query(text(f"""
                SELECT doc_no, tx_date, ref_no, batch_ref, description,
                       amount_excl, tax_amount,
                       (amount_excl + tax_amount) AS amount_incl
                FROM transaction_headers
                WHERE account_no = '{DEBTOR_CODE}'
                  AND entry_type = 'Payment'
                ORDER BY tx_date, doc_no
            """), conn)

            df_inv = pd.read_sql_query(text(f"""
                SELECT doc_no, tx_date,
                       (amount_excl + tax_amount) AS amount_incl
                FROM transaction_headers
                WHERE account_no = '{DEBTOR_CODE}'
                  AND entry_type = 'Invoice'
                ORDER BY tx_date
            """), conn)

        print(f"Loaded {len(df_pmts)} payment rows, {len(df_inv)} invoice rows from database.")
        return df_pmts.to_dict(orient="records"), df_inv.to_dict(orient="records")
    except Exception as e:
        print(f"DB connection failed: {e}")
        return [], []


def load_allocation_edges():
    if not os.path.exists(ALLOC_FILE):
        return []
    with open(ALLOC_FILE) as f:
        return list(csv.DictReader(f))


def extract_stat_number(batch_ref):
    """Extract numeric STAT sequence number from batch_ref string."""
    if not batch_ref:
        return None
    match = re.search(r'STAT[:\s]*(\d+)', str(batch_ref), re.IGNORECASE)
    if match:
        return int(match.group(1))
    return None


def parse_date(val):
    try:
        return datetime.strptime(str(val)[:10], "%Y-%m-%d")
    except Exception:
        return None


# ─────────────────────────────────────────────────────────────
# A) STAT SEQUENCE INTEGRITY
# ─────────────────────────────────────────────────────────────
def analyse_stat_sequence(payments):
    stat_map = {}  # stat_num -> list of rows
    no_stat = []

    for r in payments:
        n = extract_stat_number(r.get("batch_ref", ""))
        if n is not None:
            stat_map.setdefault(n, []).append(r)
        else:
            no_stat.append(r)

    stat_nums = sorted(stat_map.keys())
    min_stat = min(stat_nums) if stat_nums else 0
    max_stat = max(stat_nums) if stat_nums else 0
    expected = set(range(min_stat, max_stat + 1))
    found = set(stat_nums)
    missing = sorted(expected - found)
    duplicated = [n for n in stat_nums if len(stat_map[n]) > 1]

    print()
    print("=" * 70)
    print("A) STAT SEQUENCE INTEGRITY")
    print("=" * 70)
    print(f"  STAT range          : STAT:{min_stat} → STAT:{max_stat}")
    print(f"  Unique STAT numbers : {len(found)}")
    print(f"  Expected in range   : {max_stat - min_stat + 1}")
    print(f"  Missing STATs       : {len(missing)} → {missing if missing else 'None'}")
    print(f"  Multi-row STATs     : {len(duplicated)} → {duplicated if duplicated else 'None'}")
    print(f"  Payments without STAT: {len(no_stat)}")

    if no_stat:
        print(f"\n  Non-STAT payments:")
        for r in no_stat[:10]:
            amt = float(r["amount_incl"])
            print(f"    {r['doc_no']} | {r['tx_date']} | {r['batch_ref']} | R{amt:,.2f}")

    return stat_map, missing


# ─────────────────────────────────────────────────────────────
# B) PAYMENT CONSOLIDATION
# ─────────────────────────────────────────────────────────────
def consolidate_payments(payments):
    by_doc = defaultdict(list)
    for r in payments:
        by_doc[r["doc_no"]].append(r)

    consolidated = []
    for doc_no, rows in sorted(by_doc.items(), key=lambda x: x[1][0]["tx_date"]):
        # Net the rows (Alloc pairs cancel, real cash is what remains)
        gross_neg = sum(float(r["amount_incl"]) for r in rows if float(r["amount_incl"]) < 0)
        gross_pos = sum(float(r["amount_incl"]) for r in rows if float(r["amount_incl"]) > 0)
        net = gross_neg + gross_pos  # negative = money in
        real_cash = abs(gross_neg)   # economic payment = absolute negative leg

        alloc_rows = [r for r in rows if r.get("ref_no", "") not in ("Alloc", "Recon")]
        alloc_ref = alloc_rows[0]["ref_no"] if alloc_rows else "—"

        consolidated.append({
            "doc_no": doc_no,
            "tx_date": str(rows[0]["tx_date"])[:10],
            "batch_ref": rows[0]["batch_ref"] or "—",
            "stat_no": extract_stat_number(rows[0]["batch_ref"]),
            "real_cash_amount": real_cash,
            "gross_positive_legs": gross_pos,
            "net_amount": round(net, 2),
            "row_count": len(rows),
            "has_alloc_mirror": gross_pos > 0,
            "ref_no": alloc_ref,
            "description": rows[0]["description"] or "—",
        })

    print()
    print("=" * 70)
    print("B) PAYMENT CONSOLIDATION")
    print("=" * 70)
    print(f"  Total payment rows     : {len(payments)}")
    print(f"  Distinct payment docs  : {len(consolidated)}")
    print(f"  Docs with Alloc mirrors: {sum(1 for c in consolidated if c['has_alloc_mirror'])}")
    total_real_cash = sum(c["real_cash_amount"] for c in consolidated)
    print(f"  Total real cash in     : R{total_real_cash:,.2f}")

    return consolidated


# ─────────────────────────────────────────────────────────────
# C) RESIDUAL ANALYSIS
# ─────────────────────────────────────────────────────────────
def analyse_residuals(consolidated, edges, invoices):
    # Build allocated totals per payment doc
    alloc_by_doc = defaultdict(float)
    for e in edges:
        alloc_by_doc[e["payment_doc"]] += float(e["allocated_amount"])

    results = []
    total_residual = 0.0

    print()
    print("=" * 90)
    print("C) RESIDUAL ANALYSIS — Payments with unmatched remainder after allocation")
    print("=" * 90)
    print(f"  {'Doc':>12} | {'Date':>12} | {'STAT':>8} | {'Cash In':>12} | {'Allocated':>12} | {'Residual':>12} | Match candidate")
    print(f"  {'-'*12}-+-{'-'*12}-+-{'-'*8}-+-{'-'*12}-+-{'-'*12}-+-{'-'*12}-+-{'-'*30}")

    for c in sorted(consolidated, key=lambda x: x["tx_date"]):
        doc = c["doc_no"]
        cash_in = c["real_cash_amount"]
        allocated = alloc_by_doc.get(doc, 0.0)
        residual = round(cash_in - allocated, 2)

        if residual < 1.0:
            continue

        total_residual += residual

        # Try to find a candidate invoice for this residual
        pmt_date = parse_date(c["tx_date"])
        candidate = "—"
        for inv in invoices:
            inv_amt = float(inv["amount_incl"])
            inv_date = parse_date(inv["tx_date"])
            if inv_date and pmt_date:
                delta = (pmt_date - inv_date).days
                if abs(inv_amt - residual) < 50 and -30 <= delta <= 120:
                    candidate = f"{inv['doc_no']} R{inv_amt:,.2f} ({delta}d)"
                    break

        stat = f"STAT:{c['stat_no']}" if c["stat_no"] else c["batch_ref"]
        print(f"  {doc:>12} | {c['tx_date']:>12} | {stat:>8} | {cash_in:>12,.2f} | {allocated:>12,.2f} | {residual:>12,.2f} | {candidate}")

        results.append({
            "payment_doc": doc,
            "payment_date": c["tx_date"],
            "batch_ref": c["batch_ref"],
            "stat_no": c["stat_no"],
            "real_cash_amount": cash_in,
            "total_allocated": allocated,
            "residual": residual,
            "candidate_invoice": candidate,
        })

    print(f"  {'-'*90}")
    print(f"  Total unmatched residual: R{total_residual:,.2f}")
    print(f"  Payments with residual  : {len(results)}")

    return results


def write_output(results):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    if not results:
        print("\nNo residual data to write.")
        return
    fields = list(results[0].keys())
    with open(OUTPUT_FILE, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(results)
    print(f"\nOutput written to: {OUTPUT_FILE}")


if __name__ == "__main__":
    payments, invoices = load_data()
    edges = load_allocation_edges()

    if not payments:
        print("No payment data loaded.")
        exit(1)

    print(f"Allocation edges loaded: {len(edges)}")

    stat_map, missing_stats = analyse_stat_sequence(payments)
    consolidated = consolidate_payments(payments)
    residuals = analyse_residuals(consolidated, edges, invoices)
    write_output(residuals)
