"""
analyse_alloc_pairs.py — JIM001 Pattern Interrogation Script 1
==============================================================
Identifies and collapses ERP internal reallocation entries where
ref_no = 'Alloc' or ref_no = 'Recon'. These are mirror +/- pairs
posted under the same doc_no by the ERP when it re-allocates a
previously posted payment. They carry no real cash movement.

Outputs:
  - Console report of all Alloc/Recon doc groups
  - Flags any group that does NOT net to zero (genuine ledger issue)
  - Writes: analysis/debtors/JIM001/data/alloc_pair_analysis.csv
"""

import os
import csv
from collections import defaultdict
from sqlalchemy import create_engine, text
import pandas as pd

DEBTOR_CODE = "JIM001"
OUTPUT_DIR = f"analysis/debtors/{DEBTOR_CODE}/data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "alloc_pair_analysis.csv")

SUPABASE_URL = os.environ.get(
    "SUPABASE_URL",
    "postgresql+psycopg2://postgres.oqhpxnaadahohwkslive:lpg-stock-recon@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
)


def load_data():
    try:
        engine = create_engine(SUPABASE_URL)
        with engine.connect() as conn:
            df = pd.read_sql_query(text(f"""
                SELECT doc_no, tx_date, ref_no, batch_ref, description,
                       amount_excl, tax_amount,
                       (amount_excl + tax_amount) AS amount_incl
                FROM transaction_headers
                WHERE account_no = '{DEBTOR_CODE}'
                  AND entry_type = 'Payment'
                  AND ref_no IN ('Alloc', 'Recon')
                ORDER BY tx_date, doc_no
            """), conn)
        print(f"Loaded {len(df)} Alloc/Recon payment rows from database.")
        return df.to_dict(orient="records")
    except Exception as e:
        print(f"DB connection failed: {e}")
        return []


def analyse(rows):
    # Group by doc_no
    by_doc = defaultdict(list)
    for r in rows:
        by_doc[r["doc_no"]].append(r)

    results = []
    print()
    print("=" * 80)
    print(f"{'Doc No':>12} | {'Date':>12} | {'STAT':>10} | {'Row Count':>9} | {'Net Amount':>12} | Status")
    print("=" * 80)

    total_noise = 0.0
    leaky_groups = []

    for doc_no, group in sorted(by_doc.items(), key=lambda x: x[1][0]["tx_date"]):
        net = sum(float(r["amount_incl"]) for r in group)
        date = group[0]["tx_date"]
        batch = group[0]["batch_ref"]
        row_count = len(group)
        net_rounded = round(net, 2)

        if abs(net_rounded) < 0.05:
            status = "✅ NETS TO ZERO — noise"
            total_noise += sum(abs(float(r["amount_incl"])) for r in group if float(r["amount_incl"]) > 0)
        else:
            status = f"⚠️  DOES NOT NET — residual R{net_rounded:,.2f}"
            leaky_groups.append({
                "doc_no": doc_no,
                "date": str(date),
                "batch_ref": batch,
                "net_amount": net_rounded,
                "row_count": row_count,
            })

        print(f"{doc_no:>12} | {str(date):>12} | {batch:>10} | {row_count:>9} | {net_rounded:>12,.2f} | {status}")

        for r in group:
            results.append({
                "doc_no": doc_no,
                "tx_date": str(r["tx_date"]),
                "batch_ref": r["batch_ref"],
                "ref_no": r["ref_no"],
                "amount_incl": float(r["amount_incl"]),
                "net_for_group": net_rounded,
                "nets_to_zero": abs(net_rounded) < 0.05,
            })

    print("=" * 80)
    print(f"\nSummary:")
    print(f"  Total Alloc/Recon doc groups  : {len(by_doc)}")
    print(f"  Groups that net to zero       : {len(by_doc) - len(leaky_groups)} (ERP noise — safe to exclude from matching)")
    print(f"  Groups with residual (leaky)  : {len(leaky_groups)}")
    print(f"  Total gross noise volume      : R{total_noise:,.2f} (positive legs only)")

    if leaky_groups:
        print(f"\n⚠️  LEAKY GROUPS — require investigation:")
        for g in leaky_groups:
            print(f"    {g['doc_no']} | {g['date']} | {g['batch_ref']} | Net: R{g['net_amount']:,.2f}")
    else:
        print(f"\n✅ All Alloc/Recon groups net cleanly to zero.")
        print(f"   Recommendation: Filter these rows out of the matching engine entirely.")
        print(f"   They represent ERP internal bookkeeping, not cash movement.")

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
    rows = load_data()
    if rows:
        results = analyse(rows)
        write_output(results)
    else:
        print("No data loaded — check DB connection or ref_no values.")
