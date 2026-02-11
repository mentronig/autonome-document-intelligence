
# Architecture Decision Record (ADR) 001: Hybrid Node.js/Python vs. Pure Python

**Status:** Accepted
**Date:** 2026-02-09
**Author:** Antigravity Agent

## 1. The Context
We built an autonomous agent to analyze T2 Release Notes (PDFs) using local LLMs (Ollama).
We successfully implemented a **Hybrid Architecture**:
*   **Orchestrator:** Node.js (TypeScript)
*   **Ingestion:** Python (`pdfplumber`) as a subprocess

The client asked: *"Why not Pure Python?"*

## 2. Critical Analysis of "Pure Python"

### Advantages of Pure Python 🟢
1.  **Simplicity:** Only one runtime environment to manage.
2.  **Native Libraries:** Python is the native language of AI (`langchain`, `pytorch`, `pdfplumber`). No subprocess calls needed.
3.  **Deployment:** Tools like `PyInstaller` or `Docker` make packaging a single-binary Python app relatively easy.
4.  **Data Flow:** No overhead from serializing data to JSON to pass between Node.js and Python.

### Disadvantages of Pure Python 🔴
1.  **Concurrency Model:** Python's Global Interpreter Lock (GIL) can make true parallelism tricky (though `asyncio` helps for I/O).
2.  **Type Safety:** While Type Hints exist, TypeScript offers a more robust, compile-time type system which is crucial for complex agentic state machines (Reflexion Loops).
3.  **UI Integration:** If we build a web frontend later (React/Next.js), Node.js shares the same language (JS/TS), allowing code sharing (types, validation logic) between frontend and backend.

## 3. Why we chose Node.js (TypeScript) as Orchestrator

We prioritized **Agentic Reliability** and **Future-Proofing** over initial setup simplicity.

### Reason 1: The "Event Loop" & Asynchrony
Agents are inherently asynchronous. They wait for LLMs, wait for vector DBs, wait for user input. Node.js's event loop is industry-standard for managing these low-latency, high-concurrency flows without complex threading logic.

### Reason 2: Strict State Management (TypeScript)
An autonomous agent is a complex State Machine.
*   *State:* "Did I succeed? What was the error? What is my history?"
TypeScript's structural typing ensures that valid data flows through the "Reflexion Loop". In Python, it is easier to accidentally pass a dict with missing keys, leading to runtime crashes deep in a loop. TypeScript catches this at compile time.

### Reason 3: The "Sandwich" Pattern (Best of Both Worlds)
We used the "Sandwich" pattern:
*   **Top (Logic):** TypeScript (Clean, safe business logic).
*   **Middle (AI/Data):** Python (Powerful libraries).
*   **Bottom (Systems):** Docker/Ollama.

By calling Python *only* for what it does best (PDF parsing), we avoid Python's slower execution for general logic loops and gain Node.js's speed for the "glue code".

## 4. The Specific Trade-off in this Project

**We accepted:**
*   Increased installation complexity (Need Node AND Python).
*   Slight performance cost (spawning a Python process).

**To gain:**
*   A rock-solid, typed loop for the agent's logic.
*   Better ecosystem for adding a real-time Web UI in Phase 2.
*   Easier asynchronous orchestration of multiple LLM calls.

## Conclusion
For a simple *script*, Pure Python is better.
For a robust *Agent* that will evolve into a web platform, **Node.js (Logic) + Python (Tools)** is the superior architectural choice.
