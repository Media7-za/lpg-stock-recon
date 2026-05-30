-- =============================================================================
-- Debtors Recon Engine
-- Permanent Database Views for automated reconciliation.
-- =============================================================================

-- 1. vw_clean_transactions
-- Standardizes transaction items by fixing the ERP tax sign bug and grouping categories.
CREATE OR REPLACE VIEW vw_clean_transactions AS
SELECT
    id,
    tx_date,
    LTRIM(doc_no, '0') AS doc_no,
    account_no,
    stock_no,
    entry_type,
    category,
    qty,
    retail_price,
    -- Calculate amount_ex dynamically
    (qty * retail_price) AS amount_ex,
    -- BUSINESS RULE: Tax Sign Correction Rule
    -- The ERP stores line_tax as positive for Credit Notes even when qty is negative.
    CASE WHEN qty < 0 THEN -ABS(line_tax) ELSE ABS(line_tax) END AS line_tax_fixed,
    -- Calculate clean totals using the fixed tax
    (qty * retail_price) + (CASE WHEN qty < 0 THEN -ABS(line_tax) ELSE ABS(line_tax) END) AS line_total,
    -- Segregate debt purely into LPG vs CYL
    CASE WHEN category IN ('19K', '9KG', 'LPG') THEN 'LPG'
         WHEN category = 'CYL' THEN 'CYL'
         ELSE 'OTHER' END AS debt_group
FROM transaction_items;

-- 2. vw_cylinder_ledger
-- Calculates running physical balances per client, enforcing intraday ordering.
CREATE OR REPLACE VIEW vw_cylinder_ledger AS
WITH cyl_txns AS (
    SELECT 
        tx_date,
        doc_no,
        account_no,
        stock_no,
        entry_type,
        qty
    FROM vw_clean_transactions
    WHERE debt_group = 'CYL'
)
SELECT 
    tx_date,
    doc_no,
    account_no,
    stock_no,
    CASE WHEN entry_type = 'Invoice' THEN 'Out (Delivered)' ELSE 'In (Returned)' END AS action,
    qty,
    -- BUSINESS RULE: Intraday Ordering Rule
    -- Order by date, then Invoices (1) before Credit Notes (2) to prevent mid-day negative balances.
    SUM(qty) OVER (
        PARTITION BY account_no, stock_no 
        ORDER BY 
            tx_date ASC, 
            CASE WHEN entry_type = 'Invoice' THEN 1 ELSE 2 END ASC,
            doc_no ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_balance
FROM cyl_txns;
