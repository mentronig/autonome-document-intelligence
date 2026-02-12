# Architecture Decision Record (ADR) 002: Critical Risk Analysis

**Date:** 2026-02-11
**Refers to:** ADR 001 (Node.js/Python Hybrid)

## Challenge

The user challenged the architecture reliability. We identified the **Three Weakest Logical Points** where the system is most likely to fail.

---

## Weakness 1: The "Dual Runtime" Friction

**Description:** The user must maintain _two_ distinct runtime environments (Node.js + Python) and keep them synchronized.
**Why it fails:**

- **Version Mismatch:** User updates Python to 3.13, but `pdfplumber` relies on 3.12. Script fails.
- **Path Issues:** `python` command works in one terminal (Anaconda) but not in another (PowerShell).
- **Support Nightmare:** "It works on my machine" becomes "It works on my Node version AND my Python version".
  **Probability:** HIGH (during setup).
  **Mitigation:** Docker containerization (Phase 6) would eliminate this, but breaks "Local First" simplicity for non-technical users.

---

## Weakness 2: The "Fragile Bridge" (IPC via Stdout)

**Description:** Node.js calls Python via `spawn` and reads `stdout` text output to get the JSON result.
**Why it fails:**

- **Pollution:** If a Python library updates and starts printing `DeprecationWarning` or debug info to `stdout`, Node.js will try to parse that warning as JSON.
- **Result:** `SyntaxError: Unexpected token D in JSON at position 0`. The agent crashes.
- **Encoding:** Special characters (Emoji, Umlauts) in PDFs might break the UTF-8 buffer piping if not strictly handled.
  **Probability:** MEDIUM (increases over time/updates).
  **Mitigation:** Use a strict IPC channel (ZeroMQ, gRPC) or file-based exchange instead of `stdout`.

---

## Weakness 3: The "Lobotomized Evolution" (Local Brain Limit)

**Description:** The "Evolution" capability (Agent rewriting its own code) relies on the _intelligence_ of the local LLM (`llama3:8b`).
**Why it fails:**

- **Context Limit:** The agent sends failing code + error. Small models hallucinate fixes.
- **The "Suicide" Loop:** A dumb model proposes a "fix" that looks syntactic but breaks the logic. The agent applies it, restarts, crashes again. The "Self-Healing" becomes a "Self-Destruct" cycle.
- **No Rollback:** Without a Git-based auto-revert (Phase 6), a bad evolution permanently bricks the local installation.
  **Probability:** HIGH (in Mad Dog mode).
  **Mitigation:** Strict "Sandboxing" (run tests before applying) and mandatory human review (which defeats the point of full autonomy).

---

## Conclusion

The architecture trades **Setup Simplicity** (for Pure Python) and **Robustness** (vs. Stdout Bridge) for **Developer Experience** (TypeScript) and **WebReadiness**.
These 3 risks are the price we pay.
