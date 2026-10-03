#!/usr/bin/env python3
"""CAP000 reconciliation workbook as one CSV, for upload to Google Sheets (Drive create_file, text/csv, auto-converts).

Usage: python3 analysis/debtors/CAP000/scripts/build_sheet_csv.py --out <path.csv>   (stdout if --out omitted)

Account-specific: open-items text, month range (Mar 2025-Sep 2026) and the 3 remittance file names are hardcoded.
Summary, Payments status and Monthly blocks are live formulas over the Ledger and Edges blocks; row positions are
computed, so the formulas stay correct if row counts change. Inputs: raw/CAP000.TXT, data/allocation_edges.csv,
reports/reconciliation_status.csv, config/remittance_allocations.json. Doc numbers are written without leading zeros
(Sheets would strip them anyway). Verified by upload on 2026-10-03: variance 0.00, all 19 monthly differences 0.
"""
import csv, io, json, datetime as dt
import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','..','..'))
R=os.path.join(ROOT,'analysis/debtors/CAP000')+'/'
def d(s): D,M,Y=s.split('/'); return f'{Y}-{M}-{D}'
def z(s): return s.lstrip('0') if s else ''
led=[r for r in csv.reader(open(R+'raw/CAP000.TXT',encoding='utf-8')) if len(r)>=11 and r[3] in('Invoice','Crd Note','Payment')]
edges=list(csv.DictReader(open(R+'data/allocation_edges.csv')))
rs=list(csv.DictReader(open(R+'reports/reconciliation_status.csv')))
rem={p['paymentDoc']:p['source'].split('/')[-1] for p in json.load(open(R+'config/remittance_allocations.json'))['payments']}
pays=[r for r in led if r[3]=='Payment']
months=[dt.date(2025,3,1)]
while months[-1]<dt.date(2026,9,1):
    m=months[-1]; months.append(dt.date(m.year+(m.month==12),m.month%12+1,1))
# layout (1-based rows)
r_sum=4            # header row of summary
r_pay=r_sum+17     # payments header
r_mon=r_pay+len(pays)+3
r_oi=r_mon+len(months)+3
r_ed=r_oi+8
r_rs=r_ed+len(edges)+3
r_ld=r_rs+len(rs)+3
E1,E2=r_ed+1,r_ed+len(edges)
S1,S2=r_rs+1,r_rs+len(rs)
L1,L2=r_ld+1,r_ld+len(led)
P1,P2=r_pay+1,r_pay+len(pays)
rows={}
def put(r,vals): rows[r]=vals
put(1,['CAP000 Capitol Caterers Select (Pty) Ltd: reconciliation workbook'])
put(2,['As at 30 Sep 2026. Sources: ERP DEBENQ raw/CAP000.TXT (ingested 2026-09-29), data/allocation_edges.csv, reports/reconciliation_status.csv, config/remittance_allocations.json. Doc numbers shown without leading zeros. Evidence tags: PROVEN, ASSERTED, ASSUMED.'])
put(r_sum,['ACCOUNT POSITION','Amount (R)','Evidence','Basis'])
put(r_sum+1,['Balance B/F at start of ledger (3 Mar 2025) [input]',43865.94,'PROVEN','ERP B/F line, CAP000.TXT'])
put(r_sum+2,['Net ledger movement',f'=SUM(G{L1}:G{L2})','','Sum of Ledger block'])
put(r_sum+3,['Closing balance, reconstructed',f'=B{r_sum+1}+B{r_sum+2}'])
put(r_sum+4,['ERP stated current balance [input]',70773.28,'PROVEN','ERP header CURRENT BALANCE, CAP000.TXT'])
put(r_sum+5,['Variance (reconstructed less ERP)',f'=ROUND(B{r_sum+3}-B{r_sum+4},2)'])
put(r_sum+7,['PAYMENTS AND ALLOCATION','Amount (R)','Evidence','Basis'])
put(r_sum+8,['Payments in ledger',f'=SUM(C{P1}:C{P2})'])
put(r_sum+9,['Unallocated, no remittance on file',f'=SUMIF(E{P1}:E{P2},"Unallocated",C{P1}:C{P2})','ASSUMED','5 payments'])
put(r_sum+10,['Remittance-linked',f'=SUMIF(E{P1}:E{P2},"Remittance-linked",C{P1}:C{P2})','PROVEN','3 payments; each remittance reconciles to its ERP payment (CN mapping on 42043 is ASSERTED)'])
put(r_sum+11,['Remittance-linked share of payments',f'=IF(B{r_sum+8}=0,0,B{r_sum+10}/B{r_sum+8})'])
put(r_sum+12,['Invoices in ledger',f'=COUNTIF(D{L1}:D{L2},"Invoice")'])
put(r_sum+13,['Credit notes in ledger',f'=COUNTIF(D{L1}:D{L2},"Crd Note")'])
put(r_sum+14,['Invoices settled by remittance (PROVEN, inside ledger window)',f'=COUNTIFS(B{S1}:B{S2},"INVOICE",I{S1}:I{S2},"PROVEN")'])
put(r_sum+15,['Reconciliation state: pending. Invoice-level allocation is incomplete until the 5 unallocated payments have remittances. See OPEN ITEMS.'])
put(r_pay-1,['PAYMENTS (from ERP ledger; status from ALLOCATION EDGES)'])
put(r_pay,['Payment doc','Date','Amount (R)','ERP ref','Status','Edge rows with target','Remittance file'])
for i,p in enumerate(pays):
    r=r_pay+1+i
    put(r,[z(p[2]),d(p[4]),abs(float(p[9])),p[6],f'=IF(COUNTIFS(C{E1}:C{E2},A{r},I{E1}:I{E2},"UNALLOCATED")>0,"Unallocated","Remittance-linked")',f'=COUNTIFS(C{E1}:C{E2},A{r},F{E1}:F{E2},">0")',rem.get(p[2],'none on file')])
put(r_mon-1,['MONTHLY ROLL-FORWARD (formulas over LEDGER)'])
put(r_mon,['Month','Opening (R)','Invoices (R)','Credit notes (R)','Payments (R)','Net (R)','Closing (R)','ERP balance at month end (R)','Difference (R)'])
for i,m in enumerate(months):
    r=r_mon+1+i
    cr=f'E${L1}:E${L2},">="&A{r},E${L1}:E${L2},"<"&EDATE(A{r},1)'
    put(r,[m.isoformat(),f'=B{r_sum+1}' if i==0 else f'=G{r-1}']+[f'=SUMIFS(G${L1}:G${L2},D${L1}:D${L2},"{e}",{cr})' for e in('Invoice','Crd Note','Payment')]+[f'=SUM(C{r}:E{r})',f'=B{r}+F{r}',f'=INDEX(H${L1}:H${L2},MATCH(EDATE(A{r},1)-1,E${L1}:E${L2},1))',f'=ROUND(G{r}-H{r},2)'])
put(r_oi-1,['OPEN ITEMS'])
put(r_oi,['Ref','Item','Amount (R)','Evidence','Status','Next step'])
put(r_oi+1,['H-011','5 STAT payments with no remittance on file (41466, 42518, 43235, 43472, 43872)',f'=B{r_sum+9}','ASSUMED','Open','Obtain remittance advice from Capitol; 41466 (R97,933.00) is the largest'])
put(r_oi+2,['H-011a','Payment 38536: remittance lists invoices totalling R35,958.40 plus a R113.75 "adj to statement" debit not in the ERP',113.75,'ASSERTED','Open','Confirm with Capitol which invoice carries the shortfall'])
put(r_oi+3,['H-011b','Remittance "CN 42146" R1,380 mapped to ERP credit note 12245 (inferred from amount and date 9 Apr 2025)',1380,'ASSERTED','Open','Confirm mapping with Capitol'])
put(r_oi+4,['H-029','Custody variance, financial CYL close vs physical custody valuation (branch cap000-folder-576j34)',8245.5,'ASSERTED','PROPOSED, not ratified','Physical reconciliation before any deposit communication'])
put(r_oi+5,['H-030','Untagged 2023 payments 17886 and 18484 (STAT:89) equal 7 stale 2022-23 invoices to the cent',26854.98,'ASSERTED','PROPOSED, not ratified','ERP agent to tag invoice numbers on both payments'])
put(r_oi+6,['Note','Sum of open invoices in RECON STATUS is not open debt: DEBENQ has no credit note or payment tagging for most invoices. Use the ERP balance above.',f'=SUMIFS(F{S1}:F{S2},B{S1}:B{S2},"INVOICE")','n/a','Informational',''])
put(r_ed-1,['ALLOCATION EDGES (data/allocation_edges.csv)'])
put(r_ed,['Allocation ID','Group','Payment doc','Payment date','Payment amount (R)','Target doc','Target date','Allocated (R)','Allocation type','Confidence','Review required','ERP ref'])
for i,e in enumerate(edges):
    put(r_ed+1+i,[e['allocation_id'],e['allocation_group_id'],z(e['payment_doc']),e['payment_date'],e['payment_amount'],z(e['target_doc']),e['target_date'],e['allocated_amount'],e['allocation_type'],e['confidence'],e['review_required'],e['erp_stat']])
put(r_rs-1,['RECONCILIATION STATUS (reports/reconciliation_status.csv)'])
put(r_rs,['Doc no','Type','Date','Gross (R)','Settled (R)','Open (R)','Settlement unit','Evidence tier','Evidence status','Matched against','Result'])
def res(x):
    n=x['notes']
    return 'Outside allocation window' if n.startswith('NOT_ATTEMPTED') else 'No candidate found' if n.startswith('No candidate') else 'Orphaned cash' if n.startswith('Orphaned') else 'Remittance-linked' if x['evidence_status']=='PROVEN' else n[:40]
for i,x in enumerate(rs):
    put(r_rs+1+i,[z(x['doc_no']),x['doc_type'],x['tx_date'],x['gross_amount'],x['settled_amount'],x['open_amount'],x['settlement_unit'],x['evidence_tier'],x['evidence_status'],x['matched_against'],res(x)])
put(r_ld-1,['LEDGER (ERP DEBENQ, 207 lines after the B/F line)'])
put(r_ld,['Line','Period','Doc no','Entry','Date','Customer ref','Amount (R)','ERP running balance (R)'])
for i,l in enumerate(led):
    put(r_ld+1+i,[l[0],l[1],z(l[2]),l[3],d(l[4]),l[6],l[9],l[10]])
buf=io.StringIO(); w=csv.writer(buf,lineterminator='\n')
for r in range(1,L2+1): w.writerow(rows.get(r,[]))
import sys; (open(sys.argv[sys.argv.index('--out')+1],'w') if '--out' in sys.argv else sys.stdout).write(buf.getvalue())
print(L2,"rows;",len(buf.getvalue()),"chars; layout",dict(sum=r_sum,pay=r_pay,mon=r_mon,oi=r_oi,ed=r_ed,rs=r_rs,ld=r_ld),file=sys.stderr)
