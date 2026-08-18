---
id: 7bb6d7f9-a0ea-4038-99d7-e2a10d96b6f1
title: "Build Log"
type: report
project: "GitPulse"
tags:
  - "#report"
  - "#project"
  - "#ld/living"
  - "#stack/typescript"
  - "#status/shipped"
  - "#cluster/personal"
status: shipped
source_path: "/Users/brunojaamaa/Desktop/gitpulse"
created: "2026-08-17"
updated: "2026-08-17"
---

# Build Log

**Built 2026-08-17 by `claude:subagent-gitpulse` under the standard vault brief**
(`Main/Shards/hq/_VAULT-BRIEF.md`), as part of the BRUNO HQ phase 2 build.

## What was done, in order

1. **Hazard check first.** `find … -flags +dataless` returned **0**.
2. **Read-only recon.** `git branch -a`, `status --short`, `log -30`, commit and unpushed
   counts (⚠️ against `origin/master`, not `origin/main`), the authorship split, `du`,
   `find`. **No destructive git ran at any point.**
3. **`gh repo view br9704/gitpulse --json homepageUrl,…`** — read-only, and the one `gh` call
   the brief permits.
4. **Fetched the live case study** at `brunojaamaa.dev/projects/gitpulse` and diffed its
   claims against `package.json`, `SCORING.md` and `src/api/github.ts`.
5. ⚠️ **Ran the test suite** — `npx vitest run` — rather than reading a test count from a
   document. **122 passing across 6 suites in 200 ms.** That mattered here specifically,
   because this project's own history contains "passing tests" that verified nothing.
6. **Read the documents:** `README.md` in full (392 lines), `package.json`, `SCORING.md`
   structure, `masterplan.md` headings, and the hub note.
7. **Verified the Shannon entropy claim in code** at `src/utils/scoring.ts:101` rather than
   accepting the hub note's assertion. It is real.
8. **`flint init` → `flint sync` → `flint reference codebase`.**
9. **Wrote 36 notes** plus a root `CLAUDE.md`, across seven sections plus plumbing.
10. **Wrote and ran a verification script**, fixed what it found, re-ran to green.

## Assumptions made

| Assumption | Basis |
|---|---|
| The npm package is published at 1.0.0 | **Four independent sources agree**: `package.json`, commit `4eddfde` recording the publish, the README's npm badge, and the case study's `"PUBLISHED ON NPM"` status. ⚠️ **The registry itself was not queried** from this session |
| `health: green` | Published, 122 tests green on Node 20/22/24, three runtime dependencies, zero install-time lifecycle scripts, no bot authorship, no dead code, every published claim traceable. The six stale branches and the pending OIDC switch are untidiness and an open task, not ill health — both go in `health_note` |
| `status: shipped` | Published to a public registry. That is the strongest form of shipped in this estate |
| `kind: cli` | It is a terminal binary, not a web app. The only one of the three in this batch |
| `#stack/typescript` | TypeScript strict ESM is the defining choice; the runtime surface is deliberately tiny |

## Deviations from the brief

| # | Deviation | Why |
|---|---|---|
| 1 | ⚠️ **The Flint is registered as `GITPULSE`, not the requested `GitPulse`** | `flint init "GitPulse"` is **rejected** — mixed case satisfies neither Title Case nor an all-caps acronym. `GITPULSE` was chosen over `Gitpulse` because it matches both the case study's own heading (`GITPULSE`) and the existing registry convention for product names in this estate (`POKEAI`, `PULSE`, `HIVE`, `RIPPLE`, `GRAIN`). **Every note carries `project: "GitPulse"`**, the real name |
| 2 | **Section set reduced to seven**, dropping `40 Data & Integrations`, `70 Ops Deploy & Env`, `80 Testing & Quality` and `Z0 Archive` | The brief instructs dropping rather than padding. The only integration is three REST endpoints, already covered in `10 Architecture`; there is no deploy target beyond npm, which has its own note in `30 Setup & Run`; testing lives with the codebase map because coverage here is by surface; nothing is archived |
| 3 | ⚠️ **The test suite was executed** | The brief's audit list does not require running tests, and running them is a write to `node_modules/.vite` at most. It was done because a documented test count is exactly the kind of claim this repo's own history proves unreliable. **Nothing else was executed** — no build, no publish, no network call |
| 4 | **`flint resolve` does exist** in 0.6.0-dev.21, contrary to the brief's warning | `flint --help` lists it under *References*. Recorded as asked. Not needed |
| 5 | **`flint reference codebase <name> <path>` fulfils in one call**; `flint fulfill` was never needed | Confirms the prior agent's finding, now across all three projects |
| 6 | **No `adr-writer` shard** | Optional in the brief. Decisions are already recorded in `masterplan.md` — one of them with its own top-level section |
| 7 | **The live case study was fetched over the web** | `~/bruno-portfolio` does not exist on this machine. Read-only |

## Verification — programmatic

Script asserts: **0** broken wikilinks · **0** orphan notes · all frontmatter parses · every
`tags:` item quoted · `status:` and `health:` from their closed sets · every `id:` a lowercase
UUID used once · **every repo directory** documented in the inventory or audit, or excluded
with a reason.

Flint's own kernel scaffold is excluded — it ships with the CLI and this vault did not author
it.

### Results

```
notes (authored):   37   (36 notes + CLAUDE.md)
wikilinks checked:  138
repo dirs scanned:  12
errors:             0
warnings:           0
```

## Vault tree

```
(Flint) GITPULSE/
├── CLAUDE.md
├── Mesh/
│   ├── (System) Flint Init.md
│   ├── (Map) Master Map.md
│   ├── (Report) Project Summary.md
│   ├── (Report) Folder Audit.md
│   ├── (Report) Gaps & Questions.md
│   ├── (Report) Build Log.md
│   ├── (Index) Complete File Inventory.md
│   ├── (Guide) BRUNO HQ.md
│   ├── 00 Overview/            (Index) + 2 notes
│   ├── 10 Architecture/        (Index) + 2 notes
│   ├── 20 Codebase Map/        (Index) + 2 notes
│   ├── 30 Setup & Run/         (Index) + 2 notes
│   ├── 50 Decisions/           (Index) + 1 note
│   ├── 60 Roadmap, Tasks & Ideas/ (Index) + 1 note
│   └── 90 Reference/           (Index) + 3 notes
├── Sources/(Index) Sources.md
├── Media/(Index) Media.md
├── Exports/(Note) Exports.md
└── Shards/
    ├── codebase-map-refresh.md
    ├── changelog-from-git.md
    ├── onboarding-guide.md
    └── vault-audit.md
```

## Two facts recorded prominently because they will trip automation

1. ⚠️ **The branch is `master`, not `main`.** Recorded in the root `CLAUDE.md`,
   [[(System) Flint Init]], [[(Report) Project Summary]], [[(Note) Git History]] and
   `Shards/changelog-from-git.md`. The shard uses `origin/master` explicitly and warns
   against copying a `main`-based script from the other two projects in this cluster.
2. ⚠️ **`assets/demo.svg` is served to the README from
   `raw.githubusercontent.com/.../master/`**, so renaming the branch would break the README
   image on GitHub **and on npm**.

## The finding that matters

The brief asked whether the public claim matches the code. **It does** — and the case study
goes further than the other two by explaining the `@aethereumdev` scoping decision on the
page rather than leaving it unstated.

**The stale artefact is the hub note, and its largest error is an omission:** it does not
mention npm at all, while `@aethereumdev/gitpulse@1.0.0` has been published since 2026-08-15.
It also says `path: none`, `status: dormant`, "33 tests" against a verified **122**, and
"Node 18+" against an actual **>= 20**.

Six corrections, itemised in [[(Report) Gaps & Questions]].

---

## Late correction — shards were orphaned

The verification script's orphan check initially flagged all four files in `Shards/`, because
`(System) Flint Init` listed them as plain code spans rather than links.

**They were made real wikilinks rather than exempted from the check.** Exempting them would
have made the assertion weaker for no benefit; linking them makes the shards reachable by
navigation, which is what a reader actually needs. All three vaults in this batch were
changed the same way, so the check means the same thing across them.

Re-verified to **0 errors, 0 warnings**.

---

## Completion pass — 2026-08-17

The first build of this vault was **cut off by a session limit** before its structural files
were written, and a recovery tool generated placeholder versions of the Master Map, Build
Log, HQ guide and file inventory from what was already on disk. A second pass under the same
brief finished the job. What that pass added:

| # | Added | Why |
|---|---|---|
| 1 | [[(Note) Downstream Consumers]] in `90 Reference` | 🔴 **The single biggest fact this vault was missing.** `ctxbench` draws **7 of its 24 benchmark tasks** from this repo as hand-authored defects at **pinned commits**. That makes gitpulse load-bearing for a **published experiment**, and the dependency is on its *commit history*, not its output. Neither the hub note nor the first build recorded it |
| 2 | The ctxbench warning promoted into [[(Report) Project Summary]] top risks (**#1**), [[(Guide) BRUNO HQ]] and [[(Report) Gaps & Questions]] (**8b**) | A hazard recorded only in a reference note is a hazard nobody reads before running `git rebase` |
| 3 | Amended "delete the six stale branches" wherever it appears | It was unqualified advice. Deleting a branch that is the sole path to a pinned commit would break the benchmark. Now gated on a reachability check |
| 4 | The four project shards, wikilinked from [[(System) Flint Init]] | `codebase-map-refresh` · `changelog-from-git` · `onboarding-guide` · `vault-audit`. All four hardcode `master` |
| 5 | This section | For a while this Build Log was the recovery tool's stub, which stated the folder audit and the gaps report "were genuinely not produced". **Both exist and are substantive.** The stub had been superseded before this pass ran; this section records what the pass itself changed |

### Re-verification

```
notes (authored):   37
wikilinks checked:  142
repo dirs scanned:  12
errors:             0
warnings:           0
```

Same script and same assertions as the other vaults in this batch: 0 broken wikilinks, 0
orphan notes, frontmatter parses, every `tags:` item quoted, `status:` and `health:` from
their closed sets, every `id:` a lowercase UUID used once, every repo directory documented or
excluded with a reason. Flint's own kernel scaffold (`Mesh/Main/`, `Mesh/Metadata/`,
`Shards/Flint/`, `Shards/Orbh/`) is excluded — it ships with the CLI.

### One deviation added by this pass

⚠️ **The task brief for this batch stated the supplied Flint names were already valid and
should be used exactly.** For this project that is **not true**: `flint init "GitPulse"` is
rejected, because mixed case is neither Title Case nor an all-caps acronym. The registry name
is `GITPULSE`; `project: "GitPulse"` in every note carries the real one. The same applies to
`GitHub 3D Visualizer` in the sibling vault. **The brief's name-validity claim should be
corrected at the hub** so the next batch does not re-probe it.


---

## Late correction — wikilinks were wrapped in backticks

⚠️ **Every wikilink in this vault was written as `` `[[(Type) Name]]` `` — inline code, not
a link.** Obsidian does not resolve a wikilink inside backticks, so the vault rendered with
**almost no working links at all**: a link check found **4** live links across the whole
vault, and every note except the Master Map was unreachable.

The house convention in the brief is *"Links are Obsidian wikilinks carrying the full
filename including the `(Type)` prefix, never aliased"*. Backticking them silently defeats
that.

**All backtick-wrapped wikilinks were unwrapped** (fenced code blocks left untouched). This
affected **all three vaults built in this batch**, so it was a convention error rather than a
one-off slip. Re-verified afterwards:

```
notes: 36
tag items: 203
links checked: 145
orphans (unreachable from Master Map): 0
errors: 0
```

**0 broken links · 0 orphans · 0 frontmatter errors.**
