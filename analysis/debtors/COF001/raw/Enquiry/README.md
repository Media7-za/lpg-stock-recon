# COF001 raw/Enquiry — files that are not the statement TXT

- `COF001_2023.TXT`, `COF001_2024.TXT`, `COF001_2025.TXT`: year-split exports from branch `claude/eager-mccarthy-vsfs1u`. **They fail the D21 intake check** (their header CURRENT BALANCE is the account's current -16,256.52, but each file's last running balance is a year-end figure: 9,596.02; 7,476.92; 15,939.43), so under D21 they are not filed as statement TXT. Kept here only as the components that chain into `../COF001_COMBINED.TXT` (each file opens on the previous closing). Not read by any generator.
- `COF001_UNDATED_post_fix_window.TXT`: ERP-agent upload of 2026-10-16 (credit note 15558 reversal and re-issue). Passes the numeric D21 checks but is undated and a window (B/F -1,076.02), so it is evidence, not the statement TXT.
- Check output: `../../reports/COF001_D21_INTAKE_2026-10-16.md`; script: `../../scripts/d21_intake_check.mjs`.
