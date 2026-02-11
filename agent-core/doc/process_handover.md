
# Process: The Handover Protocol

**Goal:** Ensure zero Context Loss between agent sessions.

## 1. When is a Handover created/updated?
*   **End of Session:** ALWAYS. Before the user says "Goodbye" or closes the IDE, the active agent must update `HANDOVER.md`.
*   **Major Milestone:** After completing a Phase (e.g., "Phase 1 Complete").
*   **Critical Pivot:** If a major architectural decision changes (e.g., "We switched from Llama to Mistral").

## 2. Who creates the Handover?
*   **The Active Agent:** The AI currently working on the project. It is the only entity that knows *what just happened*.
*   **The User (Reviewer):** The user triggers the update ("Wrap up for today") and verifies the file.

## 3. What must be in it?
1.  **Current Persona:** Which role should the next agent take? (e.g., Developer vs. QA).
2.  **Next Immediate Action:** The very first command to run.
3.  **"Do Not Touch" List:** Decisions that are final.

## 4. The Command
To trigger this, the user simply says:
> "Prepare Handover."

The Agent then:
1.  Scans `task.md`.
2.  Summarizes recent ADRs.
3.  Updates `doc/HANDOVER.md`.
4.  Commits to Git.
