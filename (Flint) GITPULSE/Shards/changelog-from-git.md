---
id: ac3843ed-1d5b-46ed-b268-8726f8b14e14
title: "Changelog from git"
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

# Shard — changelog-from-git

**Rebuild [[(Note) Git History]] from the repository log.**

## ⚠️ The branch is `master`, not `main`

Every command below says so explicitly. **Do not copy a `main`-based script from the other
two projects in this cluster** — it will silently produce wrong or empty output.

## Read-only git only

`log` · `show` · `status` · `branch` · `diff`. **Never** commit, push, stash, checkout, clean,
reset, or `gh repo` anything.

## Steps

```bash
cd /Users/brunojaamaa/Desktop/gitpulse
git branch -a
git status --short
git log -30 --pretty='%h|%ad|%s' --date=short
git log --oneline | wc -l
git log origin/master..HEAD --oneline | wc -l     # ← master, not main
git log --format='%an' | sort | uniq -c | sort -rn
```

That last command should return **22 Bruno Jaamaa** and nothing else. ⚠️ **If a bot author
appears, that is news** — this repo has never had one, and it is the reason it needs no
authorship rewrite.

## Also track the branch count

[[(Note) Git History]] currently lists **six stale local branches**, all merged, one of them
also on the remote as `origin/feat/publish-readiness`. Report the current set. **A shrinking
list is progress; a growing one is drift.**

## Also reconcile the published version

```bash
grep '"version"' package.json
```

Currently **1.0.0**. ⚠️ If it has moved, check whether trusted publishing (OIDC) was in effect
for the new release — that is the open Sprint 7 item, and a release without it carries no
provenance attestation.

## Then

Bump `updated:` on [[(Note) Git History]] and [[(Report) Project Summary]]
(`last_commit:`), and log a `note-update` op.
