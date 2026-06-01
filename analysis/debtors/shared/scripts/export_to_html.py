import os
import sys
import re
from markdown_it import MarkdownIt

def enhance_html(html_content, is_internal=True):
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
        row_match = re.search(r'<tr>\s*<td.*?>.*?</td>\s*<td.*?><strong>(Opening Balance|Balance B/F)</strong></td>.*?<td.*?><strong>(.*?)</strong></td>\s*</tr>', html_content, re.IGNORECASE | re.DOTALL)
        if row_match:
            val = row_match.group(2).strip()
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
    elif "JIM001" in account:
        display_account = "Jim Gas (JIM001)"

    # Formulate styled corporate header block
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
                    <td class="meta-value"><strong>{closing_bal}</strong> <span style="font-size: 7.5pt; color: #64748b;">({"Reconciled Total" if is_internal else "LPG & Cylinder Outstanding"})</span></td>
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
    
    # Wrap Debtor Position Workspace block
    workspace_match = re.search(
        r'(?:<p>)?(?:<!--|&lt;!--)\s*DEBTOR_POSITION_WORKSPACE_START\s*(?:-->|--&gt;)(?:</p>)?(.*?)(?:<p>)?(?:<!--|&lt;!--)\s*DEBTOR_POSITION_WORKSPACE_END\s*(?:-->|--&gt;)(?:</p>)?',
        html_content,
        re.DOTALL | re.IGNORECASE
    )
    # Check simple regex match if comment is exact
    if not workspace_match:
        workspace_match = re.search(
            r'<!--\s*DEBTOR_POSITION_WORKSPACE_START\s*-->(.*?)<!--\s*DEBTOR_POSITION_WORKSPACE_END\s*-->',
            html_content,
            re.DOTALL | re.IGNORECASE
        )
        
    if workspace_match:
        workspace_inner = workspace_match.group(1)
        
        # Turn each H3 sub-section into a nested card
        processed_inner = re.sub(
            r'<h3>(\d\.\s+.*?)</h3>',
            r'</div><div class="position-card"><h3>\1</h3>',
            workspace_inner
        )
        
        # Wrap the whole block in workspace-card, close the last position-card, and fix the first divider boundary
        wrapped_block = f"""
        <div class="workspace-card">
            {processed_inner}
        </div>
        </div>
        """
        wrapped_block = wrapped_block.replace('</div><div class="position-card">', '<div class="position-card">', 1)
        
        # Replace the original block (including comments) in html_content
        html_content = html_content.replace(workspace_match.group(0), wrapped_block)
        
    # Tab replacement logic for Part 1 sub-ledgers (1A, 1B, 1C)
    tab_pattern = re.compile(
        r'<h3>Part 1A:\s*Combined ERP Financial Ledger</h3>(.*?)'
        r'<h3>Part 1B:\s*LPG Gas Financial Ledger</h3>(.*?)'
        r'<h3>Part 1C:\s*Cylinder Financial Ledger</h3>(.*?)'
        r'(?=<h3>Part 1D\b|<h2>|<hr\s*/?>)',
        re.DOTALL | re.IGNORECASE
    )
    
    def replace_with_tabs(match):
        p1a_content = match.group(1)
        p1b_content = match.group(2)
        p1c_content = match.group(3)
        
        tab_html = """
        <div class="tabs-container">
            <div class="tab-list" role="tablist">
                <button class="tab-btn active" role="tab" aria-selected="true" aria-controls="panel-1a" id="tab-1a">Combined ERP Financial Ledger</button>
                <button class="tab-btn" role="tab" aria-selected="false" aria-controls="panel-1b" id="tab-1b">LPG Gas Financial Ledger</button>
                <button class="tab-btn" role="tab" aria-selected="false" aria-controls="panel-1c" id="tab-1c">Cylinder Financial Ledger</button>
            </div>
            
            <div class="tab-panel active" id="panel-1a" role="tabpanel" aria-labelledby="tab-1a">
                <h3>Part 1A: Combined ERP Financial Ledger</h3>
                {}
            </div>
            
            <div class="tab-panel" id="panel-1b" role="tabpanel" aria-labelledby="tab-1b">
                <h3>Part 1B: LPG Gas Financial Ledger</h3>
                {}
            </div>
            
            <div class="tab-panel" id="panel-1c" role="tabpanel" aria-labelledby="tab-1c">
                <h3>Part 1C: Cylinder Financial Ledger</h3>
                {}
            </div>
        </div>
        """.format(p1a_content, p1b_content, p1c_content)
        return tab_html
        
    html_content = tab_pattern.sub(replace_with_tabs, html_content)
    
    return html_content

def build_full_html(enhanced_content, is_internal=True):
    badge = '<span class="view-badge internal-badge">Internal Audit View</span>' if is_internal else '<span class="view-badge customer-badge">Customer View</span>'
    
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Midlands Petroleum - Statement of Account</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap');
        
        body {{
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 9.5pt;
            line-height: 1.6;
            color: #334155;
            background-color: #f1f5f9;
            margin: 0;
            padding: 20px;
        }}
        
        .statement-container {{
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
            max-width: 850px;
            margin: 20px auto;
            padding: 40px;
            position: relative;
            box-sizing: border-box;
        }}
        
        /* View Badge */
        .view-badge {{
            position: absolute;
            top: 15px;
            right: 40px;
            font-size: 7.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 3px 8px;
            border-radius: 4px;
            pointer-events: none;
        }}
        
        .internal-badge {{
            background-color: #fee2e2;
            color: #ef4444;
            border: 1px solid #fca5a5;
        }}
        
        .customer-badge {{
            background-color: #ecfdf5;
            color: #10b981;
            border: 1px solid #6ee7b7;
        }}
        
        /* Debtor Position Workspace Card */
        .workspace-card {{
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            padding: 25px;
            margin-top: 35px;
            margin-bottom: 35px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }}
        
        .workspace-card h2 {{
            color: #1e3a8a;
            border-bottom: 2px solid #cbd5e1;
            margin-top: 0;
            padding-bottom: 8px;
            font-size: 14pt;
        }}
        
        .position-card {{
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px 20px;
            margin-top: 15px;
            margin-bottom: 15px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }}
        
        .position-card h3 {{
            color: #1e293b;
            border-bottom: none;
            margin-top: 0;
            margin-bottom: 12px;
            font-size: 11pt;
            font-weight: 600;
        }}
        
        .position-card table {{
            margin-top: 5px;
            margin-bottom: 5px;
            box-shadow: none;
            border: 1px solid #f1f5f9;
        }}
        
        .position-card tr:nth-child(even) {{
            background-color: #fafbfc;
        }}
        
        /* Header Section */
        .statement-header {{
            margin-bottom: 30px;
            border-bottom: 3px solid #1e3a8a;
            padding-bottom: 20px;
        }}
        
        .header-main {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
        }}
        
        .brand {{
            display: flex;
            align-items: center;
        }}
        
        .logo-icon {{
            font-size: 28pt;
            margin-right: 12px;
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
            font-size: 15pt;
            font-weight: 700;
            color: #1e3a8a;
            margin: 0;
            letter-spacing: 0.02em;
        }}
        
        .doc-title .subtitle {{
            font-size: 8.5pt;
            color: #475569;
            font-weight: 500;
        }}
        
        /* Header Metadata Section */
        .meta-section {{
            margin-top: 15px;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 18px;
        }}
        
        .meta-table {{
            width: 100%;
            border-collapse: collapse;
            border: none !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
        }}
        
        .meta-table tr {{
            background-color: transparent !important;
        }}
        
        .meta-table tr:hover {{
            background-color: transparent !important;
        }}
        
        .meta-table td {{
            padding: 5px 8px !important;
            border: none !important;
            font-size: 8.5pt !important;
            color: #334155 !important;
        }}
        
        .meta-table td.meta-label {{
            font-weight: 600 !important;
            color: #64748b !important;
            width: 18%;
            text-align: left;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        
        .meta-table td.meta-value {{
            color: #0f172a !important;
            font-weight: 500 !important;
            width: 32%;
            text-align: left;
        }}
        
        h2 {{
            font-family: 'Outfit', sans-serif;
            font-size: 13pt;
            font-weight: 600;
            color: #1e3a8a;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 6px;
            margin-top: 30px;
            margin-bottom: 15px;
        }}
        
        h3 {{
            font-family: 'Outfit', sans-serif;
            font-size: 11pt;
            font-weight: 600;
            color: #0f172a;
            margin-top: 20px;
            margin-bottom: 10px;
        }}
        
        p {{
            margin-top: 0;
            margin-bottom: 12px;
            color: #475569;
        }}
        
        /* Tables */
        table {{
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 10px;
            margin-bottom: 25px;
            font-size: 8.5pt;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }}
        
        th {{
            background-color: #1e293b;
            color: #ffffff;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 7.5pt;
            letter-spacing: 0.05em;
            padding: 10px 12px;
            border: none;
            text-align: left;
        }}
        
        td {{
            padding: 8px 12px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
        }}
        
        tr:last-child td {{
            border-bottom: none;
        }}
        
        tr:nth-child(even) {{
            background-color: #f8fafc;
        }}
        
        tr:hover td {{
            background-color: #f1f5f9;
            transition: background-color 0.15s ease;
        }}
        
        /* Bolding dynamic total/balance rows */
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
            margin-bottom: 6px;
            color: #475569;
        }}
        
        /* Horizontal Rule */
        hr {{
            border: 0;
            border-top: 1px solid #cbd5e1;
            margin: 25px 0;
        }}
        
        /* Alert Boxes */
        .alert-box {{
            padding: 12px 15px;
            margin: 20px 0;
            border-radius: 8px;
            font-size: 9.5pt;
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
            padding: 18px 22px;
            margin-top: 30px;
            margin-bottom: 30px;
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
            margin-bottom: 5px;
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
        
        /* Page Footer styling */
        .page-footer {{
            text-align: center;
            font-size: 7.5pt;
            color: #94a3b8;
            border-top: 1px solid #cbd5e1;
            padding-top: 15px;
            margin-top: 40px;
        }}
        
        /* Interactive sub-ledger tabs styling */
        .tabs-container {{
            margin: 30px 0;
            background-color: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }}
        
        .tab-list {{
            display: flex;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-bottom: 1px solid #cbd5e1;
            padding: 0 15px;
            gap: 10px;
        }}
        
        .tab-btn {{
            font-family: 'Outfit', sans-serif;
            font-size: 9pt;
            font-weight: 600;
            color: #64748b;
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            padding: 14px 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            outline: none;
        }}
        
        .tab-btn:hover {{
            color: #1e3a8a;
            border-bottom-color: #cbd5e1;
        }}
        
        .tab-btn.active {{
            color: #1e3a8a;
            border-bottom-color: #1e3a8a;
        }}
        
        .tab-panel {{
            display: none;
            padding: 25px;
        }}
        
        .tab-panel.active {{
            display: block;
            animation: fadeIn 0.25s ease-in-out;
        }}
        
        @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(2px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        
        /* Responsive Print Layout Styles */
        @media print {{
            body {{
                background-color: #ffffff;
                padding: 0;
                font-size: 9pt;
            }}
            .statement-container {{
                border: none;
                box-shadow: none;
                padding: 0;
                margin: 0;
                max-width: 100%;
            }}
            .view-badge {{
                display: none;
            }}
            @page {{
                size: A4;
                margin: 15mm;
            }}
            tr:hover td {{
                background-color: transparent !important;
            }}
            /* Print tabs sequentially */
            .tab-list {{
                display: none !important;
            }}
            .tab-panel {{
                display: block !important;
                page-break-inside: avoid;
                margin-bottom: 35px;
                padding: 0 !important;
                border: none !important;
            }}
            .tabs-container {{
                border: none !important;
                box-shadow: none !important;
            }}
        }}
    </style>
    <noscript>
        <style>
            .tab-panel {{
                display: block !important;
            }}
            .tab-list {{
                display: none !important;
            }}
            .tabs-container {{
                border: none !important;
                box-shadow: none !important;
            }}
        </style>
    </noscript>
</head>
<body>
    <div class="statement-container">
        {badge}
        {enhanced_content}
        <div class="page-footer">
            Midlands Petroleum &middot; LPG Stock Reconciliation Statement &middot; Generated dynamically under CYL Settlement Doctrine v4
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', () => {{
            const tabs = document.querySelectorAll('.tab-btn');
            const panels = document.querySelectorAll('.tab-panel');

            tabs.forEach(tab => {{
                tab.addEventListener('click', () => {{
                    const targetPanelId = tab.getAttribute('aria-controls');

                    tabs.forEach(t => {{
                        t.classList.remove('active');
                        t.setAttribute('aria-selected', 'false');
                    }});
                    panels.forEach(p => p.classList.remove('active'));

                    tab.classList.add('active');
                    tab.setAttribute('aria-selected', 'true');
                    const targetPanel = document.getElementById(targetPanelId);
                    if (targetPanel) {{
                        targetPanel.classList.add('active');
                    }}
                }});
                
                // Keyboard accessibility (Arrow keys, Home, End)
                tab.addEventListener('keydown', (e) => {{
                    let targetTab = null;
                    const tabButtons = Array.from(tab.parentElement.querySelectorAll('.tab-btn'));
                    const index = tabButtons.indexOf(tab);

                    if (e.key === 'ArrowRight') {{
                        targetTab = tabButtons[(index + 1) % tabButtons.length];
                    }} else if (e.key === 'ArrowLeft') {{
                        targetTab = tabButtons[(index - 1 + tabButtons.length) % tabButtons.length];
                    }} else if (e.key === 'Home') {{
                        targetTab = tabButtons[0];
                    }} else if (e.key === 'End') {{
                        targetTab = tabButtons[tabButtons.length - 1];
                    }}

                    if (targetTab) {{
                        targetTab.focus();
                        targetTab.click();
                        e.preventDefault();
                    }}
                }});
            }});
        }});
    </script>
</body>
</html>"""

def convert_md_to_html(md_path, html_path):
    if not os.path.exists(md_path):
        print(f"Error: Markdown file not found at {md_path}")
        return False
        
    print(f"Reading markdown from {md_path}...")
    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()
        
    # Generate Customer Markdown by stripping INTERNAL_ONLY blocks
    # Removes everything between <!-- INTERNAL_ONLY_START --> and <!-- INTERNAL_ONLY_END --> tags
    customer_md_content = re.sub(
        r'<!--\s*INTERNAL_ONLY_START\s*-->.*?<!--\s*INTERNAL_ONLY_END\s*-->',
        '',
        md_content,
        flags=re.DOTALL
    )
    
    # Strip the comments themselves from the internal content
    internal_md_content = md_content.replace('<!-- INTERNAL_ONLY_START -->', '').replace('<!-- INTERNAL_ONLY_END -->', '')
    
    md = MarkdownIt('js-default')
    
    # Compile Internal HTML
    print("Converting internal markdown to HTML...")
    internal_html_body = md.render(internal_md_content)
    enhanced_internal = enhance_html(internal_html_body, is_internal=True)
    
    # Compile Customer HTML
    print("Converting customer markdown to HTML...")
    customer_html_body = md.render(customer_md_content)
    enhanced_customer = enhance_html(customer_html_body, is_internal=False)
    
    # Paths setup
    base, ext = os.path.splitext(html_path)
    default_path = html_path
    internal_path = f"{base}_Internal{ext}"
    customer_path = f"{base}_Customer{ext}"
    
    # Format templates
    full_internal_html = build_full_html(enhanced_internal, is_internal=True)
    full_customer_html = build_full_html(enhanced_customer, is_internal=False)
    
    print(f"Writing default HTML (Internal): {default_path}...")
    with open(default_path, 'w', encoding='utf-8') as f:
        f.write(full_internal_html)
        
    print(f"Writing Internal HTML: {internal_path}...")
    with open(internal_path, 'w', encoding='utf-8') as f:
        f.write(full_internal_html)
        
    print(f"Writing Customer HTML: {customer_path}...")
    with open(customer_path, 'w', encoding='utf-8') as f:
        f.write(full_customer_html)
        
    print("HTML generation complete!")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 export_to_html.py <input_md_path> <output_html_path>")
        sys.exit(1)
        
    convert_md_to_html(sys.argv[1], sys.argv[2])
