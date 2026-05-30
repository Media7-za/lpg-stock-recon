import asyncio
import os
import sys
import re
from playwright.async_api import async_playwright
from markdown_it import MarkdownIt

def enhance_html(html_content):
    # Extract title from H1 if present
    h1_match = re.search(r'<h1>(.*?)</h1>', html_content)
    title = h1_match.group(1) if h1_match else "Statement of Account"
    
    # Remove original H1 to prevent duplicate title display
    if h1_match:
        html_content = html_content.replace(h1_match.group(0), "", 1)
        
    # Extract metadata
    period = "N/A"
    account = "N/A"
    opening_bal = "N/A"
    opening_desc = "Balance Forward"
    closing_bal = "N/A"
    
    # Locate the metadata paragraph (typically contains Period: and Account:)
    p_matches = re.findall(r'<p>(.*?)</p>', html_content, re.DOTALL)
    meta_p = None
    for p_content in p_matches:
        if "Period:" in p_content or "Account" in p_content:
            meta_p = p_content
            break
            
    if meta_p:
        # Extract Period
        period_match = re.search(r'Period:</strong>\s*(.*?)(?:&nbsp;\||<strong>|$)', meta_p, re.DOTALL)
        if period_match:
            period = period_match.group(1).replace("&nbsp;", "").replace("|", "").strip()
            
        # Extract Account
        account_match = re.search(r'Account(?:s)?:</strong>\s*(.*?)(?:<br>|<p>|&nbsp;\||<strong>|$)', meta_p, re.DOTALL)
        if account_match:
            account = account_match.group(1).replace("&nbsp;", "").replace("|", "").strip()
            
        # Extract Opening Balance from header paragraph
        open_match = re.search(r'Opening Balance B/F:</strong>\s*(.*?)(?:<br>|&nbsp;\||<strong>|$)', meta_p, re.DOTALL)
        if open_match:
            raw_open = open_match.group(1).strip()
            # Extract currency amount and descriptive text
            amount_match = re.search(r'(R\s*[\d,.-]+)', raw_open)
            if amount_match:
                opening_bal = amount_match.group(1).strip()
                desc = raw_open.replace(opening_bal, "").strip("() ")
                if desc:
                    opening_desc = desc
            else:
                opening_bal = raw_open
                
        # Remove the metadata paragraph from body
        html_content = html_content.replace(f"<p>{meta_p}</p>", "", 1)
        
    # Extract starting balance from table rows if not in header metadata
    if opening_bal == "N/A":
        row_match = re.search(r'<tr>\s*<td.*?>.*?</td>\s*<td.*?><strong>(?:Balance B/F|Opening Balance|Balance b/f)</strong></td>.*?<td.*?><strong>(.*?)</strong></td>\s*</tr>', html_content, re.IGNORECASE | re.DOTALL)
        if row_match:
            val = row_match.group(1).strip()
            opening_bal = "R" + val.lstrip("R")
            opening_desc = "Balance B/F"
            
    # Extract closing balance by cleaning lines and matching labels
    for line in html_content.split('\n'):
        clean_line = re.sub(r'<[^>]+>', '', line)
        if any(lbl in clean_line for lbl in ["Combined Account Balance", "Reconciled True Total Account Balance", "Combined Closing Balance", "Total Reconciled Balance"]):
            m = re.search(r'(R\s*[\d,.-]+)', clean_line)
            if m:
                closing_bal = m.group(1).strip()
                break
            
    # Map raw account numbers to clean display names
    display_account = account
    if "JEN001" in account:
        display_account = "Spoon Eatery (JEN001)"
    elif "FAM000" in account:
        display_account = "Family Gas (FAM000 / FAM002)"

    # Formulate styled corporate header block (clean tabular metadata)
    header_html = f"""
    <div class="statement-header">
        <div class="header-main">
            <div class="brand">
                <div class="logo-icon">🔥</div>
                <div class="logo-text">
                    <span class="brand-name">Midlands Petroleum</span>
                    <span class="brand-sub">LPG Stock Reconciliation</span>
                </div>
            </div>
            <div class="doc-title">
                <h1>{title.upper()}</h1>
                <span class="subtitle">Combined LPG Gas &amp; Cylinder Asset Tracker</span>
            </div>
        </div>
        
        <div class="meta-section">
            <table class="meta-table">
                <tr>
                    <td class="meta-label">Customer:</td>
                    <td class="meta-value"><strong>{display_account}</strong></td>
                    <td class="meta-label">Opening Bal B/F:</td>
                    <td class="meta-value"><strong>{opening_bal}</strong> <span style="font-size: 7.5pt; color: #64748b;">({opening_desc})</span></td>
                </tr>
                <tr>
                    <td class="meta-label">Period:</td>
                    <td class="meta-value">{period}</td>
                    <td class="meta-label">Closing Balance:</td>
                    <td class="meta-value"><strong>{closing_bal}</strong> <span style="font-size: 7.5pt; color: #64748b;">(Reconciled Total)</span></td>
                </tr>
            </table>
        </div>
    </div>
    """
    
    html_content = header_html + html_content
    
    # Process alerts from standard blockquotes
    alert_types = {
        "IMPORTANT": "important",
        "TIP": "tip",
        "WARNING": "warning",
        "NOTE": "note",
        "CAUTION": "caution"
    }
    
    for term, css_class in alert_types.items():
        html_content = html_content.replace(f"<blockquote>\n<p>[!{term}]", f'<div class="alert-box {css_class}"><strong>{term}:</strong>')
        html_content = html_content.replace(f"<blockquote>\n<p>[!{term}]<br>", f'<div class="alert-box {css_class}"><strong>{term}:</strong>')
        html_content = html_content.replace(f"<blockquote>\n<p>[!{term.lower()}]", f'<div class="alert-box {css_class}"><strong>{term}:</strong>')
        
    html_content = re.sub(
        r'<blockquote>\s*<p>\s*\[!(IMPORTANT|TIP|WARNING|NOTE|CAUTION)\]',
        lambda m: f'<div class="alert-box {alert_types[m.group(1).upper()]}"><strong>{m.group(1).upper()}:</strong>',
        html_content,
        flags=re.IGNORECASE
    )
    
    html_content = html_content.replace("</p>\n</blockquote>", "</div>")
    html_content = html_content.replace("</blockquote>", "</div>")
    
    # Wrap Final Reconciliation
    recon_match = re.search(r'<h2>🧮 Final Reconciliation</h2>', html_content)
    if recon_match:
        html_content = html_content.replace(
            recon_match.group(0),
            '<div class="reconciliation-card"><h2>🧮 Final Reconciliation</h2>'
        )
        html_content += "\n</div>"
        
    return html_content

async def convert_md_to_pdf(md_path, pdf_path):
    if not os.path.exists(md_path):
        print(f"Error: Markdown file not found at {md_path}")
        return False
        
    print(f"Reading markdown from {md_path}...")
    with open(md_path, 'r') as f:
        md_content = f.read()
        
    print("Converting markdown to HTML...")
    md = MarkdownIt('js-default')
    html_content = md.render(md_content)
    
    print("Applying CSS/HTML structural enhancements...")
    enhanced_content = enhance_html(html_content)
    
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap');
            
            @media print {{
                @page {{
                    size: A4;
                    margin: 15mm;
                }}
            }}
            body {{
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 9.5pt;
                line-height: 1.5;
                color: #334155;
                background-color: #ffffff;
                margin: 0;
                padding: 0;
            }}
            
            /* Header Section */
            .statement-header {{
                margin-bottom: 25px;
                border-bottom: 3px solid #1e3a8a;
                padding-bottom: 20px;
            }}
            
            .header-main {{
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }}
            
            .brand {{
                display: flex;
                align-items: center;
            }}
            
            .logo-icon {{
                font-size: 28pt;
                margin-right: 12px;
                color: #3b82f6;
            }}
            
            .logo-text {{
                display: flex;
                flex-direction: column;
            }}
            
            .brand-name {{
                font-family: 'Outfit', sans-serif;
                font-size: 18pt;
                font-weight: 700;
                color: #0f172a;
                line-height: 1.1;
            }}
            
            .brand-sub {{
                font-size: 8pt;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-top: 2px;
                font-weight: 600;
            }}
            
            .doc-title {{
                text-align: right;
            }}
            
            .doc-title h1 {{
                font-family: 'Outfit', sans-serif;
                font-size: 20pt;
                font-weight: 700;
                color: #1e3a8a;
                margin: 0;
                letter-spacing: 0.05em;
            }}
            
            .doc-title .subtitle {{
                font-size: 9pt;
                color: #475569;
                font-weight: 500;
            }}
                /* Header Metadata Section */
            .meta-section {{
                margin-top: 15px;
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 10px 15px;
            }}
            
            .meta-table {{
                width: 100%;
                border-collapse: collapse;
                border: none !important;
                margin: 0 !important;
            }}
            
            .meta-table tr {{
                background-color: transparent !important;
            }}
            
            .meta-table tr:hover {{
                background-color: transparent !important;
            }}
            
            .meta-table td {{
                padding: 4px 10px !important;
                border: none !important;
                font-size: 8.5pt !important;
                color: #334155 !important;
            }}
            
            .meta-table td.meta-label {{
                font-weight: 600 !important;
                color: #64748b !important;
                width: 15%;
                text-align: left;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }}
            
            .meta-table td.meta-value {{
                color: #0f172a !important;
                font-weight: 500 !important;
                width: 35%;
                text-align: left;
            }}
            
            h2 {{
                font-family: 'Outfit', sans-serif;
                font-size: 14pt;
                font-weight: 600;
                color: #1e3a8a;
                border-bottom: 1.5px solid #e2e8f0;
                padding-bottom: 6px;
                margin-top: 25px;
                margin-bottom: 12px;
                page-break-after: avoid;
            }}
            
            h3 {{
                font-family: 'Outfit', sans-serif;
                font-size: 11.5pt;
                font-weight: 600;
                color: #0f172a;
                margin-top: 15px;
                margin-bottom: 8px;
                page-break-after: avoid;
            }}
            
            p {{
                margin-top: 0;
                margin-bottom: 10px;
                color: #475569;
            }}
            
            /* Tables */
            table {{
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                margin-top: 10px;
                margin-bottom: 20px;
                font-size: 8.5pt;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                overflow: hidden;
                page-break-inside: avoid;
            }}
            
            th {{
                background-color: #1e293b;
                color: #ffffff;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 7.5pt;
                letter-spacing: 0.05em;
                padding: 8px 10px;
                border: none;
            }}
            
            td {{
                padding: 7px 10px;
                border-bottom: 1px solid #f1f5f9;
                color: #334155;
            }}
            
            tr:last-child td {{
                border-bottom: none;
            }}
            
            tr:nth-child(even) {{
                background-color: #f8fafc;
            }}
            
            /* Bolding specific rows dynamically (opening/closing balance rows) */
            tr:has(strong) {{
                font-weight: 600;
                background-color: #f1f5f9 !important;
            }}
            
            tr:has(strong) td {{
                color: #0f172a;
            }}
            
            /* Lists */
            ul {{
                margin-top: 5px;
                margin-bottom: 15px;
                padding-left: 20px;
            }}
            
            li {{
                margin-bottom: 4px;
                color: #475569;
            }}
            
            /* Horizontal Rule */
            hr {{
                border: 0;
                border-top: 1px solid #cbd5e1;
                margin: 20px 0;
            }}
            
            /* Alert Boxes */
            .alert-box {{
                padding: 12px 15px;
                margin: 15px 0;
                border-radius: 6px;
                font-size: 9.5pt;
                page-break-inside: avoid;
            }}
            .alert-box strong {{
                font-weight: 600;
                margin-right: 5px;
            }}
            .alert-box.important {{
                background-color: #eff6ff;
                border-left: 4px solid #3b82f6;
                color: #1e40af;
            }}
            .alert-box.tip {{
                background-color: #f0fdf4;
                border-left: 4px solid #22c55e;
                color: #166534;
            }}
            .alert-box.warning {{
                background-color: #fffbeb;
                border-left: 4px solid #f59e0b;
                color: #92400e;
            }}
            .alert-box.note {{
                background-color: #f8fafc;
                border-left: 4px solid #64748b;
                color: #334155;
            }}
            .alert-box.caution {{
                background-color: #fef2f2;
                border-left: 4px solid #ef4444;
                color: #991b1b;
            }}
            
            /* Reconciliation Section Styling */
            .reconciliation-card {{
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border: 1px solid #bbf7d0;
                border-radius: 8px;
                padding: 15px 20px;
                margin-top: 25px;
                margin-bottom: 25px;
                page-break-inside: avoid;
            }}
            
            .reconciliation-card h2 {{
                color: #166534;
                border-bottom: 1px solid #bbf7d0;
                margin-top: 0;
                padding-bottom: 6px;
            }}
            
            .reconciliation-card ul {{
                padding-left: 15px;
                margin-bottom: 10px;
            }}
            
            .reconciliation-card li {{
                color: #14532d;
                margin-bottom: 4px;
                font-weight: 500;
            }}
            
            .reconciliation-card li strong {{
                color: #166534;
            }}
            
            .reconciliation-card h3 {{
                color: #15803d;
                border-bottom: none;
                margin-top: 15px;
            }}
        </style>
    </head>
    <body>
        {enhanced_content}
    </body>
    </html>
    """
    # Check if there is an audit disclosure section
    has_audit = bool(re.search(r'<h2>[^<]*?(?:Audit Disclosure|Executive Summary|Findings)[^<]*?</h2>', enhanced_content, re.IGNORECASE))
    
    base, ext = os.path.splitext(pdf_path)
    
    print("Launching Playwright...")
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        # Native Playwright page number footer
        footer_template = """
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; font-size: 7.5pt; color: #94a3b8; display: flex; width: 100%; padding: 0 15mm; box-sizing: border-box; justify-content: space-between;">
            <div>Midlands Petroleum &middot; LPG Stock Reconciliation Statement</div>
            <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
        </div>
        """
        
        if has_audit:
            print("Audit disclosure section detected. Generating both Internal and Customer statement views...")
            
            # 1. Internal View (full content)
            await page.set_content(full_html)
            internal_path = f"{base}_Internal.pdf"
            print(f"Generating Internal PDF: {internal_path}...")
            await page.pdf(
                path=internal_path, 
                format="A4", 
                margin={"top": "20mm", "bottom": "20mm", "left": "15mm", "right": "15mm"},
                display_header_footer=True,
                header_template='<div style="font-size: 1px;"></div>',
                footer_template=footer_template
            )
            # Also write to standard output path
            await page.pdf(
                path=pdf_path, 
                format="A4", 
                margin={"top": "20mm", "bottom": "20mm", "left": "15mm", "right": "15mm"},
                display_header_footer=True,
                header_template='<div style="font-size: 1px;"></div>',
                footer_template=footer_template
            )
            
            # 2. Customer View (stripped content)
            customer_content = re.sub(
                r'<h2>[^<]*?(?:Audit Disclosure|Executive Summary|Findings)[^<]*?</h2>.*?(?=<h2|$)', 
                '', 
                enhanced_content, 
                flags=re.DOTALL | re.IGNORECASE
            )
            customer_html = full_html.replace(enhanced_content, customer_content)
            await page.set_content(customer_html)
            customer_path = f"{base}_Customer.pdf"
            print(f"Generating Customer-Facing PDF: {customer_path}...")
            await page.pdf(
                path=customer_path, 
                format="A4", 
                margin={"top": "20mm", "bottom": "20mm", "left": "15mm", "right": "15mm"},
                display_header_footer=True,
                header_template='<div style="font-size: 1px;"></div>',
                footer_template=footer_template
            )
        else:
            print("No audit disclosure section detected. Generating standard statement...")
            await page.set_content(full_html)
            print(f"Generating PDF: {pdf_path}...")
            await page.pdf(
                path=pdf_path, 
                format="A4", 
                margin={"top": "20mm", "bottom": "20mm", "left": "15mm", "right": "15mm"},
                display_header_footer=True,
                header_template='<div style="font-size: 1px;"></div>',
                footer_template=footer_template
            )
            # Generate customer view as identical copy
            customer_path = f"{base}_Customer.pdf"
            print(f"Generating Customer-Facing PDF (copy): {customer_path}...")
            await page.pdf(
                path=customer_path, 
                format="A4", 
                margin={"top": "20mm", "bottom": "20mm", "left": "15mm", "right": "15mm"},
                display_header_footer=True,
                header_template='<div style="font-size: 1px;"></div>',
                footer_template=footer_template
            )
            
        await browser.close()
    print("PDF generation complete!")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 export_to_pdf.py <input_md_path> <output_pdf_path>")
        sys.exit(1)
        
    asyncio.run(convert_md_to_pdf(sys.argv[1], sys.argv[2]))
