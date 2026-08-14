# RESEARCH-CONTEXT.md — GITPULSE
# Measured audit + external research. Read before the engineer prompt's Phase 1.

**Audited:** August 2026, from a clean clone of `github.com/br9704/gitpulse`. Every claim below was produced by running the command shown.

---

## 0. RUNTIME VERDICT — read this first

Unlike the other two repos, this one **does work and the output genuinely looks good.** Rendered with a fixture profile, the report card produces: a clean ASCII wordmark, a profile block, an aligned two-column stats grid, proportional language bars, a real 7-row contribution heatmap in `░▒▓█`, day/hour commit sparklines with a computed peak ("Peak: Wednesdays at 17:00 UTC"), and a ranked repo list. It is the one piece of Bruno's unpublished work that looks finished because it *is* finished.

**But there is a serious UX blocker that makes it look broken to anyone who tries it:**

```
$ gitpulse torvalds
- Scanning torvalds's GitHub profile...
× Failed to fetch profile for torvalds
  ✖ Error: GitHub API rate limit exceeded. Resets at 8:00:44 AM.
```

**The default no-token invocation — the exact command in the README — fails.** Unauthenticated GitHub is 60 req/hr per IP and is frequently already exhausted. The error handling is graceful and the message is clear, but a first-time user runs the documented command, gets an error, and concludes the tool is broken. *This is almost certainly why it feels unfinished.*

**Fixes, in order:**
1. **Onboard the token in the failure path.** Don't just say "use `--token`" — print the exact URL to create a PAT, the scopes needed (none, for public data), and how to persist it (`GITHUB_TOKEN` env var).
2. **Read `GITHUB_TOKEN` / `GH_TOKEN` from the environment automatically.** Most developers already have one exported; currently only the `--token` flag is honoured.
3. **Lead the README with the token step**, not as a footnote.
4. Ship a `--demo` flag rendering a fixture profile, so anyone can see the output instantly with zero setup. This doubles as the screenshot source.

**Two small real bugs found while rendering:**
- The heatmap header prints **"Last 90 days:"** but renders every day it's given (180 in the fixture) and then reports "171 active days" — the label and the data disagree. Fix the label or slice the input.
- Language lines read `82.0% (82 repos)` — correct when the value is a repo count, but the wording is ambiguous. "82 repos" vs "82% of code" is a meaningful difference to a reader; state which it is.

---

## 1. Measured state

| Check | Command | Result |
|---|---|---|
| Install | `npm install --no-audit --no-fund` | clean, 245 packages, ~5s |
| Build | `npm run build` (tsc) | **exit 0, zero errors** |
| Tests | `npm test` (vitest) | **33/33 passing**, 3 files, 1.10s |
| Lint | `npm run lint` | 3 errors, 14 warnings — *all 3 errors are the same false positive* |
| Runtime | `node dist/index.js --help` | renders correctly |
| Runtime | `node dist/index.js torvalds` | hit unauthenticated rate limit, **failed gracefully** with clear message + reset time |

**Size:** 2,010 LOC / 19 files. **Stack:** TypeScript 5.3 (strict, ESM, `tsc`→`dist/`), commander 12.1, chalk 5.3, boxen 7.1, ora 8.0, node-fetch 3.3, vitest 1.2, eslint 8.56. Node ≥18.

**Completeness:** zero TODO/FIXME/placeholder markers in `src/`. No empty or stub files. All UI modules implemented (`src/ui/{header,stats,languages,repos,heatmap,score,compare,minimal,export}.ts`). Real 30-min TTL cache with 50-profile eviction at `src/api/cache.ts`.

### The 3 lint errors — one cause
```
src/utils/formatting.ts  66:32  error  Unexpected control character(s) in regular expression: \x1b  no-control-regex
src/utils/formatting.ts  91:33  error  Unexpected control character(s) in regular expression: \x1b  no-control-regex
src/ui/stats.ts          63:35  error  Unexpected control character(s) in regular expression: \x1b  no-control-regex
```
These are **ANSI-stripping regexes** — correct code, wrong rule. Fix: disable `no-control-regex` in `.eslintrc.json`. Do not rewrite the regexes.

### Git history
**4 commits total** (not truncated — this is the whole history). Last: **2026-03-13**, authored by **Bruno Jaamaa `<jaamaabruno@gmail.com>`**. *This is the only one of the three GitHub repos with genuine human authorship* — a meaningful advantage over collab-dashboard ("Subagent") and github-3d-visualizer ("OpenClaw Bot"). Messages are conventional-commit and descriptive (e.g. `feat: clean JSON output - strip raw API noise from --json flag`). Shape is few-large-commits rather than incremental; fine.

---

## 2. Publish readiness

**`gitpulse` is available on npm** — the registry returns 404 for that name. Verify again immediately before publishing; names get taken.

Present and correct in `package.json`: `bin`, `files`, `main`, `prepublishOnly`, `engines`. MIT LICENSE present.

**Missing:** `repository`, `homepage`, `bugs`. Without these the npm page has no link back to the source — a trust signal for a CLI.

**Broken until publish:** README badges (`npm version`, `npm/l`) point at a package that doesn't exist and will render as broken images.

**No CI** — no `.github/workflows/`. No automated test-on-push, no publish-on-tag.

---

## 3. External research — npm publishing changed materially in 2025–26

Most published guides are stale. Verified as of Aug 2026:

- **Classic npm tokens were permanently revoked (Dec 9, 2025)** following the Shai-Hulud worm (Sept 2025 first wave; "Shai-Hulud 2.0" Nov 2025 compromised ~25,000 repos / ~350 users, harvesting `.npmrc` tokens and GitHub PATs via preinstall scripts). Local publishing now uses short-lived 2-hour session tokens.
- **Trusted Publishing (OIDC) is the recommended path.** Supported on GitHub-hosted runners (not self-hosted), GitLab shared runners, CircleCI cloud. Requires **npm ≥ 11.5.1** and **Node ≥ 22.14.0**; workflow needs `permissions: id-token: write`. Bypasses the token restrictions entirely.
- **Provenance attestations generate automatically** under trusted publishing for public repos + public packages (Sigstore-backed, shows a provenance badge on npmjs.com). For any tool asking users to trust it, this is table stakes.
- **2FA:** publishing effectively requires OIDC or 2FA-enforced local publish. TOTP is being phased out in favour of **FIDO/WebAuthn**. Enrol a hardware key or passkey on the account. *(Owner action — Bruno's, not the agent's.)*
- **npm v12 breaking change — lifecycle scripts OFF by default.** `npm install` will not run dependency `preinstall`/`install`/`postinstall` without explicit approval. **Implication: ship a plain `bin` entry with no postinstall step, or `npx gitpulse` breaks for users on v12 defaults.** gitpulse currently has no postinstall — keep it that way.
- `npx` still prompts before installing a not-yet-cached package unless `-y`/`--yes`. Mention the first-run prompt in the README so it isn't mistaken for a hang.

---

## 4. The three highest-leverage gaps

1. **Publish it.** The name is free, the package is ready, the tests pass. Add `repository`/`homepage`/`bugs`, set up OIDC CI, `npm publish`. This converts a private repo into something strangers can `npx` — the single biggest value jump available in Bruno's portfolio for the least work.
2. **A recorded terminal demo.** This is a *visual* CLI whose entire value is what the output looks like, and the README currently shows only a static ASCII code block. A ~15s asciinema recording or GIF at the top is the highest-conversion single addition to the repo.
3. **Green CI + fix the 3 lint errors + test the product surface.** Current tests cover scoring, formatting, and cache. Untested: `src/api/github.ts` and every `src/ui/*` renderer — i.e. the rendered output, i.e. the actual product. Fixture-based snapshot tests of rendered output would close this cheaply.

---

## 5. Open question flagged for Bruno: the hire-ability score

The CLI computes a **0–100 "hire-ability score"** for an arbitrary GitHub profile. Two risks:
- **Methodology.** If the weights aren't documented, it's an unexplained number about a real person. That's the same credibility failure the portfolio copy audit targets elsewhere.
- **Tone.** Scoring strangers' employability can read as charming or presumptuous depending entirely on framing.

Recommendation: either publish a `SCORING.md` documenting every input and weight openly (which turns it into a defensible, interesting feature), or reframe it as something softer. Do not ship an undocumented score.
