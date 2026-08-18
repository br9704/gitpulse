---
id: 9aa04bcc-22af-4567-900d-8fe4985b86ab
title: "Master Map — GitPulse"
type: map
project: "GitPulse"
tags:
  - "#map"
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

# Master Map — GitPulse

The whole vault on one page. Up one level: [[(Guide) BRUNO HQ]].

```mermaid
flowchart TD
    SUM["(Report) Project Summary"]
    S00["00 Overview<br/>what it is · honest state"]
    S10["10 Architecture<br/>pipeline · windows · animation"]
    S20["20 Codebase Map<br/>src · tests"]
    S30["30 Setup and Run<br/>install · flags · CI"]
    S50["50 Decisions<br/>the scoping call and the rest"]
    S60["60 Roadmap<br/>owner-gated · stale branches"]
    S90["90 Reference<br/>scoring · CLI · git"]
    AUD["(Report) Folder Audit<br/>(Index) Complete File Inventory"]
    GAP["(Report) Gaps and Questions<br/>(Report) Build Log"]

    SUM --> S00 --> S10 --> S20 --> S30
    S10 --> S50
    S30 --> S60
    S20 --> S90
    SUM --> AUD
    SUM --> GAP
```

## The outline

- **00 Overview** — [[(Index) 00 Overview]]
  [[(Note) What GitPulse Is]] · [[(Note) Honest State]]
- **10 Architecture** — [[(Index) 10 Architecture]]
  [[(Note) The Pipeline]] · [[(Note) Windows and Labelling]]
- **20 Codebase Map** — [[(Index) 20 Codebase Map]]
  [[(Note) Source Map]] · [[(Note) Tests and CI]]
- **30 Setup & Run** — [[(Index) 30 Setup and Run]]
  [[(Note) Install and Develop]] · [[(Note) Publishing]]
- **50 Decisions** — [[(Index) 50 Decisions]]
  [[(Note) Key Decisions]]
- **60 Roadmap, Tasks & Ideas** — [[(Index) 60 Roadmap Tasks and Ideas]]
  [[(Note) Roadmap and Open Work]]
- **90 Reference** — [[(Index) 90 Reference]]
  [[(Note) The Scoring Model]] · [[(Note) CLI Surface]] · [[(Note) Git History]]

**Vault plumbing:** [[(System) Flint Init]] · [[(Report) Project Summary]] ·
[[(Report) Folder Audit]] · [[(Index) Complete File Inventory]] ·
[[(Report) Gaps & Questions]] · [[(Report) Build Log]] · [[(Index) Sources]] ·
[[(Index) Media]] · [[(Note) Exports]]

## Start here if you want to…

| Want to | Read |
|---|---|
| Know in one page what this is | [[(Report) Project Summary]] |
| Try it without installing anything | `npx @aethereumdev/gitpulse torvalds` · [[(Note) Install and Develop]] |
| Understand what makes it different from other terminal GitHub tools | [[(Note) Windows and Labelling]] |
| Read or change the score | ⚠️ [[(Note) The Scoring Model]] first |
| Know why the package is scoped | [[(Note) Key Decisions]] |
| Publish a new version | ⚠️ [[(Note) Publishing]] — read before running anything |
| Find which file does a thing | [[(Note) Source Map]] |
| Know what is unproven or unfinished | [[(Note) Honest State]] · [[(Report) Gaps & Questions]] |
| Add a flag or a renderer | [[(Note) CLI Surface]] · [[(Note) The Pipeline]] |
| See every file in the repo | [[(Index) Complete File Inventory]] |
