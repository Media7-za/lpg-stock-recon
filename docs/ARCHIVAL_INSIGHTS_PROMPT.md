# New Session Prompt: Archival Items Insights & Analytics

**Context for AI Agent:**
We have successfully completed the migration of the LPG Stock Reconciliation system from a legacy Python script to a fully functional, cloud-native Next.js/Vite application backed by a Supabase PostgreSQL database. 

We are now shifting focus from *data ingestion* to **Business Intelligence & Data Insights**, specifically targeting the "Archival Items" log.

### Architecture Overview
1. **The Data Source**: Our ERP system (FINCON) generates raw text files for transaction line items. These are referred to as the "Archival Items" logs (e.g., `STDatabase/CURRENT.TXT` or `2025.TXT`).
2. **Cloud Storage**: These logs have been parsed and securely ingested into our Supabase database within the `transaction_items` table.
3. **Data Schema (`transaction_items`)**:
   - Primary Keys / Links: `doc_no` (links to `transaction_headers`) and `account_no` (the customer).
   - Item Metadata: `stock_no` (SKU), `description`, `category` (LPG vs CYL), `qty`, `retail_price`, `line_tax`.
   - Date: `tx_date`.
4. **The Goal**: We want to extract actionable insights from this massive repository of item-level data. The legacy system heavily aggregated data, but our new Cloud Engine preserves perfect line-item granularity.

### Current Objective
I want to build out analytical queries or a dedicated "Insights Dashboard" to help us understand our historical movement of Archival Items. 

**Areas of focus could include:**
- Tracking the flow of `CYL` (Cylinder Deposits & Returns) over time to spot hoarding or lost cylinders.
- Analyzing `LPG` sales volume and frequency by specific accounts or periods.
- Highlighting anomalous line items (e.g., items sold below cost price or irregular quantities).

*Please analyze this context and propose the first 3 specific SQL queries or Data Visualizations we should build to start extracting these insights from the `transaction_items` table.*
