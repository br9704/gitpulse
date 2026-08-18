---
id: 98571949-2b7f-480c-8b86-efd0967a67e8
title: "Codebase map refresh"
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

# Shard — codebase-map-refresh

**Rebuild [[(Note) Source Map]] and [[(Note) Tests and CI]] from the repo as it stands.**

## Steps

1. **Safety first.**
   ```bash
   find /Users/brunojaamaa/Desktop/gitpulse -type f -flags +dataless | wc -l
   ```
   Must be `0`.

2. **Recount.**
   ```bash
   cd /Users/brunojaamaa/Desktop/gitpulse
   find src tools -type f \( -name '*.ts' -o -name '*.mjs' \) -exec wc -l {} \; | sort -rn
   ```
   ⚠️ Remember `src/__fixtures__/demo-profile.ts` is **1,512 lines of data, not logic**.
   Reporting it as source inflates the project by a third.

3. ⚠️ **Run the tests rather than reading a number.**
   ```bash
   npx vitest run --reporter=basic
   ```
   The current figure is **122 across 6 suites**. This project's own history contains
   "passing tests" that verified nothing, so a count read off a document is not evidence
   here.

4. **Re-read `package.json`.** Confirm the version, the `engines` floor (currently
   **>= 20**), the runtime dependency count (currently **3**), and that
   ⚠️ **`prepublishOnly` is still the only lifecycle script**. A new install-time script
   would break `npx` under npm v12 defaults.

5. **Re-grep the debt.** `grep -rn "TODO\|FIXME\|HACK\|XXX" src/ tools/` — baseline **0**.

6. **Check the renderer count.** [[(Note) Source Map]] says **9** in `src/ui/` plus
   `theme.ts`. Every renderer must have at least one test — coverage here is by surface, not
   by line, so a new untested renderer is a real gap.

7. **Update the notes**, editing facts rather than rewriting. Bump `updated:`.

8. **Regenerate [[(Index) Complete File Inventory]]** and diff.

9. **Log it** via `Shards/tools/obsidianlog.mjs` at the hub, op `note-update`.

## Rules

**Read-only in the repo.** ⚠️ **Never run `npm publish`** — this package is live at 1.0.0.
⚠️ **The branch is `master`.**
