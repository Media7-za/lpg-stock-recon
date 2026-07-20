"""
analyse_blank_refs.py — JIM001 Pattern Interrogation Script 2
=============================================================
Profiles the 17 payment rows where ref_no is blank — i.e. no
explicit ERP link to an invoice. These are the genuinely unanchored
payments that the matching engine must handle via heuristics.

For each blank-ref payment, attempts:
  1. Exact amount match against open invoices within ±90 days
  2. Partial amount match (within R50) against any invoice
  3. STAT window proximity grouping

Outputs:
  - Console report with match candidates for each payment
  - Writes: analysis/debtors/JIM001/data/blank_ref_analysis.csv
"""

import os
import csv
from datetime import datetime, timedelta
from collections import defaultdict
from sqlalchemy import create_engine, text
import pandas as pd

DEBTOR_CODE = "JIM001"
OUTPUT_DIR = f"analysis/debtors/{DEBTOR_CODE}/data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "blank_ref_analysis.csv")

SUPABASE_URL = os.environ.get(
    "SUPABASE_URL",
    os.environ['DATABASE_URL']
)

EXACT_WINDOW_DAYS = 90
FUZZY_TOLERANCE = 50.0


def load_data():
    try:
        engine = create_engine(SUPABASE_URL)
        with engine.connect() as conn:
            df_blank = pd.read_sql_query(text(f"""
                SELECT doc_no, tx_date, ref_no, batch_ref, description,
                       amount_excl, tax_amount,
                       (amount_excl + tax_amount) AS amount_incl
                FROM transaction_headers
                WHERE account_no = '{DEBTOR_CODE}'
                  AND entry_type = 'Payment'
                  AND (ref_no IS NULL OR ref_no = '')
                ORDER BY tx_date
            """), conn)

            df_inv = pd.read_sql_query(text(f"""
                SELECT doc_no, tx_date,
                       (amount_excl + tax_amount) AS amount_incl
                FROM transaction_headers
                WHERE account_no = '{DEBTOR_CODE}'
                  AND entry_type = 'Invoice'
                ORDER BY tx_date
            """), conn)

        print(f"Loaded {len(df_blank)} blank-ref payment rows.")
        print(f"Loaded {len(df_inv)} invoice headers for matching.")
        return df_blank.to_dict(orient="records"), df_inv.to_dict(orient="records")
    except Exception as e:
        print(f"DB connection failed: {e}")
        return [], []


def parse_date(val):
    if isinstance(val, datetime):
        return val
    try:
        return datetime.strptime(str(val)[:10], "%Y-%m-%d")
    except Exception:
        return None


def analyse(blank_payments, invoices):
    # Consolidate by doc_no (split rows under same doc = one real payment)
    by_doc = defaultdict(list)
    for r in blank_payments:
        by_doc[r["doc_no"]].append(r)

    results = []

    print()
    print("=" * 90)
    print("BLANK-REF PAYMENT ANALYSIS")
    print("=" * 90)

    for doc_no, rows in sorted(by_doc.items(), key=lambda x: x[1][0]["tx_date"]):
        # Sum all rows under this doc (handles ERP multi-line payments)
        total_amt = abs(sum(float(r["amount_incl"]) for r in rows))
        pmt_date = parse_date(rows[0]["tx_date"])
        batch_ref = rows[0]["batch_ref"] or "—"
        description = rows[0]["description"] or "—"
        row_count = len(rows)

        print(f"\n{'─'*90}")
        print(f"  Payment: {doc_no} | Date: {pmt_date.date()} | STAT: {batch_ref} | Amount: R{total_amt:,.2f} | Rows: {row_count}")

        match_type = "UNMATCHED"
        match_candidates = []

        # 1. Exact amount match within window
        for inv in invoices:
            inv_date = parse_date(inv["tx_date"])
            inv_amt = float(inv["amount_incl"])
            if inv_date and pmt_date:
                delta = abs((pmt_date - inv_date).days)
                if abs(inv_amt - total_amt) < 0.05 and delta <= EXACT_WINDOW_DAYS:
                    match_candidates.append({
                        "candidate_doc": inv["doc_no"],
                        "candidate_date": str(inv_date.date()),
                        "candidate_amount": inv_amt,
                        "delta_days": delta,
                        "match_quality": "EXACT",
                    })

        # 2. Fuzzy amount match (within tolerance) if no exact found
        if not match_candidates:
            for inv in invoices:
                inv_date = parse_date(inv["tx_date"])
                inv_amt = float(inv["amount_incl"])
                if inv_date and pmt_date:
                    delta = abs((pmt_date - inv_date).days)
                    if abs(inv_amt - total_amt) <= FUZZY_TOLERANCE and delta <= EXACT_WINDOW_DAYS:
                        match_candidates.append({
                            "candidate_doc": inv["doc_no"],
                            "candidate_date": str(inv_date.date()),
                            "candidate_amount": inv_amt,
                            "delta_days": delta,
                            "match_quality": "FUZZY",
                        })

        # Sort by delta days
        match_candidates.sort(key=lambda x: x["delta_days"])

        if match_candidates:
            match_type = match_candidates[0]["match_quality"]
            print(f"  Match candidates ({match_type}):")
            for c in match_candidates[:5]:
                print(f"    → {c['candidate_doc']} | {c['candidate_date']} | R{c['candidate_amount']:,.2f} | {c['delta_days']}d gap")
        else:
            print(f"  ⚠️  No match candidates found within ±{EXACT_WINDOW_DAYS} days / R{FUZZY_TOLERANCE}")

        results.append({
            "payment_doc": doc_no,
            "payment_date": str(pmt_date.date()) if pmt_date else "",
            "batch_ref": batch_ref,
            "payment_amount": total_amt,
            "row_count": row_count,
            "match_type": match_type,
            "top_candidate_doc": match_candidates[0]["candidate_doc"] if match_candidates else "—",
            "top_candidate_date": match_candidates[0]["candidate_date"] if match_candidates else "—",
            "top_candidate_amount": match_candidates[0]["candidate_amount"] if match_candidates else 0,
            "top_candidate_delta_days": match_candidates[0]["delta_days"] if match_candidates else -1,
            "candidate_count": len(match_candidates),
        })

    print(f"\n{'='*90}")
    print(f"Summary:")
    exact = [r for r in results if r["match_type"] == "EXACT"]
    fuzzy = [r for r in results if r["match_type"] == "FUZZY"]
    unmatched = [r for r in results if r["match_type"] == "UNMATCHED"]
    print(f"  Exact matches     : {len(exact)}")
    print(f"  Fuzzy matches     : {len(fuzzy)}")
    print(f"  No match found    : {len(unmatched)}")
    if unmatched:
        print(f"  Unmatched payments:")
        for r in unmatched:
            print(f"    {r['payment_doc']} | {r['payment_date']} | {r['batch_ref']} | R{r['payment_amount']:,.2f}")

    return results


def write_output(results):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    if not results:
        print("\nNo data to write.")
        return
    fields = list(results[0].keys())
    with open(OUTPUT_FILE, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(results)
    print(f"\nOutput written to: {OUTPUT_FILE}")


if __name__ == "__main__":
    blanks, invoices = load_data()
    if blanks:
        results = analyse(blanks, invoices)
        write_output(results)
    else:
        print("No blank-ref payments found.")
