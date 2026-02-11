
# Decision Record: Task Management Style

**Context:** We need to track work for Phase 2 (Enterprise Hardening).
**Options:**
1.  **Simple Tasks (Kanban-style)**
2.  **Agile User Stories (Scrum-style)**

---

## 1. Option A: Simple Tasks (The "Todo List")
*Format:* `[ ] Implement Docker Container`
*   **Pros:**
    *   **Speed:** Extremely fast to write and read.
    *   **Clarity:** Developers know *what to do* immediately.
    *   **Low Overhead:** No time wasted on "As a user, I want..." boilerplate.
*   **Cons:**
    *   **Context Loss:** "Implement Docker" doesn't say *why* or for *whom*.
    *   **Scope Creep:** Hard to define when the task is "Done" without acceptance criteria.

## 2. Option B: Agile User Stories
*Format:* `As a System Admin, I want to deploy the agent via Docker so that I don't have to manage Python versions manually.`
*   **Pros:**
    *   **Value-Driven:** Focuses on the *benefit* for the user.
    *   **Acceptance Criteria:** Clearly defines "Done" (e.g., "Must run on Ubuntu without pre-installed Python").
*   **Cons:**
    *   **Verbosity:** Takes longer to write.
    *   **Overkill:** For technical tasks (refactoring, IPC), the "User" is often just "The Developer", making the story feel artificial.

---

## 3. Recommendation for this Project

**My Choice: Enhanced Tasks (Hybrid)**

**Why?**
This is a **technical** project with a small team (User + Agent). We don't need the communicative overhead of full Scrum Stories. However, "Simple Tasks" are too vague for complex architecture changes.

**The "Enhanced Task" Format:**
We use a checklist item, but add a *brief* rationale or success criteria if needed.

*Example:*
`- [ ] Implement Docker Container (Goal: Remove python version dependency)`

**Why this wins:**
1.  **Efficiency:** We keep the Markdown list format (`task.md`) which is super fast for an Agent to parse.
2.  **Focus:** We focus on the *technical action* (which is what I execute) but keep the *goal* visible.
3.  **Low Friction:** No need to migrate to Jira or change our working mode.

**Decision:** We will continue using `task.md` but break down the complex Phase 2 items into granular technical tasks.
