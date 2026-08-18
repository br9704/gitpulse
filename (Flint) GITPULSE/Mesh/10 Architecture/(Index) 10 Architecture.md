---
id: da708871-f5b2-4929-8a90-4482a0a8976a
title: "10 Architecture"
type: index
project: "GitPulse"
tags:
  - "#index"
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

# 10 Architecture

```mermaid
flowchart TD
    CLI["<b>src/index.ts</b><br/>commander entry, flags"]
    CACHE{"<b>src/api/cache.ts</b><br/>30-min TTL · 50 profiles"}
    FIX["<b>src/__fixtures__/demo-profile.ts</b><br/>captured snapshot"]
    API["<b>src/api/github.ts</b><br/>the only network surface"]
    E1["GET /users/:name"]
    E2["GET /users/:name/repos<br/>&le; 200, type=owner"]
    E3["GET /users/:name/events/public<br/>&le; 300, flaky-tolerant"]
    BUILD["<b>buildProfile()</b>"]
    SCORE["<b>src/utils/scoring.ts</b><br/>languages · activity window<br/>streak · patterns · score"]
    PROFILE[("UserProfile<br/>+ ContributionWindow")]
    UI["<b>src/ui/</b> — 9 renderers"]
    ANIM["<b>src/utils/anim.ts</b><br/>paint · reveal · after"]
    OUT["stdout"]

    CLI --> CACHE
    CLI -. "--demo" .-> FIX
    CACHE -- hit --> BUILD
    CACHE -- miss --> API
    API --> E1
    API --> E2
    API --> E3
    E1 --> BUILD
    E2 --> BUILD
    E3 --> BUILD
    FIX --> BUILD
    BUILD --> SCORE
    SCORE --> PROFILE
    PROFILE --> UI
    UI --> ANIM
    ANIM --> OUT
    PROFILE -. "--json · --export" .-> OUT
```

| Note | Covers |
|---|---|
| [[(Note) The Pipeline]] | the two structural decisions that make the diagram work |
| [[(Note) Windows and Labelling]] | the idea the whole tool is built on |

⚠️ **`src/api/github.ts` is the only network surface in the codebase.** Nothing else fetches.

Up: [[(Map) Master Map]]
