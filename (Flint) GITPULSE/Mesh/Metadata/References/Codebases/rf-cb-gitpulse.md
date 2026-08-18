---
name: "GITPULSE"
---

# GITPULSE

A **codebase reference** — a pointer to a codebase that lives outside this Flint. The actual filesystem path is recorded per-machine in `.flint/references.json` (gitignored).

- Resolve to absolute path: `flint resolve codebase GITPULSE`
  - Git repositories include a live `Worktrees:` block from `git worktree list`.
- Fulfill (first time on a new machine): `flint fulfill codebase GITPULSE <path>`
- Manage git worktrees: `flint worktree list GITPULSE`, `flint worktree add GITPULSE <suffix>`, `flint worktree remove GITPULSE <branch|suffix>`
- Worktree branches use `<machine-name>-wt-<suffix>`, checked out at the sibling folder `<repo>-wt-<suffix>`; configure the prefix with `flint config machine-name <name>`.
