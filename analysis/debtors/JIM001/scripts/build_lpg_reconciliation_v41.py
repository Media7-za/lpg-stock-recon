#!/usr/bin/env python3
"""
Build JIM001_LPG_Reconciliation_v4.1.xlsx from v4 by adding sheet
"Open Invoices by Month" — billing-month totals of open LPG balance.

Open amount per month = max(monthly_lpg_insights.difference, 0) (PROVEN from
analysis/debtors/JIM001/data/monthly_lpg_insights.csv). Doc count = distinct
LPG invoice/credit doc_no in analysis/debtors/JIM001/data/invoices.csv.

Payment Doc # / Date(s) from monthly_lpg_insights; Payment Gross (Original)
= sum of abs(amount) from payments.csv for those doc(s) (consolidated cash).

Uses stdlib only (zipfile + XML); no openpyxl required.
"""

from __future__ import annotations

import csv
import re
import shutil
import zipfile
from collections import defaultdict
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
DEBTOR = "JIM001"
REPORTS = REPO_ROOT / "analysis/debtors" / DEBTOR / "reports"
DATA = REPO_ROOT / "analysis/debtors" / DEBTOR / "data"
SRC = REPORTS / f"{DEBTOR}_LPG_Reconciliation_v4.xlsx"
DST = REPORTS / f"{DEBTOR}_LPG_Reconciliation_v4.1.xlsx"
INSIGHTS = DATA / "monthly_lpg_insights.csv"
INVOICES = DATA / "invoices.csv"
PAYMENTS = DATA / "payments.csv"

SHEET_NAME = "Open Invoices by Month"
TITLE = (
    f"Jim Gas ({DEBTOR}) - Open LPG Invoices Summed by Billing Month (v4.1)"
)

# (header, kind) — kind: text | number | money
COLUMNS: list[tuple[str, str]] = [
    ("Billing Month", "text"),
    ("Year", "number"),
    ("Month", "text"),
    ("Net LPG Invoiced", "money"),
    ("Payment Doc #", "text"),
    ("Payment Date(s)", "text"),
    ("Payment Gross (Original)", "money"),
    ("Payment Allocated (Month)", "money"),
    ("Open Invoices (Sum)", "money"),
    ("Month Status", "text"),
    ("LPG Invoice Doc Count", "number"),
]

EMPTY_PAYMENT = {"—", "-", "", "nan"}


def xml_escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def inline_cell(ref: str, text: str, style: str) -> str:
    return (
        f'<c r="{ref}" s="{style}" t="inlineStr">'
        f"<is><t>{xml_escape(text)}</t></is></c>"
    )


def number_cell(ref: str, value: float, style: str) -> str:
    return f'<c r="{ref}" s="{style}" t="n"><v>{value}</v></c>'


def col_letter(n: int) -> str:
    s = ""
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def parse_payment_refs(raw: str) -> list[str]:
    if not raw or raw.strip() in EMPTY_PAYMENT:
        return []
    parts = re.split(r"[,;]\s*", raw.strip())
    out: list[str] = []
    for p in parts:
        p = p.strip()
        if not p or p in EMPTY_PAYMENT:
            continue
        clean = p.lstrip("0") or "0"
        out.append(clean)
    return out


def load_payments_index() -> dict[str, dict]:
    index: dict[str, dict] = {}
    with PAYMENTS.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            doc = row["payment_doc"]
            clean = doc.lstrip("0") or "0"
            index[clean] = {
                "doc_display": doc.zfill(8) if doc.isdigit() else doc,
                "payment_date": row["payment_date"],
                "gross": round(abs(float(row["amount"])), 2),
            }
    return index


def resolve_payments(
    refs_raw: str, dates_raw: str, payments_index: dict[str, dict]
) -> tuple[str, str, float | None]:
    refs = parse_payment_refs(refs_raw)
    if not refs:
        return "—", "—", None

    docs: list[str] = []
    dates: list[str] = []
    gross_total = 0.0
    for clean in refs:
        rec = payments_index.get(clean)
        if rec:
            docs.append(rec["doc_display"])
            dates.append(rec["payment_date"])
            gross_total += rec["gross"]
        else:
            docs.append(clean.zfill(8))
            gross_total += 0.0

    dates_out = dates_raw.strip() if dates_raw and dates_raw.strip() not in EMPTY_PAYMENT else ""
    if not dates_out and dates:
        dates_out = ",".join(dict.fromkeys(dates))

    return ",".join(docs), dates_out or "—", round(gross_total, 2)


def load_month_rows(payments_index: dict[str, dict]) -> list[dict]:
    docs_by_month: dict[str, set[str]] = defaultdict(set)
    with INVOICES.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            if row.get("is_lpg", "").lower() != "true":
                continue
            docs_by_month[row["month_year"]].add(row["doc_no"])

    out: list[dict] = []
    with INSIGHTS.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            my = row["month_year"]
            open_amt = max(float(row["difference"]), 0.0)
            pmt_docs, pmt_dates, pmt_gross = resolve_payments(
                row["payment_refs_allocated"],
                row["payment_dates"],
                payments_index,
            )
            out.append(
                {
                    "billing_month": my,
                    "year": row["year"],
                    "month": row["month"],
                    "net": float(row["net_lpg_invoiced"]),
                    "payment_docs": pmt_docs,
                    "payment_dates": pmt_dates,
                    "payment_gross": pmt_gross,
                    "allocated": float(row["payment_total_allocated"]),
                    "open": round(open_amt, 2),
                    "status": row["month_status"],
                    "doc_count": len(docs_by_month.get(my, set())),
                }
            )
    return out


def cell_for(col_idx: int, row_num: int, kind: str, value) -> str:
    ref = f"{col_letter(col_idx)}{row_num}"
    if kind == "text":
        return inline_cell(ref, str(value), "5")
    if kind == "number":
        return number_cell(ref, float(value), "6")
    if kind == "money":
        if value is None:
            return inline_cell(ref, "—", "5")
        return number_cell(ref, float(value), "6")
    raise ValueError(kind)


def build_sheet_xml(rows: list[dict]) -> str:
    ncols = len(COLUMNS)
    last_col = col_letter(ncols)

    data_rows: list[str] = []
    data_rows.append(
        f'<row r="1" ht="30" customHeight="1">'
        f'{inline_cell("A1", TITLE, "1")}</row>'
    )
    data_rows.append('<row r="2" ht="10" customHeight="1"></row>')

    header_cells = []
    for i, (label, _) in enumerate(COLUMNS, start=1):
        header_cells.append(inline_cell(f"{col_letter(i)}3", label, "2"))
    data_rows.append(f'<row r="3" ht="25" customHeight="1">{"".join(header_cells)}</row>')

    sum_cols = {
        "Net LPG Invoiced": 0.0,
        "Payment Allocated (Month)": 0.0,
        "Open Invoices (Sum)": 0.0,
    }

    r = 4
    for item in rows:
        values = {
            "Billing Month": item["billing_month"],
            "Year": item["year"],
            "Month": item["month"],
            "Net LPG Invoiced": item["net"],
            "Payment Doc #": item["payment_docs"],
            "Payment Date(s)": item["payment_dates"],
            "Payment Gross (Original)": item["payment_gross"],
            "Payment Allocated (Month)": item["allocated"],
            "Open Invoices (Sum)": item["open"],
            "Month Status": item["status"],
            "LPG Invoice Doc Count": item["doc_count"],
        }
        cells = []
        for i, (label, kind) in enumerate(COLUMNS, start=1):
            cells.append(cell_for(i, r, kind, values[label]))
        data_rows.append(f'<row r="{r}" ht="20" customHeight="1">{"".join(cells)}</row>')
        sum_cols["Net LPG Invoiced"] += item["net"]
        sum_cols["Payment Allocated (Month)"] += item["allocated"]
        sum_cols["Open Invoices (Sum)"] += item["open"]
        r += 1

    total_values: dict[str, object] = {
        "Billing Month": "TOTAL",
        "Year": None,
        "Month": None,
        "Net LPG Invoiced": round(sum_cols["Net LPG Invoiced"], 2),
        "Payment Doc #": None,
        "Payment Date(s)": None,
        "Payment Gross (Original)": None,
        "Payment Allocated (Month)": round(sum_cols["Payment Allocated (Month)"], 2),
        "Open Invoices (Sum)": round(sum_cols["Open Invoices (Sum)"], 2),
        "Month Status": None,
        "LPG Invoice Doc Count": None,
    }
    cells = []
    for i, (label, kind) in enumerate(COLUMNS, start=1):
        v = total_values[label]
        if v is None:
            cells.append(inline_cell(f"{col_letter(i)}{r}", "", "5"))
        else:
            cells.append(cell_for(i, r, kind, v))
    data_rows.append(f'<row r="{r}" ht="20" customHeight="1">{"".join(cells)}</row>')

    last_row = r
    col_widths = [14, 10, 14, 18, 22, 18, 22, 22, 20, 22, 22]
    cols_xml = "".join(
        f'<col width="{w}" customWidth="1" min="{i}" max="{i}"/>'
        for i, w in enumerate(col_widths, start=1)
    )

    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        "<sheetPr><outlinePr summaryBelow=\"1\" summaryRight=\"1\" /><pageSetUpPr /></sheetPr>"
        f'<dimension ref="A1:{last_col}{last_row}"/>'
        '<sheetViews><sheetView showGridLines="1" workbookViewId="0">'
        '<selection activeCell="A1" sqref="A1"/></sheetView></sheetViews>'
        '<sheetFormatPr baseColWidth="8" defaultRowHeight="15"/>'
        f"<cols>{cols_xml}</cols>"
        f"<sheetData>{''.join(data_rows)}</sheetData>"
        "</worksheet>"
    )


def patch_workbook(files: dict[str, bytes], sheet_xml: str) -> None:
    wb = files["xl/workbook.xml"].decode("utf-8")
    if SHEET_NAME in wb:
        raise SystemExit(f"Sheet {SHEET_NAME!r} already exists in workbook.")
    insert = (
        f'<sheet name="{xml_escape(SHEET_NAME)}" sheetId="4" state="visible" r:id="rId6" />'
    )
    files["xl/workbook.xml"] = wb.replace("</sheets>", insert + "</sheets>").encode(
        "utf-8"
    )

    rels = files["xl/_rels/workbook.xml.rels"].decode("utf-8")
    if "sheet4.xml" not in rels:
        rels = rels.replace(
            "</Relationships>",
            '<Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
            'Target="/xl/worksheets/sheet4.xml" Id="rId6" /></Relationships>',
        )
        files["xl/_rels/workbook.xml.rels"] = rels.encode("utf-8")

    types = files["[Content_Types].xml"].decode("utf-8")
    if "/xl/worksheets/sheet4.xml" not in types:
        types = types.replace(
            "</Types>",
            '<Override PartName="/xl/worksheets/sheet4.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />'
            "</Types>",
        )
        files["[Content_Types].xml"] = types.encode("utf-8")

    files["xl/worksheets/sheet4.xml"] = sheet_xml.encode("utf-8")


def main() -> None:
    if not SRC.is_file():
        raise SystemExit(f"Missing source workbook: {SRC}")
    if not INSIGHTS.is_file():
        raise SystemExit(f"Missing insights CSV: {INSIGHTS}")
    if not PAYMENTS.is_file():
        raise SystemExit(f"Missing payments CSV: {PAYMENTS}")

    payments_index = load_payments_index()
    rows = load_month_rows(payments_index)
    sheet_xml = build_sheet_xml(rows)

    shutil.copy2(SRC, DST)
    with zipfile.ZipFile(DST, "r") as zin:
        files = {name: zin.read(name) for name in zin.namelist()}

    patch_workbook(files, sheet_xml)

    with zipfile.ZipFile(DST, "w", compression=zipfile.ZIP_DEFLATED) as zout:
        for name, data in files.items():
            zout.writestr(name, data)

    open_months = sum(1 for r in rows if r["open"] > 0)
    open_sum = round(sum(r["open"] for r in rows), 2)
    print(f"Wrote {DST}")
    print(f"  Billing months: {len(rows)} | Months with open balance: {open_months}")
    print(f"  Sum of Open Invoices (Sum) column: R{open_sum:,.2f}")


if __name__ == "__main__":
    main()
