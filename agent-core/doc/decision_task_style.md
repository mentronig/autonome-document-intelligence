# Decision Record: Task Management Style

**Context:** We need to track work for Phase 2 (Enterprise Hardening).
**Options:**

1.  **Simple Tasks (Kanban-style)**
2.  **Agile User Stories (Scrum-style)**

---

## 1. Option A: Simple Tasks (The "Todo List")

_Format:_ `[ ] Implement Docker Container`

- **Pros:**
  - **Speed:** Extremely fast to write and read.
  - **Clarity:** Developers know _what to do_ immediately.
  - **Low Overhead:** No time wasted on "As a user, I want..." boilerplate.
- **Cons:**
  - **Context Loss:** "Implement Docker" doesn't say _why_ or for _whom_.
  - **Scope Creep:** Hard to define when the task is "Done" without acceptance criteria.

## 2. Option B: Agile User Stories

_Format:_ `As a System Admin, I want to deploy the agent via Docker so that I don't have to manage Python versions manually.`

- **Pros:**
  - **Value-Driven:** Focuses on the _benefit_ for the user.
  - **Acceptance Criteria:** Clearly defines "Done" (e.g., "Must run on Ubuntu without pre-installed Python").
- **Cons:**
  - **Verbosity:** Takes longer to write.
  - **Overkill:** For technical tasks (refactoring, IPC), the "User" is often just "The Developer", making the story feel artificial.

---

## 3. Recommendation for this Project

**My Choice: Enhanced Tasks (Hybrid)**

**Why?**
This is a **technical** project with a small team (User + Agent). We don't need the communicative overhead of full Scrum Stories. However, "Simple Tasks" are too vague for complex architecture changes.

**The "Enhanced Task" Format:**
We use a checklist item, but add a _brief_ rationale or success criteria if needed.

_Example:_
`- [ ] Implement Docker Container (Goal: Remove python version dependency)`

**Why this wins:**

1.  **Efficiency:** We keep the Markdown list format (`task.md`) which is super fast for an Agent to parse.
2.  **Focus:** We focus on the _technical action_ (which is what I execute) but keep the _goal_ visible.
3.  **Low Friction:** No need to migrate to Jira or change our working mode.

**Decision:** We will continue using `task.md` but break down the complex Phase 2 items into granular technical tasks.
