# Registers Plan — Skills, Scripts, Account Artifacts

**Status:** `PROPOSED — NOT RATIFIED`
**Raised:** 2026-09-29 (BR0001 v5 session)
**Authority to ratify:** Operator. Per `DEBTORS_DOCTRINE.md` §7 a worker session
consumes doctrine and does not author portfolio-wide rules. Everything in this
document that binds future sessions is staged, not in force.
**Related:** `SLICE_REGISTRY.json` (the one register that already exists and works)

---

## 1. Why this exists

The portfolio already has one register — `SLICE_REGISTRY.json` — and it works: 37
regenerable artifacts with declared `depends_on` / `invalidates` edges, a
ratification date, and a named authority. Nothing else in the repo has that
treatment.

The gap surfaced during the BR0001 v5 session. The operator asked a plain
question — *"do we have a register of Skills, Scripts, Payer Classes, Reports,
Statements, Artifacts?"* — and answering it required a filesystem crawl rather
than a lookup. That is the defect. A register is not documentation; it is the
thing that makes "what do we have" answerable without a crawl, and therefore the
thing that makes drift detectable.

### What the crawl found

| Finding | Tag | Evidence |
| :--- | :--- | :--- |
| Skill files live under **5 different roots**, not one | `PROVEN` | `analysis/debtors/shared/docs/SKILL_REGISTRY_AUDIT.json` |
| 5 of 21 files in `.agents/skills/` carry no frontmatter — they are role prompts and one TDR, not loadable skills | `PROVEN` | same |
| The skill name `lsr-pm` is declared by **two** different files | `PROVEN` | same |
| 2 account-local reconciliation skills (FAM000, JEN001) are invisible to any agent that only reads `.agents/skills/` | `PROVEN` | same |
| 81 `.mjs` files exist repo-wide; 33 `npm run` entries exist | `PROVEN` | `find . -name '*.mjs' \| wc -l`; `package.json` |
| `reconcile_debtor_v5_from_txt.mjs` — the owning generator for the entire v5 lane — has **no** `npm run` entry, while `creditors:statement-v5` does | `PROVEN` | `package.json` |

That last row is the cost made concrete. This session invoked the v5 generator by
absolute path because there was no registered entry point to invoke, and nothing
anywhere records that the script is the owner of the v5 statement slices.

### The five roots

| Root | Files | Nature |
| :--- | :--- | :--- |
| `.agents/skills/` | 21 | Primary. Mixed: 16 real skills + 4 role prompts + 1 TDR |
| `analysis/skills/` | 2 | Directory-per-skill form (`<name>/SKILL.md`) |
| `.claude/skills/` | 1 | `lpg-recon-bug-fixer` — Claude Code only |
| `docs/skills/` | 1 | `erp_price_maintenance_agent.md` — no frontmatter |
| `analysis/debtors/{CODE}/docs/` | 2 | Account-local (`FAM000`, `JEN001`) |

Two competing file-naming conventions are in use inside `.agents/skills/` alone
(`SKILL_Foo.md`, `foo_SKILL.md`, `Foo_Skill.md`). No register can be derived from
filenames. It has to be declared.

---

## 2. Scope decision — what gets a register and what does not

Six things were asked about. They do not all need the same treatment, and saying
so is part of locking the plan in.

| Asked about | Ruling | Where it lives |
| :--- | :--- | :--- |
| **Skills** | Needs a register. Build it. | **Register 1** (this plan) |
| **Scripts** | Needs a register. Build it after Register 1. | **Register 3** (this plan) |
| **Artifacts** (per account: which statements, reports, configs, at what version) | Needs a register. Build it after Register 1. | **Register 2** (this plan) |
| **Reports / Statements** | **Already registered** — these *are* slices. `statement.v5.composed`, `customer.soa`, `fixture.v5` etc. are declared in `SLICE_REGISTRY.json`. What is missing is not a register of *kinds* but an index of *instances per account* — which is Register 2. | `SLICE_REGISTRY.json` + Register 2 |
| **Payer Classes** | **Already registered**, but in prose, in two places: `SKILL_Debtors_Orchestrator.md` §4 and `DEBTORS_ORCHESTRATION_PRD.md` §6. Duplicated prose is a drift risk, but promoting it to JSON is a doctrine change to the lane taxonomy and is **out of scope for a worker session**. Flagged, not touched. | Deferred — see §6 |

So: three registers to build, two things already covered, one deferred with the
reason named.

---

## 3. Register 1 — Skill Registry

**Artifact:** `analysis/debtors/shared/SKILL_REGISTRY.json`
**View:** `analysis/debtors/shared/docs/SKILL_REGISTRY.md` (generated — do not edit)
**Audit:** `analysis/debtors/shared/docs/SKILL_REGISTRY_AUDIT.json` (generated)
**Generator:** `analysis/debtors/shared/scripts/render_skill_registry.mjs`
**Entry point:** `npm run debtors:skill-registry` (check) / `--write` (regenerate)

### Design principle

The registry **declares**; the generator **scans and compares**. The register is
not generated from the filesystem, because a register derived from the thing it
governs cannot detect that the thing has drifted. The generator's job is to fail
when declaration and filesystem disagree.

This is the same relationship `SLICE_REGISTRY.json` has to the slices it governs.

### Record schema

| Field | Meaning |
| :--- | :--- |
| `id` | Stable registry key. Never reused, never renamed. |
| `name` | Frontmatter `name`, or `null` for unregistered role prompts. |
| `path` | Repo-relative path. Validated to exist. |
| `root` | Which of the 5 roots. |
| `kind` | `worker` · `generator` · `orchestrator` · `gate` · `role-prompt` · `reference` · `account-local` |
| `lane` | `debtors` · `creditors` · `platform` · `pipeline` · `cross-cutting` |
| `status` | `active` · `superseded` · `duplicate` · `unregistered` |
| `canonical_for` | What this skill is the single source of truth for. |
| `not_for` | Explicit negative scope — the anti-pattern this skill must not be used for. Carried over from skill frontmatter, which already states it. |
| `owns_scripts` | `npm run` targets or script paths this skill drives. |
| `produces_slices` | `SLICE_REGISTRY.json` slice ids. **This is the join between the two registers.** |
| `related` | Sibling skills a session should read alongside this one. |
| `notes` | Defect or history note. Where `status` is not `active`, this states why. |

### Gates the generator enforces

| Gate | Fails when |
| :--- | :--- |
| `PATH_EXISTS` | A declared `path` is missing from disk. |
| `NO_ORPHAN_FILES` | A skill file exists on disk under a known root but is absent from the register. |
| `NAME_UNIQUE` | Two `active` records share a `name`. |
| `FRONTMATTER_MATCH` | Declared `name` disagrees with the file's actual frontmatter. |
| `SLICE_IDS_VALID` | A `produces_slices` id is absent from `SLICE_REGISTRY.json`. |
| `SCRIPT_TARGETS_VALID` | An `owns_scripts` `npm run` target is absent from `package.json`. |

`NO_ORPHAN_FILES` is the gate that gives the register durable value: a new skill
added without registration breaks the build rather than quietly becoming invisible.

`SLICE_IDS_VALID` and `SCRIPT_TARGETS_VALID` are why this register is worth more
than a markdown index — they make the skill catalog, the artifact DAG, and the
runnable entry points into one connected graph instead of three disconnected lists.

---

## 4. Register 2 — Account Artifact Index

**Artifact:** `analysis/debtors/shared/PORTFOLIO_ARTIFACT_INDEX.json`
**Owner:** `debtors_sync.mjs` (extend — do not add a parallel script)

### Question it must answer

> Which accounts have a v5 statement? Which are still on v4? Which have a
> tag-coverage report, and how stale is it? Which have `payment_pattern_overrides.json`
> and which are relying on defaults?

Today that requires walking 40-odd account directories.

### Design

For each account under `analysis/debtors/` and `analysis/creditors/`, emit one row
per `SLICE_REGISTRY.json` slice id, recording `present`, `path`, `mtime`, and the
generator version that stamped it. Slice ids are the key, so Register 2 inherits
the DAG from `SLICE_REGISTRY.json` and gains staleness detection for free: a slice
whose `mtime` predates any of its `depends_on` slices is stale by definition.

### Why this is sequenced second, not first

`debtors_sync.mjs` writes `project.json`. Adding an `artifacts` block to
`project.json` is a change to the field contract in `PROJECT_SCHEMA.md`, and that
contract is governed. It needs an operator decision on two points before code is
written:

1. Does the index live **in** each `project.json` (queryable per account, but
   inflates the file and churns its diff on every sync), or **beside** it in a
   single portfolio file (clean diffs, one more artifact to keep in step)?
2. Does a stale slice make `debtors:sync` **fail**, or merely **report**?

`debtors_sync.mjs` has existing test coverage (`debtors_sync.d17.test.mjs`,
`debtors_sync.d19.test.mjs`). Any change here must extend those tests, not work
around them.

**Recommendation (not a ruling):** portfolio file, report-only at first. It leaves
`project.json` diffs clean and cannot break the sync path that the whole portfolio
depends on.

---

## 5. Register 3 — Script Catalog

**Artifact:** `analysis/debtors/shared/SCRIPT_REGISTRY.json`
**Convention:** a header docblock in each script, so the metadata lives with the
code and cannot drift from it.

```js
/**
 * @scope        universal | lane:v5 | account:BR0001
 * @durability   permanent | one-shot | deprecated
 * @owns-slice   v5.part1a.lpg, v5.bridge
 * @entrypoint   npm run debtors:statement-v5
 */
```

### Question it must answer

> Is this script a permanent portfolio tool, a one-shot migration someone ran in
> March, or dead code? What is its entry point?

With 81 `.mjs` files and 33 registered entry points, that is currently unanswerable
by inspection. Names like `payment_doc_allocation.mjs` alongside
`payment_doc_allocation_2025.mjs` are exactly the ambiguity this resolves.

### First fix this register forces

Registering `reconcile_debtor_v5_from_txt.mjs` as
`npm run debtors:statement-v5` — the missing entry point proven in §1. That single
addition also closes the asymmetry with the already-registered
`creditors:statement-v5`.

### Why this is sequenced last

It is the cheapest of the three and the least valuable on its own: a catalog of
scripts nothing points at is inventory, not governance. It gets its value from
`owns_scripts` in Register 1 and the generator stamps in Register 2. Building it
first would mean building the least connected piece before the things that connect
to it.

---

## 6. Deferred — Payer Class taxonomy

Payer classes are declared in prose in two places
(`SKILL_Debtors_Orchestrator.md` §4, `DEBTORS_ORCHESTRATION_PRD.md` §6). The
duplication is a live drift risk: nothing makes the two agree.

Promoting the taxonomy to a fourth register would be the consistent move, and it
would slot cleanly into Register 1 (each skill declares the payer classes it
serves). It is **not** being done here, because the payer class taxonomy decides
which recon lane an account is routed to, and lane routing is doctrine. Per §7 a
worker session may not author that.

**Staged for operator decision.** Named here so it is not silently dropped.

---

## 7. Sequencing, and why Register 1 goes first

| # | Register | Depends on | Touches existing behaviour |
| :--- | :--- | :--- | :--- |
| 1 | Skill Registry | nothing | **No** — new files only |
| 2 | Account Artifact Index | `PROJECT_SCHEMA.md` decision | **Yes** — `debtors_sync.mjs` |
| 3 | Script Catalog | 1 and 2 for its edges | Yes — `package.json` |

Register 1 is first on three counts, in order of weight:

1. **It is unblocked.** Registers 2 and 3 both need an operator decision before
   code is written — a schema contract change and a `package.json` convention
   respectively. Register 1 needs neither.
2. **It cannot regress anything.** New files, one new npm script, no edits to any
   existing generator or gate. The blast radius is zero.
3. **It already has defects to catch.** The `lsr-pm` duplicate and the five
   frontmatter-less files are real and present today. A register that starts by
   catching live problems has demonstrated its value; one that starts clean has
   only asserted it.

It also supplies the vocabulary — `owns_scripts`, `produces_slices` — that
Registers 2 and 3 attach to. Building it first means the other two have somewhere
to connect.

---

## 8. Tripwires — what reopens this plan

Per doctrine, a closed ruling names the events that reopen it.

- **A sixth skill root appears.** The 5-root inventory is the premise of Register
  1's scan. A new root silently breaks `NO_ORPHAN_FILES`. Fix the root list, or
  consolidate the roots.
- **`lsr-pm` is resolved.** When the operator rules which of the two files is
  canonical, the `duplicate` status and its `notes` must be updated, and
  `NAME_UNIQUE` promoted from warning to hard failure.
- **The `.claude/skills/` and `.agents/skills/` split is consolidated.** Both
  roots exist because two different agent runtimes read two different paths. If
  that changes, the `root` field's purpose changes with it.
- **`SLICE_REGISTRY.json` version bumps.** `produces_slices` ids are foreign keys
  into it. A slice rename breaks `SLICE_IDS_VALID` — which is the gate working, not
  failing.
- **Any skill gains an owning script.** `owns_scripts` must be updated in the same
  commit, or `SCRIPT_TARGETS_VALID` goes stale in the silent direction — a skill
  that drives a script nobody recorded.

---

## 9. Operator decisions required

Nothing below is assumed. Silence is not ratification.

| # | Decision | Blocks |
| :--- | :--- | :--- |
| D1 | Ratify Register 1's schema and the 6 gates as portfolio convention | Register 1 moving from `PROPOSED` to ratified |
| D2 | `lsr-pm` — which of the two files is canonical, and is the other superseded or deleted? | `NAME_UNIQUE` becoming a hard gate |
| D3 | The 4 role prompts and 1 TDR in `.agents/skills/` — do they stay there as `role-prompt`/`reference`, or move out of a skills directory? | Register 1 `status` values settling |
| D4 | Register 2 — artifact index **in** `project.json` or **beside** it? Fail or report on stale? | Register 2 implementation |
| D5 | Register 3 — adopt the header docblock convention? | Register 3 implementation |
| D6 | Payer class taxonomy — promote to a register? (doctrine change, §7) | Register 4, if any |

Register 1 is built in this session as a working proposal, so D1–D3 are decided
against something real and runnable rather than against a description of it. It is
marked `PROPOSED — NOT RATIFIED` in the JSON itself until D1 is answered.
