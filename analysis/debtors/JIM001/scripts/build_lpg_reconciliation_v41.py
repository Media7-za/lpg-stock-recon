#!/usr/bin/env python3
"""
Build JIM001_LPG_Reconciliation_v4.1.xlsx from v4 by adding sheet
"Open Invoices by Month" — billing-month totals of open LPG balance.

Open amount per month = max(monthly_lpg_insights.difference, 0) (PROVEN from
analysis/debtors/JIM001/data/monthly_lpg_insights.csv). Doc count = distinct
LPG invoice/credit doc_no in analysis/debtors/JIM001/data/invoices.csv.

Uses stdlib only (zipfile + XML); no openpyxl required.
"""

from __future__ import annotations

import csv
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

SHEET_NAME = "Open Invoices by Month"
TITLE = (
    f"Jim Gas ({DEBTOR}) - Open LPG Invoices Summed by Billing Month (v4.1)"
)
HEADERS = [
    "Billing Month",
    "Year",
    "Month",
    "Net LPG Invoiced",
    "Payments Allocated",
    "Open Invoices (Sum)",
    "Month Status",
    "LPG Invoice Doc Count",
]


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


def load_month_rows() -> list[dict]:
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
            out.append(
                {
                    "billing_month": my,
                    "year": row["year"],
                    "month": row["month"],
                    "net": float(row["net_lpg_invoiced"]),
                    "paid": float(row["payment_total_allocated"]),
                    "open": round(open_amt, 2),
                    "status": row["month_status"],
                    "doc_count": len(docs_by_month.get(my, set())),
                }
            )
    return out


def build_sheet_xml(rows: list[dict]) -> str:
    data_rows: list[str] = []
    data_rows.append(
        f'<row r="1" ht="30" customHeight="1">'
        f'{inline_cell("A1", TITLE, "1")}</row>'
    )
    data_rows.append('<row r="2" ht="10" customHeight="1"></row>')

    header_cells = []
    for i, h in enumerate(HEADERS, start=1):
        header_cells.append(inline_cell(f"{col_letter(i)}3", h, "2"))
    data_rows.append(f'<row r="3" ht="25" customHeight="1">{"".join(header_cells)}</row>')

    r = 4
    tot_net = tot_paid = tot_open = 0.0
    for item in rows:
        cells = [
            inline_cell(f"A{r}", item["billing_month"], "5"),
            number_cell(f"B{r}", float(item["year"]), "6"),
            inline_cell(f"C{r}", item["month"], "5"),
            number_cell(f"D{r}", item["net"], "6"),
            number_cell(f"E{r}", item["paid"], "6"),
            number_cell(f"F{r}", item["open"], "6"),
            inline_cell(f"G{r}", item["status"], "5"),
            number_cell(f"H{r}", item["doc_count"], "6"),
        ]
        data_rows.append(f'<row r="{r}" ht="20" customHeight="1">{"".join(cells)}</row>')
        tot_net += item["net"]
        tot_paid += item["paid"]
        tot_open += item["open"]
        r += 1

    cells = [
        inline_cell(f"A{r}", "TOTAL", "2"),
        inline_cell(f"B{r}", "", "5"),
        inline_cell(f"C{r}", "", "5"),
        number_cell(f"D{r}", round(tot_net, 2), "6"),
        number_cell(f"E{r}", round(tot_paid, 2), "6"),
        number_cell(f"F{r}", round(tot_open, 2), "6"),
        inline_cell(f"G{r}", "", "5"),
        inline_cell(f"H{r}", "", "5"),
    ]
    data_rows.append(f'<row r="{r}" ht="20" customHeight="1">{"".join(cells)}</row>')

    last_row = r
    col_widths = [
        (1, 14),
        (2, 10),
        (3, 14),
        (4, 18),
        (5, 18),
        (6, 20),
        (7, 22),
        (8, 22),
    ]
    cols_xml = "".join(
        f'<col width="{w}" customWidth="1" min="{mn}" max="{mn}"/>'
        for mn, w in col_widths
    )

    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        "<sheetPr><outlinePr summaryBelow=\"1\" summaryRight=\"1\" /><pageSetUpPr /></sheetPr>"
        f'<dimension ref="A1:H{last_row}"/>'
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

    rows = load_month_rows()
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
