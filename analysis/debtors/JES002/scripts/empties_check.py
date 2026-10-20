"""Empties (cylinder) position and SKU check for JES002.

Inputs:
  raw/JES002_DEBENQ_*.TXT          account enquiries (ledger, amounts incl VAT)
  ERP RAW DATA/2024.TXT, CURRENT.TXT   item-level extracts (qty, price, SKU)

Outputs:
  data/empties_by_document.csv     net empties qty and ledger value per document
  stdout                           summary used in reports/JES002_Empties_Report_2026-10-20.md

Run: python3 -I analysis/debtors/JES002/scripts/empties_check.py
"""
import csv
import collections
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ACCT = os.path.join(HERE, '..')
ERP = os.path.join(ACCT, '..', '..', '..', 'ERP RAW DATA')
EMPTY = {'9.1', '14.1', '19.1', 'S.1', 'D.1'}
VAT = 1.15
OPEN_ENQUIRY_DOCS = {'00053488'}  # on enquiry, not in item extracts


def enquiry_ledger():
    led = {}
    for fn in sorted(os.listdir(os.path.join(ACCT, 'raw'))):
        if not fn.startswith('JES002_DEBENQ'):
            continue
        with open(os.path.join(ACCT, 'raw', fn), newline='', encoding='latin-1') as f:
            for r in csv.reader(f):
                if len(r) == 11 and r[0].isdigit() and r[3] in ('Invoice', 'Crd Note'):
                    led.setdefault((r[2], r[3]), dict(inv=r[5], amt=float(r[9])))
    return led


def item_rows():
    items = []
    for fn in ('2024.TXT', 'CURRENT.TXT'):
        hdr = None
        with open(os.path.join(ERP, fn), newline='', encoding='latin-1') as f:
            for r in csv.reader(f):
                if not r:
                    continue
                if r[0] == 'ENTRY':
                    hdr = r
                    continue
                if hdr is None or len(r) != len(hdr):
                    continue
                d = dict(zip(hdr, r))
                if d.get('ACCNO') != 'JES002':
                    continue
                if d.get('STOCKNO') in EMPTY:
                    items.append(d)
    return items


def main():
    led = enquiry_ledger()
    items = item_rows()
    qty = collections.defaultdict(float)
    doc_qty = collections.defaultdict(float)
    doc_val = collections.defaultdict(float)
    for d in items:
        q = float(d['QTY'])
        qty[d['STOCKNO']] += q
        key = d['ORDERNO'] if d['ENTRY'] == 'Crd Note' else d['DOCNO']
        doc_qty[key] += q
        doc_val[key] += q * float(d['RETAIL']) * VAT
    ledger = collections.defaultdict(float)
    for (doc, ent), v in led.items():
        ledger[v['inv'] if ent == 'Crd Note' else doc] += v['amt']

    total_qty = sum(qty.values())
    ledger_total = sum(ledger.values())
    open_enquiry = sum(ledger[k] for k in OPEN_ENQUIRY_DOCS)
    mismatch = [k for k in set(doc_val) | set(ledger)
                if k not in OPEN_ENQUIRY_DOCS and abs(doc_val.get(k, 0) - ledger.get(k, 0)) > 0.05]

    out = os.path.join(ACCT, 'data', 'empties_by_document.csv')
    with open(out, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['document', 'net_empties_qty', 'item_value_incl_vat', 'ledger_value_incl_vat'])
        for k in sorted(set(doc_qty) | set(ledger)):
            if abs(doc_qty.get(k, 0)) < 0.001 and abs(ledger.get(k, 0)) < 0.005:
                continue
            w.writerow([k, doc_qty.get(k, 0), round(doc_val.get(k, 0), 2), round(ledger.get(k, 0), 2)])

    print('net qty by SKU:', dict(qty))
    print('net empties (9.1 + S.1 + others):', total_qty)
    print('item value incl VAT:', round(sum(doc_val.values()), 2))
    print('ledger total incl VAT:', round(ledger_total, 2))
    print('ledger excl enquiry-only docs:', round(ledger_total - open_enquiry, 2))
    print('enquiry-only docs value:', round(open_enquiry, 2))
    print('docs with item value != ledger:', mismatch)
    print('gross open on positive docs:', sum(v for v in doc_qty.values() if v > 0))
    print('gross over-credits on negative docs:', sum(v for v in doc_qty.values() if v < 0))
    print('item rows:', len(items))
    return 0


if __name__ == '__main__':
    sys.exit(main())
