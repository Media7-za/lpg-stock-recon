#!/usr/bin/env python3
"""Build TWK002 2024 recreated ledger — Model B (cash payment + DISCOUNT ALLOWED journal)."""

from __future__ import annotations

import csv
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TXT = ROOT / "raw" / "TWK0022024.TXT"
BATCHES_CSV = ROOT / "data" / "remittance_batches_2024.csv"
OUT_LEDGER = ROOT / "data" / "recreated_ledger_2024.csv"
OUT_BRIDGE = ROOT / "data" / "recreated_ledger_payment_bridge_2024.csv"

# Partial Oct journal superseded by pro forma target state
SKIP_DOCNOS = {"00000334"}
# Erroneous duplicate payment row (discount embedded as payment line)
SKIP_PAYMENT_GHOST = {("00034518", -385.04)}


@dataclass
class TxtRow:
    line_no: int
    period: str
    docno: str
    entry: str
    date: str
    invno: str
    cust_ref: str
    order: str
    reference: str
    amount: float


@dataclass
class BatchLink:
    batch_id: str
    paid_date: str
    erp_doc: str
    erp_date: str
    erp_gross: float
    cash: float
    journal: float
    gross: float
    variance: float
    proforma_doc: str


def parse_txt(path: Path) -> list[TxtRow]:
    rows: list[TxtRow] = []
    for i, line in enumerate(path.read_text().splitlines(), 1):
        if not line.startswith('"') or "LINE" in line or "TOTAL TRANSACTIONS" in line:
            continue
        parts = re.findall(r'"([^"]*)"', line)
        if len(parts) < 11 or parts[0] == "LINE":
            continue
        if parts[6] == "BALANCE B/F:":
            rows.append(
                TxtRow(i, "", "", "", "", "", "BALANCE B/F:", "", "", float(parts[9]))
            )
            continue
        rows.append(
            TxtRow(
                i,
                parts[1],
                parts[2],
                parts[3],
                parts[4],
                parts[5],
                parts[6],
                parts[7],
                parts[8],
                float(parts[9]),
            )
        )
    return rows


def load_batches() -> dict[str, BatchLink]:
    links: dict[str, BatchLink] = {}
    proforma_idx = 7
    for row in csv.DictReader(BATCHES_CSV.open()):
        pf = f"PROFORMA-DJ-{proforma_idx:02d}"
        proforma_idx += 1
        links[row["erp_payment_doc"]] = BatchLink(
            batch_id=row["batch_id"],
            paid_date=row["electronic_paid_date"],
            erp_doc=row["erp_payment_doc"],
            erp_date=row["erp_payment_date"],
            erp_gross=float(row["erp_payment_gross"]),
            cash=float(row["cash_amount"]),
            journal=float(row["discount_amount"]),
            gross=float(row["gross_payable"]),
            variance=float(row["erp_gross_variance"]),
            proforma_doc=pf,
        )
    return links


def fmt_date(iso: str) -> str:
    return datetime.strptime(iso, "%Y-%m-%d").strftime("%d/%m/%Y")


def should_skip(row: TxtRow) -> bool:
    if row.docno in SKIP_DOCNOS:
        return True
    if row.entry == "Payment" and (row.docno, row.amount) in SKIP_PAYMENT_GHOST:
        return True
    return False


def build() -> None:
    txt_rows = parse_txt(TXT)
    links = load_batches()

    out_rows: list[dict] = []
    balance = 0.0
    line_seq = 0

    erp_payment_sum = 0.0
    recreated_cash_sum = 0.0
    journal_sum = 0.0
    adjusted_count = 0
    journal_count = 0

    for row in txt_rows:
        if should_skip(row):
            continue

        batch: BatchLink | None = None
        source_type = "erp_actual"
        batch_id = ""
        proforma_doc = ""
        notes = ""
        amount = row.amount

        if row.entry == "Payment" and row.docno in links:
            batch = links[row.docno]
            batch_id = batch.batch_id
            cash_amt = -batch.cash
            erp_amt = batch.erp_gross  # negative in CSV
            if abs(row.amount - erp_amt) > 0.01 or abs(row.amount - cash_amt) > 0.01:
                if abs(row.amount - cash_amt) > 0.01:
                    source_type = "erp_adjusted_payment"
                    notes = (
                        f"Adjusted gross {erp_amt:,.2f} -> cash {cash_amt:,.2f} "
                        f"per remittance {batch.paid_date}"
                    )
                    if batch.variance > 0.01:
                        notes += f"; ERP orphan R{batch.variance:,.2f} stripped from payment"
                    adjusted_count += 1
            amount = cash_amt
            erp_payment_sum += row.amount
            recreated_cash_sum += amount

            # Insert pro forma journal immediately before payment
            # Negative remittance discount (Sep) → positive journal (CN reversal dominates)
            j_amt = abs(batch.journal) if batch.journal < 0 else -batch.journal

            line_seq += 1
            balance += j_amt
            journal_sum += j_amt
            journal_count += 1
            out_rows.append(
                {
                    "line": line_seq,
                    "period": "",
                    "docno": batch.proforma_doc,
                    "entry": "Journal",
                    "date": fmt_date(batch.paid_date),
                    "invno": "",
                    "cust_ref": "",
                    "order": "",
                    "reference": "DISCOUNT ALLOWED",
                    "amount": round(j_amt, 2),
                    "balance": round(balance, 2),
                    "source_type": "proforma_journal",
                    "batch_id": batch_id,
                    "proforma_doc": batch.proforma_doc,
                    "notes": (
                        f"Consolidated settlement discount {batch_id}; "
                        f"post date per remittance; link {batch.erp_doc}"
                    ),
                }
            )

        elif row.entry == "Payment":
            erp_payment_sum += row.amount

        line_seq += 1
        balance += amount
        out_rows.append(
            {
                "line": line_seq,
                "period": row.period,
                "docno": row.docno,
                "entry": row.entry,
                "date": row.date,
                "invno": row.invno,
                "cust_ref": row.cust_ref,
                "order": row.order,
                "reference": row.reference,
                "amount": round(amount, 2),
                "balance": round(balance, 2),
                "source_type": source_type,
                "batch_id": batch_id,
                "proforma_doc": proforma_doc,
                "notes": notes,
            }
        )

    fields = [
        "line",
        "period",
        "docno",
        "entry",
        "date",
        "invno",
        "cust_ref",
        "order",
        "reference",
        "amount",
        "balance",
        "source_type",
        "batch_id",
        "proforma_doc",
        "notes",
    ]
    with OUT_LEDGER.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(out_rows)

    bridge_fields = [
        "batch_id",
        "remittance_paid_date",
        "erp_payment_doc",
        "erp_payment_date",
        "erp_payment_gross",
        "remittance_cash",
        "proforma_journal",
        "remittance_gross",
        "erp_variance",
        "proforma_doc",
        "payment_adjusted",
    ]
    with OUT_BRIDGE.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=bridge_fields)
        w.writeheader()
        for link in links.values():
            w.writerow(
                {
                    "batch_id": link.batch_id,
                    "remittance_paid_date": link.paid_date,
                    "erp_payment_doc": link.erp_doc,
                    "erp_payment_date": link.erp_date,
                    "erp_payment_gross": link.erp_gross,
                    "remittance_cash": -link.cash,
                    "proforma_journal": abs(link.journal)
                    if link.journal < 0
                    else -link.journal,
                    "remittance_gross": -link.gross,
                    "erp_variance": link.variance,
                    "proforma_doc": link.proforma_doc,
                    "payment_adjusted": abs(link.erp_gross - (-link.cash)) > 0.01,
                }
            )

    erp_closing = out_rows[-1]["balance"] if out_rows else 0
    gross_settlement = recreated_cash_sum + journal_sum
    variance_total = sum(l.variance for l in links.values() if l.variance > 0)

    print(f"Rows: {len(out_rows)} (+{journal_count} journals, {adjusted_count} payments adjusted)")
    print(f"ERP remittance payments sum: {erp_payment_sum:,.2f}")
    print(f"Recreated cash sum: {recreated_cash_sum:,.2f}")
    print(f"Pro forma journals sum: {journal_sum:,.2f}")
    print(f"Settlement (cash+journal): {gross_settlement:,.2f}")
    print(f"Over-post variance total: {variance_total:,.2f}")
    print(f"Closing balance: {erp_closing:,.2f}")
    print(f"Wrote {OUT_LEDGER}")
    print(f"Wrote {OUT_BRIDGE}")


if __name__ == "__main__":
    build()
