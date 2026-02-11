
# Decision Record: Context Preservation ("The Chat Mindset")

**Context:** When starting a new chat session, the agent loses its "Short Term Memory" (conversation history). We need to transfer the "Mindset" (Project Status, Decisions, Philosophy) to the next agent.

---

## Proposal 1: "Strict Git Ops" (The Passive Way)
*Concept:* We rely 100% on the existing documentation (`task.md`, `ADRs`, `README`).
*Workflow:* The new agent scans the file system, reads `task.md`, and figures it out.
*   **Pros:**
    *   Zero extra effort (we already did the docs).
    *   Single Source of Truth (The Repo).
*   **Cons:**
    *   **Cold Start:** The agent misses the "Nuance" (e.g., "We just decided to pivot to Docker, but haven't started yet").
    *   **Risk:** The agent might re-challenge decisions we just settled (like Node vs Python).

## Proposal 2: "The Handover File" (The Active Way)
*Concept:* We create a dedicated file `doc/HANDOVER.md` (or `MINDSET.md`).
*Content:* A concise summary specifically for the *next* Agent. "Hello, we are in Phase 5. We just decided X. Do NOT change Y. Your next task is Z."
*Workflow:* New Agent is told: "Read `doc/HANDOVER.md` first."
*   **Pros:**
    *   **Direction:** Gives the agent immediate focus.
    *   **Tone:** Can transmit the "Philosophy" (e.g., "We are strict outcome-focused").
    *   **Persistenc:** Lives in Git, so it survives even if you switch PCs.
*   **Cons:**
    *   Must be updated manually before ending a session (otherwise it's outdated).

## Proposal 3: "The Meta-Prompt" (The Copy-Paste Way)
*Concept:* I generate a text block *now*. You copy it. You paste it into the new chat prompt.
*Workflow:* "Hi, I am continuing project X. Here is the summary: [Paste Block]."
*   **Pros:**
    *   **Flexible:** You can edit it before pasting.
    *   **Immediate:** The agent knows context *before* it even looks at files.
*   **Cons:**
    *   **User Burden:** You have to manage/save this text.
    *   **Not Versioned:** If you lose the text, the context is gone.

---

## Recommendation & Winner

**Winner: Proposal 2 ("The Handover File")**

**Why:**
1.  **Automation:** It lives in the code (`doc/HANDOVER.md`). You don't need to carry text snippets around.
2.  **Scalability:** As the project grows, the "Prompt" (Prop 3) becomes too long. A file can be as long as needed.
3.  **Safety:** It prevents the "Amnesia" of Proposal 1. Explicitly telling the next agent "We agreed on Node.js, don't argue" saves tokens and time.

**Next Step:** I can create this `doc/HANDOVER.md` right now with our current state.
