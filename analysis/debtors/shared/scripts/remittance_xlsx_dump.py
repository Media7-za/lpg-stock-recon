#!/usr/bin/env python3
"""
Dump customer remittance printouts (.xlsx) to JSON for operator review. Makes no allocation decisions.

Usage: python3 analysis/debtors/shared/scripts/remittance_xlsx_dump.py <file.xlsx> [more.xlsx ...] > dump.json

Built for Capitol's "Accounts Payable Allocations" printout (CAP000): header row Date/Age/Code/Reference/
Description/Debit/Credit, IN = invoice, CN = credit note, DS = adjustment, then a totals block.
Output per file: header rows, line items, and trailing summary rows. The operator (or a config file such as
CAP000/config/remittance_allocations.json) decides which lines map to which ERP documents.

Known printout quirks: a CN date may be Excel day/month-swapped (CAP000 'CN 42146'); doc references are
the customer's copy of our invoice number and must be checked against the DEBENQ ledger.
Requires: pip install openpyxl
"""
import datetime as dt
import json
import sys

import openpyxl


def cell(v):
    return v.isoformat() if isinstance(v, (dt.datetime, dt.date)) else v


def dump(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.active
    header_row, lines, summary, meta = None, [], [], []
    for r in ws.iter_rows(values_only=True):
        r = [cell(c) for c in r]
        if not any(c is not None for c in r):
            continue
        if header_row is None:
            if r[:2] == ['Date', 'Age']:
                header_row = r
            else:
                meta.append([c for c in r if c is not None])
            continue
        if r[2] in ('IN', 'CN', 'DS'):
            lines.append({'date': r[0], 'age': r[1], 'code': r[2], 'reference': r[3], 'description': r[4], 'debit': r[5], 'credit': r[6]})
        else:
            summary.append([c for c in r if c is not None])
    debit = sum(l['debit'] or 0 for l in lines)
    credit = sum(l['credit'] or 0 for l in lines)
    return {'file': path, 'meta': meta, 'lines': lines, 'summary_rows': summary,
            'computed': {'debit': round(debit, 2), 'credit': round(credit, 2), 'net_credit': round(credit - debit, 2)}}


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    json.dump([dump(p) for p in sys.argv[1:]], sys.stdout, indent=2)
    print()
