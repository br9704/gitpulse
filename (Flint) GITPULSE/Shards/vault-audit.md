---
id: 4bca2621-3020-4339-a295-a83cdbd25f31
title: "Vault audit"
type: note
project: "GitPulse"
tags:
  - "#note"
  - "#shard"
  - "#ld/living"
  - "#cluster/personal"
status: active
created: "2026-08-17"
updated: "2026-08-17"
---

# Shard — vault-audit

**Rescan the repo, diff it against [[(Index) Complete File Inventory]], report the
difference.**

## 1. Hazard check

```bash
find /Users/brunojaamaa/Desktop/gitpulse -type f -flags +dataless | wc -l
```

Must be `0`. Reading a dataless file hangs **indefinitely**.

## 2. Rescan and diff

```bash
cd /Users/brunojaamaa/Desktop/gitpulse
find . -type f -not -path '*/node_modules/*' -not -path './.git/*' -not -path './dist/*' \
  -not -name '.DS_Store' -not -path './(Flint) GITPULSE/*' \
  | sed 's|^\./||' | sort > /tmp/now.txt
```

Diff against the inventory's path column. **Every folder on disk must appear as a row or be
named as excluded with a reason.**

## 3. Verify the vault itself

Assert programmatically:

- **0** broken wikilinks
- **0** orphan notes
- all frontmatter parses as YAML, and **every `tags:` list item is quoted**
- `status:` ∈ `active | dormant | shipped | archived`
- `health:` in [[(Report) Project Summary]] ∈ `green | amber | red`
- every `id:` is a lowercase UUID, used once

The hub also ships `Shards/tools/lint-frontmatter.mjs` — run it with `--all`.

## 4. Re-run the tests, do not read the number

```bash
npx vitest run --reporter=basic
```

Currently **122 passing across 6 suites**. ⚠️ This project's history contains a test file that
asserted an inline expression and imported **no product code**, so two of the then-33
"passing tests" verified nothing. **A count read off a document is not evidence here.**

## 5. Re-check the public claim

```bash
gh repo view br9704/gitpulse --json homepageUrl,description
grep '"version"' /Users/brunojaamaa/Desktop/gitpulse/package.json
```

Then fetch `https://brunojaamaa.dev/projects/gitpulse` and compare against `package.json`,
`SCORING.md` and `src/api/github.ts`. Specifically check:

- ⚠️ **the install line names `@aethereumdev/gitpulse`**, never bare `gitpulse` — that is a
  different, abandoned package
- the runtime dependency count still matches (**3**)
- the endpoint count still matches (**3**)
- any quoted score still carries its window caveat

## 6. Check `SCORING.md` against `src/utils/scoring.ts`

⚠️ **These two have diverged once already**, and the correction was material — the star
sub-item caps at **40**, not the ~215 the first draft claimed. Re-check the caps rather than
trusting the document. This is the single highest-value check in this shard.

## 7. Check housekeeping

```bash
git branch -a
```

Currently **six stale local branches** plus `origin/feat/publish-readiness`. A growing list is
drift.

## 8. Re-check the hub note

`/Users/brunojaamaa/Desktop/Main Vault/Main/Mesh/Notes/Projects/(Note) GitPulse.md` carries
**six material errors** as of 2026-08-17, the largest being that it does not know the package
is published. When they are fixed, strike them from [[(Report) Gaps & Questions]] rather
than leaving permanent noise.

## 9. Report

Write results into [[(Report) Build Log]] with a date, and log a `verify` op.

⚠️ **Never run `npm publish`** at any point in this shard.
