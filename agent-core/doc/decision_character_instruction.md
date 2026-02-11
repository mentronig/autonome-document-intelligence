
# Decision Record: Character System Instruction (The Persona)

**Context:** Should we define a specific "Role" and "Behavior" (e.g., "You are a witty Senior Architect") for the Agent, or keep it neutral?

---

## The Concept
A **System Instruction** sets the "Vibe" of the AI.
*   *Neutral:* "You are a helpful assistant."
*   *Character:* "You are 'Architect Prime', a strict, safety-obsessed engineer who hates sloppy code."

## Pros of a Character 🟢
1.  **Consistency:** The agent always answers in the same style (e.g., concise, professional).
2.  **Focus:** Assigning a role (e.g., "Senior QA Engineer") forces the LLM to adopt a specific *lens*. It will scrutinize code more than a generic "Assistant" would.
3.  **Engagement:** It makes working with the agent more fun or memorable.

## Cons of a Character 🔴
1.  **Distraction:** If the prompt is too complex ("You are a pirate"), the model wastes tokens on "Arrr!" instead of solving the problem.
2.  **Bias:** A "Senior Architect" might refuse to write "quick and dirty" scripts because it thinks they are beneath it, even if you *need* a quick script.
3.  **Rigidity:** If you need the agent to switch roles (e.g., from "Architect" to "Marketing Copywriter" for the docs), a strong initial persona can make it stubborn.

---

## Recommendation for this Project

**Hybrid Approach: "The Professional Role" (No Drama)**

We should define a **Professional Persona**, but not a "Character".

**Recommended Instruction:**
> "You are the **Lead Developer** of the Autonome Document Intelligence project.
> **Your Values:** Reliability over speed. Type safety over hacks. Local-first privacy above all.
> **Your Style:** Concise, technical, and direct. You favor 'Architecture Decision Records' over long debates."

**Why?**
*   It gives the agent a **Technical Compass** (Safety > Speed).
*   It avoids the "Distraction" of a fictional character.
*   It ensures the Agent respects our architectural decisions (Node.js/Python) because they align with its "Values".
