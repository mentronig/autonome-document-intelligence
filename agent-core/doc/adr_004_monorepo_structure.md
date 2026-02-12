# Architecture Decision Record (ADR) 004: Monorepo Project Structure

**Status:** Accepted
**Date:** 2026-02-11
**Context:** Handover Phase 6 (Consolidation)

## 1. The Context

Initially, the project code was contained entirely within the `agent-core` folder, which also acted as the Git root.
However, as the project expands to include:

- Project-level documentation (Handover, Task lists).
- Integration tests that act _outside_ the core logic (`tests/`).
- Potential future components (e.g., a Web UI `frontend/`, Infrastructure-as-Code `infra/`).

The "Git inside `agent-core`" approach became limiting. Files like `task.md` or `generate_pdf.py` were becoming "orphans" outside version control.

## 2. The Decision

We moved the **Git Root** one level up, creating a **Monorepo-style** structure.

**Old Structure:**

```text
Autonome Document Intelligence/ (No Git)
└── agent-core/ (Git Root)
    ├── src/
    ├── doc/
    └── package.json
```

**New Structure:**

```text
Autonome Document Intelligence/ (Git Root)
├── agent-core/       # The "Brain" (Node.js/Python)
│   ├── src/
│   ├── doc/
│   └── package.json
├── tests/            # System-level Tests
│   ├── samples/      # Real PDF samples
│   └── integration/  # End-to-End tests
├── .gitignore        # Global ignore rules
└── task.md           # Global Project Management
```

## 3. Consequences

### Positive 🟢

- **Single Source of Truth:** The entire project state (including docs and test data) is versioned in one commit.
- **Safety:** No files are "forgotten" because they are one folder above the repo.
- **Extensibility:** We can add a `frontend` folder next to `agent-core` later without needing a separate repository (simplifying full-stack development).

### Negative 🔴

- **Nesting:** All commands for the agent logic must now be run inside `agent-core/` (e.g., `cd agent-core && npm start`).
- **History Rewrite:** The migration reset the Git history (simplification choice during Handover).

## 4. Compliance

- All developers must assume the root folder is the workspace root.
- CI/CD pipelines must `cd agent-core` before running build steps.
