# Turn Bundle Checklist

Complete before publishing a turn folder to the Evidence Exchange.

---

## Identity

- [ ] Debtor code recorded (`debtor_code`)
- [ ] Turn number recorded (`turn`, zero-padded folder `turn-<NNN>`)
- [ ] Generated date/time in UTC (`generated_at`)
- [ ] Superseded turn recorded if applicable (`supersedes_turn`)
- [ ] Source as-at date recorded (`source_as_at`)

## ERP Freshness Gate

- [ ] Newest ERP extract in the repository identified
- [ ] ERP evidence date compared with the current operating date
- [ ] Operator asked whether a newer ERP export is available
- [ ] Operator response recorded
- [ ] Existing file not called CURRENT before operator confirmation
- [ ] Live comms and reconciliation closure blocked while confirmation is pending

## Anchors

- [ ] ERP anchor amount, as-at date, and source artifact recorded
- [ ] `erp_freshness.status` is `LATEST_IN_REPOSITORY` until operator confirms
- [ ] Balance classified `ASSERTED_STALE_PENDING_OPERATOR_CONFIRMATION` when gate pending
- [ ] Portfolio anchor recorded when allocation work references dashboard metrics
- [ ] Canonical source path for each anchor in manifest
- [ ] Staleness warning set when current ERP ≠ portfolio anchor

## Turn metadata

- [ ] Lane or workstream recorded (`lane`)
- [ ] Outcome recorded: **PASS**, **STOP**, or **PARTIAL**
- [ ] Residual amount and permitted tolerance recorded
- [ ] `recon_state` reflects actual project state (not aspirational)

## Artifacts

- [ ] `manifest.json` present and valid JSON
- [ ] Artifact inventory lists every file in the turn folder
- [ ] Each artifact has `path`, `canonical_source`, and `purpose`
- [ ] Bundle is self-contained for review without repo access

## Evidence quality

- [ ] Proven identities listed separately from asserted items
- [ ] Asserted items flagged; not promoted to proven without cent-perfect identity
- [ ] Assumed hypotheses listed with kill conditions
- [ ] All totals recomputed from source — no hard-coded balancing values
- [ ] Credits not treated as exposure
- [ ] Staged overrides not silently ratified

## Invariants

- [ ] Conservation invariants checked and recorded in `invariants[]`
- [ ] Failed invariants block `recon_state: complete`

## Operator queue

- [ ] Operator decisions required listed explicitly
- [ ] `decision_inputs.md` present when ratification or comms actions pending

## Security

- [ ] No credentials, API keys, or `.env` contents in bundle
- [ ] No full unrestricted database dumps
- [ ] No application source code or dependency folders

## Canonical state

- [ ] Canonical repo artifacts not moved or deleted
- [ ] `allocation_edges.csv` unchanged unless turn explicitly committed edges
- [ ] Override registries unchanged unless operator ratified

---

*Reject bundle publication if any security or canonical-state check fails.*
