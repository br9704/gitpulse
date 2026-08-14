# How the hire-ability score is calculated

gitpulse prints a 0–100 score with a letter grade for any GitHub profile. This document
specifies every input and every weight, because **an undocumented number about a real person is
not a feature — it is an assertion nobody can check.**

Everything here is transcribed from [`src/utils/scoring.ts`](src/utils/scoring.ts). If this
document and that file ever disagree, the file is correct and this is a bug.

---

## Read this first: what the score does not measure

The score is computed **entirely from public GitHub metadata**. It never reads a line of anyone's
code. That means it cannot see, and does not measure:

- whether the code is any good
- private, internal, or client work — which for most working engineers is most of their work
- contributions made under another account, or before this account existed
- code review, mentoring, design, incident response, or writing
- anything at all about the person

It rewards a particular *style* of public presence: repositories with descriptions, topics and
licences, spread across several languages, pushed to recently. Those are real signals of care, and
they are also easy to game deliberately and easy to fail accidentally. A staff engineer whose
entire output is private will score badly. That is a limit of the data, not a finding about them.

**Two further limits worth stating plainly:**

1. **The activity half of the score sees a narrow window.** Consistency and Recent Activity are
   derived from the public Events API, which returns at most 300 events and reaches back a limited
   period — often far less than 90 days for an active account. gitpulse prints the true window it
   measured (`last N days of public code events`). Activity older than that window is *invisible to
   the tool*, not absent from the person's life.
2. **"Languages" means repository counts, not lines of code.** Each non-fork repository contributes
   1 to its GitHub-assigned primary language. A 300,000-line C project and a one-file C script count
   the same.

Treat the output as a description of a public profile's shape. It is not an evaluation of an
engineer, and it should never be the reason anyone does or does not get an interview.

---

## The five components

The total is the sum of five components, rounded to the nearest integer. Maximums sum to 100.

| Component | Max | Share |
|---|---:|---:|
| Repo Quality | 25 | 25% |
| Consistency | 20 | 20% |
| Language Diversity | 15 | 15% |
| README Quality | 15 | 15% |
| Recent Activity | 25 | 25% |
| **Total** | **100** | |

Every component is clamped to its maximum, and each sub-item is clamped independently, so no single
input can dominate. Forked repositories are excluded from every repository-based calculation.

### Repo Quality — 25 points

| Sub-item | Max | Formula |
|---|---:|---|
| Stars | 8 | `min(8, log₂(totalStars + 1) × 1.5)` |
| Forks received | 4 | `min(4, log₂(totalForks + 1) × 1.2)` |
| Descriptions present | 4 | `(repos with a description > 10 chars ÷ repos) × 4` |
| Topics used | 4 | `(repos with ≥ 1 topic ÷ repos) × 4` |
| Licences | 5 | `(repos with a licence ÷ repos) × 5` |

Stars and forks are **logarithmic**, deliberately: a linear scale would turn the score into a
popularity contest, and the first star should be worth more than the thousandth.

In practice the log scale matters less than it looks, because both sub-items saturate early:

| Stars | Points |
|---:|---:|
| 0 | 0 |
| 10 | 5.19 |
| 40 | 8.00 — capped |
| 1,000 | 8.00 — capped |
| 250,000 | 8.00 — capped |

**Above 40 stars this sub-item stops discriminating entirely** (forks cap at 10). A project with
250,000 stars and one with 40 score identically. That is a defensible choice — it stops one viral
repository from carrying an entire profile — but it means the score should never be read as a
measure of reach or impact.

Special cases: no repositories at all scores **0**. Repositories that are *all* forks score **2**.

### Consistency — 20 points

| Sub-item | Max | Formula |
|---|---:|---|
| Current streak | 8 | `min(8, currentStreak × 0.5)` — caps at 16 days |
| Longest streak | 6 | `min(6, longestStreak × 0.3)` — caps at 20 days |
| Event frequency | 6 | `min(6, eventsInLast90Days × 0.1)` — caps at 60 events |

Streaks are measured **within the event window described above**, so they are not lifetime records.
gitpulse says so on screen next to the number.

### Language Diversity — 15 points

| Sub-item | Max | Formula |
|---|---:|---|
| Number of languages | 8 | `min(8, languageCount × 1.2)` — caps at 7 languages |
| Balance | 7 | `(Shannon entropy ÷ log₂(languageCount)) × 7` |

The balance term is normalised Shannon entropy over the distribution of repositories across
languages. Someone with five languages split evenly scores near the full 7; someone with five
languages where 95% of repos are one language scores close to 0.

This component is the most arguable in the whole score. Deep specialisation in one language is a
perfectly good career, and it scores poorly here. That is a value judgement baked into the metric,
and naming it is the point of this document.

### README Quality — 15 points

**This component does not read READMEs.** GitHub's repository list endpoint does not return README
contents, and fetching one per repository would cost a request each. It uses four proxies:

| Sub-item | Max | Formula |
|---|---:|---|
| Substantial descriptions | 6 | `(repos with a description > 20 chars ÷ repos) × 6` |
| GitHub Pages | 3 | `min(3, reposWithPages × 1.5)` — caps at 2 repos |
| Wiki enabled | 3 | `(repos with a wiki ÷ repos) × 3` |
| Repository size | 3 | `(repos larger than 50 KB ÷ repos) × 3` |

The name overstates what is measured; "documentation signals" would be more accurate. Note that
GitHub enables wikis by default, so that sub-item largely measures *not having turned them off*.

Special cases: no repositories scores **0**; all-forks scores **2**.

### Recent Activity — 25 points

| Sub-item | Max | Formula |
|---|---:|---|
| Pushes in the last 30 days | 10 | `min(10, recentPushEvents × 0.8)` — caps at 13 pushes |
| Repos pushed in the last 90 days | 8 | `min(8, recentlyUpdatedRepos × 0.8)` — caps at 10 repos |
| Variety of event types | 7 | `min(7, distinctEventTypes × 1.5)` — caps at 5 types |

Bounded by the same event window as Consistency. An account with an empty public event feed scores
0 here regardless of how much work happened.

---

## Grade boundaries

| Grade | Score |
|---|---|
| A+ | 95–100 |
| A | 88–94 |
| A- | 82–87 |
| B+ | 76–81 |
| B | 70–75 |
| B- | 64–69 |
| C+ | 56–63 |
| C | 48–55 |
| C- | 40–47 |
| D | 30–39 |
| F | 0–29 |

---

## Worked example

`gitpulse --demo` renders a real captured snapshot of `torvalds` (captured 2026-08-14) and scores
**78 (B+)**. You can reproduce every number below with `gitpulse --demo --json`.

| Component | Score | Why |
|---|---:|---|
| Repo Quality | 20.4 / 25 | Enormous star and fork counts hit both log caps; not every repo carries topics or a licence |
| Consistency | 20 / 20 | Pushed on every day of the measured window |
| Language Diversity | 5.9 / 15 | Two languages, heavily skewed to C — the component penalising specialisation |
| README Quality | 11.8 / 15 | Good descriptions; few Pages sites |
| Recent Activity | 20.2 / 25 | Frequent pushes, limited variety of event types |
| **Total** | **78 (B+)** | |

The person who wrote Linux and Git scores 78 out of 100. Read that as a statement about the
metric's limits, not about him — it is the clearest possible demonstration of everything in the
"what this does not measure" section above.
