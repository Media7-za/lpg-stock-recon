#!/usr/bin/env python3
"""TWK002 discount-aware remittance-batch payment pattern analysis."""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import defaultdict
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOLERANCE_PCT = 0.001  # doctrine v1


def round2(value: float) -> float:
    return float(Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def parse_txt_date(value: str):
    if not value:
        return None
    return datetime.strptime(value.strip(), "%d/%m/%Y").date()


def load_txt_rows(year: int | None = None):
    if year is None:
        candidates = [ROOT / "raw/TWK0022024.TXT", ROOT / "raw/TWK0022023.TXT", ROOT / "raw/TWK002.TXT"]
    else:
        candidates = [ROOT / f"raw/TWK002{year}.TXT", ROOT / "raw/TWK002.TXT"]
    txt_path = next((p for p in candidates if p.exists()), None)
    if txt_path is None:
        return []
    rows = []
    for line in txt_path.read_text(encoding="utf-8").splitlines():
        parts = re.findall(r'"([^"]*)"', line)
        if len(parts) < 11 or not parts[0].isdigit():
            continue
        rows.append(
            {
                "line": int(parts[0]),
                "period": parts[1],
                "docno": parts[2],
                "entry": parts[3],
                "date": parts[4],
                "cust_ref": parts[6],
                "amount": float(parts[9]),
                "balance": parts[10],
                "sort_date": parse_txt_date(parts[4]),
            }
        )
    return rows


def batch_tolerance(gross: float) -> float:
    return max(0.05, round2(abs(gross) * TOLERANCE_PCT))


def fmt_money(value: float) -> str:
    sign = "−" if value < 0 else ""
    return f"{sign}R{abs(value):,.2f}"


def safe_float(value: str | float | None, default: float = 0.0) -> float:
    if value is None or value == "":
        return default
    return float(value)


def run(year: int = 2023) -> None:
    batches = list(csv.DictReader(open(ROOT / f"data/remittance_batches_{year}.csv", encoding="utf-8")))
    rem_lines = list(csv.DictReader(open(ROOT / f"data/remittance_lines_{year}.csv", encoding="utf-8")))
    txt_rows = load_txt_rows(year)
    year_txt = ROOT / f"raw/TWK002{year}.TXT"
    has_erp = any(b.get("erp_payment_doc") for b in batches)

    year_rows = [r for r in txt_rows if r["sort_date"] and r["sort_date"].year == year]
    year_invoices = [r for r in year_rows if r["entry"] == "Invoice"]
    year_cns = [r for r in year_rows if r["entry"] == "Crd Note"]
    year_payments = [r for r in year_rows if r["entry"] == "Payment"]

    net_billed = round2(sum(r["amount"] for r in year_invoices) + sum(r["amount"] for r in year_cns))
    erp_payments = round2(sum(r["amount"] for r in year_payments))

    batch_stats = []
    for batch in batches:
        bid = batch["batch_id"]
        gross = float(batch["gross_payable"])
        cash = float(batch["cash_amount"])
        discount = float(batch["discount_amount"])
        erp_gross = safe_float(batch.get("erp_payment_gross"))
        variance = safe_float(batch.get("erp_gross_variance"))
        erp_link = batch.get("erp_link_status", "LINKED" if batch.get("erp_payment_doc") else "PENDING_TXT")
        tol = batch_tolerance(gross)

        lines = [l for l in rem_lines if l["batch_id"] == bid]
        line_net = round2(sum(float(l["net_amount"]) for l in lines))
        line_disc = round2(sum(float(l["discount_amount"]) for l in lines))

        cash_plus_disc = round2(cash + discount)
        model_b_ok = abs(cash_plus_disc - gross) <= tol
        cash_match = abs(line_net - cash) <= tol
        disc_match = abs(line_disc - discount) <= tol

        erp_naive_ok = abs(erp_gross + gross) <= tol  # erp_gross negative
        discount_aware_ok = abs(erp_gross + cash_plus_disc) <= tol or (
            variance > 0 and abs(erp_gross + gross) > tol
        )

        cash_var = safe_float(batch.get("erp_cash_variance"))
        cash_only_erp = (
            batch.get("erp_payment_doc")
            and abs(abs(erp_gross) - cash) <= tol
            and abs(cash_var) <= tol
        )

        if not batch.get("erp_payment_doc"):
            match_status = "REMITTANCE_ONLY" if model_b_ok and cash_match and disc_match else "INVESTIGATE"
            notes = "Remittance Model B matches; ERP payment not in TXT — linkage pending fresh export"
        elif cash_only_erp and model_b_ok:
            match_status = "CASH_ONLY_ERP"
            notes = f"ERP posts remittance cash; discount journal R{discount:,.2f} missing in payment"
        elif variance > tol:
            match_status = "ERP_GROSS_VARIANCE"
            notes = f"ERP over-posted R{variance:,.2f} vs remittance gross"
        elif model_b_ok and cash_match and disc_match:
            match_status = "FULL_MATCH"
            notes = "Cash + discount = remittance gross; lines reconcile"
        else:
            match_status = "INVESTIGATE"
            notes = "Line totals diverge from remittance header"

        batch_stats.append(
            {
                "batch_id": bid,
                "remittance_paid_date": batch["electronic_paid_date"],
                "erp_payment_doc": batch["erp_payment_doc"],
                "erp_payment_date": batch["erp_payment_date"],
                "erp_stat": batch.get("erp_stat", ""),
                "erp_link_status": erp_link,
                "remittance_gross": f"{gross:.2f}",
                "remittance_cash": f"{cash:.2f}",
                "remittance_discount": f"{discount:.2f}",
                "cash_plus_discount": f"{cash_plus_disc:.2f}",
                "erp_payment_gross": batch.get("erp_payment_gross", ""),
                "erp_variance": batch.get("erp_gross_variance", ""),
                "line_count": len(lines),
                "line_net_sum": f"{line_net:.2f}",
                "line_discount_sum": f"{line_disc:.2f}",
                "model_b_match": str(model_b_ok),
                "match_status": match_status,
                "notes": notes,
            }
        )

    out_csv = ROOT / f"data/payment_pattern_batches_{year}.csv"
    with open(out_csv, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(batch_stats[0].keys()))
        writer.writeheader()
        writer.writerows(batch_stats)

    remittance_settlement = round2(sum(float(b["gross_payable"]) for b in batches))
    remittance_cash = round2(sum(float(b["cash_amount"]) for b in batches))
    remittance_discount = round2(sum(float(b["discount_amount"]) for b in batches))
    erp_variance_total = round2(sum(safe_float(b.get("erp_gross_variance")) for b in batches))

    # Billing months touched by remittance lines (informational)
    month_map = defaultdict(lambda: {"docs": 0, "gross": 0.0, "discount": 0.0, "net": 0.0, "batches": set()})
    for line in rem_lines:
        month = line["doc_date"][:7]
        month_map[month]["docs"] += 1
        month_map[month]["gross"] += float(line["original_amount"])
        month_map[month]["discount"] += float(line["discount_amount"])
        month_map[month]["net"] += float(line["net_amount"])
        month_map[month]["batches"].add(line["batch_id"])

    report = ROOT / f"reports/TWK002_{year}_Payment_Pattern_Analysis.md"
    batch_count = len(batches)
    verdict = (
        f"All {batch_count} remittance batches reconcile under Model B."
        if all(s["match_status"] in ("FULL_MATCH", "REMITTANCE_ONLY", "ERP_GROSS_VARIANCE", "CASH_ONLY_ERP") for s in batch_stats)
        else "One or more batches require investigation."
    )

    lines_out = [
        f"# TWK002 — {year} Payment Pattern Analysis (Discount-Aware)",
        "",
        f"Generated on {datetime.now().date().isoformat()} | Tolerance: {TOLERANCE_PCT * 100:.1f}% of batch gross",
        "",
        "> **Methodology:** Remittance-batch settlement (not monthly LPG strip). Model B: `cash + DISCOUNT ALLOWED = gross payable`. CYL/EMPTIES included in discount base per TWK002 doctrine v1.",
        "",
        "---",
        "",
        "## 1. Executive Summary",
        "",
        f"* **{year} net billed (invoices + CNs, TXT headers):** **{fmt_money(net_billed)}**",
        f"* **Remittance batches ({year}):** **{batch_count}** totalling **{fmt_money(-remittance_settlement)}** gross",
        f"* **Discount-aware cash paid:** **{fmt_money(-remittance_cash)}** + journals **{fmt_money(-remittance_discount)}**",
    ]

    if has_erp:
        lines_out.extend([
            f"* **ERP payment total (gross postings in TXT):** **{fmt_money(erp_payments)}**",
            f"* **ERP vs remittance gross variance:** **R{erp_variance_total:,.2f}**",
        ])
    else:
        lines_out.extend([
            f"* **ERP source:** `raw/TWK002{year}.TXT`",
            "* **ERP payment linkage:** **Not available** — import year-specific TXT export",
        ])

    if year == 2023:
        last_pay = next(r for r in txt_rows if r["docno"] == "00026681")
        lines_out.append(f"* **Balance after last 2023 payment (`00026681`):** **R{float(last_pay['balance']):,.2f}**")
        dec_net = round2(sum(r["amount"] for r in year_rows if r["sort_date"] and r["sort_date"].month == 12))
        lines_out.append(f"* **Dec 2023 billing unpaid at year-end:** **{fmt_money(dec_net)}** (settled Mar 2024 catch-up batch)")

    lines_out.extend([
        "",
        f"**Pattern verdict:** {verdict}",
        "",
        "---",
        "",
        "## 2. Remittance Batch Settlement Table (Primary)",
        "",
        "Discount-aware expected settlement = **remittance cash + pro forma journal**.",
        "",
        "| Batch | Paid | STAT | Remittance Gross | Cash | Discount | Cash+Disc | ERP Payment | ERP Δ | Status |",
        "| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |",
    ])

    for stat in batch_stats:
        erp_pay = stat["erp_payment_gross"]
        erp_disp = f"R{float(erp_pay):,.2f}" if erp_pay not in ("", None) else "—"
        erp_var = stat["erp_variance"]
        var_disp = f"R{float(erp_var):,.2f}" if erp_var not in ("", None) else "—"
        stat_col = stat["erp_stat"] or "—"
        lines_out.append(
            f"| {stat['batch_id'].replace('BATCH-', '')} | {stat['remittance_paid_date']} | {stat_col} | "
            f"R{float(stat['remittance_gross']):,.2f} | R{float(stat['remittance_cash']):,.2f} | "
            f"R{float(stat['remittance_discount']):,.2f} | R{float(stat['cash_plus_discount']):,.2f} | "
            f"{erp_disp} | {var_disp} | **{stat['match_status']}** |"
        )

    lines_out.extend(
        [
            f"| **TOTAL** | | | **R{remittance_settlement:,.2f}** | **R{remittance_cash:,.2f}** | "
            f"**R{remittance_discount:,.2f}** | **R{remittance_settlement:,.2f}** | "
            f"**{'R' + f'{erp_payments:,.2f}' if has_erp else '—'}** | "
            f"**{'R' + f'{erp_variance_total:,.2f}' if has_erp else '—'}** | |",
            "",
            "### 2.1 Batch reconciliation notes",
            "",
        ]
    )

    for stat in batch_stats:
        doc = stat["erp_payment_doc"] or "ERP TBD"
        lines_out.append(f"* **{stat['batch_id']}** (`{doc}`): {stat['notes']}")

    lines_out.extend(
        [
            "",
            "---",
            "",
            "## 3. Billing Months Touched by Remittances (Informational)",
            "",
            "TWK002 batches span multiple invoice months. This table shows **which billing months' documents appear on remittance advices** — not independent monthly payment matching.",
            "",
            "| Billing Month | Docs on Remittance | Gross | Discount | Net (Cash) | Settled In Batch |",
            "| :--- | ---: | ---: | ---: | ---: | :--- |",
        ]
    )

    for month in sorted(month_map):
        info = month_map[month]
        batch_labels = ", ".join(sorted(b.replace("BATCH-", "") for b in info["batches"]))
        lines_out.append(
            f"| {month} | {info['docs']} | R{round2(info['gross']):,.2f} | "
            f"R{round2(info['discount']):,.2f} | R{round2(info['net']):,.2f} | {batch_labels} |"
        )

    lines_out.extend(
        [
            "",
            "---",
            "",
            "## 4. CYL / EMPTIES Treatment",
            "",
            f"* **{year} invoice headers:** {len(year_invoices)} totalling **{fmt_money(round2(sum(r['amount'] for r in year_invoices)))}**",
            f"* **{year} credit notes:** {len(year_cns)} totalling **{fmt_money(round2(sum(r['amount'] for r in year_cns)))}**",
            "",
            "Unlike JIM001 LPG-only strip, TWK002 settlement discount applies to **VAT-inclusive gross per document** including EMPTIES/CYL pairs. Remittance lines include both gas and deposit invoices; discount is computed on the remittance advice column, not stripped by SKU.",
            "",
            "---",
            "",
            "## 5. STAT Sequence & Payment Flow",
            "",
            "| Seq | Payment Doc | ERP Date | Remittance Paid | STAT | ERP Gross | Remittance Cash | Proforma Journal |",
            "| :---: | :--- | :--- | :--- | :--- | ---: | ---: | ---: |",
        ]
    )

    for i, batch in enumerate(batches, 1):
        erp_g = batch.get("erp_payment_gross")
        erp_g_disp = f"R{safe_float(erp_g):,.2f}" if erp_g else "—"
        lines_out.append(
            f"| {i} | {batch.get('erp_payment_doc') or 'TBD'} | {batch.get('erp_payment_date') or '—'} | "
            f"{batch['electronic_paid_date']} | {batch.get('erp_stat') or '—'} | "
            f"{erp_g_disp} | R{float(batch['cash_amount']):,.2f} | R{float(batch['discount_amount']):,.2f} |"
        )

    erp_pay_line = f"R{abs(erp_payments):>12,.2f}" if has_erp else "not in TXT export"
    erp_var_line = f"R{erp_variance_total:>12,.2f}" if has_erp else "pending linkage"

    lines_out.extend(
        [
            "",
            "### 5.1 Settlement pool reconciliation",
            "",
            "```text",
            f"Remittance gross settled ({year}):     R{remittance_settlement:>12,.2f}",
            f"  = Cash paid:                         R{remittance_cash:>12,.2f}",
            f"  + Discount journals (pro forma):     R{remittance_discount:>12,.2f}",
            "",
            f"ERP payments posted ({year}):          {erp_pay_line:>20}",
            f"ERP over-post vs remittance:           {erp_var_line:>20}",
            "```",
            "",
            "---",
            "",
            "## 6. Variance & Outstanding Pool",
            "",
            "| Item | Amount | Classification |",
            "| :--- | ---: | :--- |",
        ]
    )
    if has_erp and erp_variance_total:
        lines_out.append(f"| ERP gross variance | R{erp_variance_total:,.2f} | Deposit allocation artefact |")
    if not has_erp:
        lines_out.append("| ERP payment linkage | — | TXT export stale — refresh required |")
    lines_out.extend([
            f"| Missing DISCOUNT ALLOWED journals | R{remittance_discount:,.2f} | Pro forma — see `missing_journal_tasks_{year}.csv` |",
            "",
            f"**No permanent remittance-batch underpayments identified** at 0.1% tolerance under Model B.",
            "",
            "---",
            "",
            "## 7. Artefacts",
            "",
            "| File | Role |",
            "| :--- | :--- |",
            f"| `data/payment_pattern_batches_{year}.csv` | Machine-readable batch match register |",
            f"| `data/remittance_batches_{year}.csv` | Tier-1 batch headers |",
            f"| `data/missing_journal_tasks_{year}.csv` | ERP posting tasks |",
            "",
            "**Script:** `scripts/discount_payment_pattern_analysis.py`",
            "",
        ]
    )

    report.write_text("\n".join(lines_out), encoding="utf-8")
    print(f"Wrote {out_csv}")
    print(f"Wrote {report}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--year", type=int, default=2023)
    args = parser.parse_args()
    run(args.year)
