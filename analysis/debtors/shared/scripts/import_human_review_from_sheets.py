import os
import sys
import json
import argparse
import pandas as pd

def main():
    parser = argparse.ArgumentParser(description="Import Human Review Annotations from Excel Workspace")
    parser.add_argument("--debtor", default="JIM001", help="Debtor Account Number")
    args = parser.parse_args()

    debtor_code = args.debtor
    workspace_path = f"analysis/debtors/{debtor_code}/data/{debtor_code}_Reconciliation_Workspace.xlsx"
    output_json_path = f"analysis/debtors/{debtor_code}/data/human_review_annotations.json"

    if not os.path.exists(workspace_path):
        print(f"Error: Reconciliation workspace not found at {workspace_path}")
        sys.exit(1)

    print(f"Reading human review comments from {workspace_path}...")

    try:
        # Load the Human_Review sheet from the workbook
        df_review = pd.read_excel(workspace_path, sheet_name="Human_Review")
        
        # Filter for rows that actually have human review notes or overrides
        # We look for non-empty human_value, review_note, or review_status indicating manual work
        df_active_reviews = df_review[
            df_review['human_value'].notna() | 
            df_review['review_note'].notna() | 
            (df_review['review_status'] != 'Review Required')
        ]
        
        # Clean null values to empty strings or None for JSON serializability
        df_active_reviews = df_active_reviews.fillna("")
        
        active_records = df_active_reviews.to_dict(orient="records")
        
        # Save to JSON
        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(active_records, f, indent=2)
            
        print(f"Successfully imported {len(active_records)} human annotations into {output_json_path}")
    except Exception as e:
        print(f"Error reading from sheet: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
