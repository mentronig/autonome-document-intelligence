# Implementation Plan: Phase 9 - The Engine Upgrade 🛠️

**Goal:** Transform the "Technical Prototype" into a robust, scalable engine capable of handling real-world documents.

## 1. Smart Chunking (Scaling Strategy) 📏

**Problem:** The current agent truncates text at 8,000 characters. Large documents (50+ pages) are mostly ignored.
**Solution:** Implement a "Rolling Window" or "Pagination" strategy.

### Implementation Details:

1.  **Remove the Limit:** Delete `.slice(0, 8000)` in `agent-core.ts`.
2.  **Chunking Logic:**
    - Since `pdf-parser.py` returns the full text, we need to split it in Node.js.
    - **Approach:** Split by `pages` (if structure allows) or purely by character count (e.g., 4000 chars) with overlap (e.g., 500 chars).
    - **Preferred Approach:** Split by meaningful delimiters (paragraphs) or pages to preserve context. We'll start with **Page-based Chunking** if `pdfplumber` metadata supports it, otherwise **Character-based with Overlap**.
3.  **Aggregation:**
    - `AgentCore` iterates over chunks.
    - Each chunk produces an `AnalysisResult` (PBIs, CRs).
    - **Merge Strategy:**
      - Start with an empty result.
      - Concat all `pbis` and `crs`.
      - Deduplicate PBIs by ID (if possible) or Description similarity.
      - Summarize the summaries (meta-summary).

### New Artifacts:

- `agent-core/doc/adr_006_chunking_strategy.md`: Document the technical decision (Chunk Size, Overlap, Merge Logic).

## 2. Resilience (Robustness) 🛡️

**Problem:** If Ollama is offline or times out, the agent crashes ungracefully.
**Solution:** Add Retry Logic and "Circuit Breaker" behavior.

### Implementation Details:

1.  **Retry Loop:** In `OllamaClient.generateCompletion()`:
    - Wrap the fetch call in a loop (Max 3 attempts).
    - Exponential Backoff: Wait 1s, 2s, 4s between retries.
2.  **Graceful Failure:**
    - If all retries fail, do `console.warn` instead of throwing a hard error (where appropriate).
    - Return a fallback or partial result so the user at least gets _something_.

## 3. Structured Logging (Debuggability) 📝

**Problem:** `console.log` makes it hard to distinguish between normal operations, warnings, and critical errors.
**Solution:** Implement a simple `Logger` class.

### Implementation Details:

1.  **Logger Class (`agent-core/src/infrastructure/logger.ts`):**
    - Levels: `INFO`, `WARN`, `ERROR`, `DEBUG`.
    - Format: `[TIMESTAMP] [LEVEL] [CONTEXT] Message`.
2.  **Refactoring:**
    - Replace `console.log('-> ...')` with `Logger.info(...)`.
    - Replace `console.error(...)` with `Logger.error(...)`.

---

## Execution Checklist

For each sub-task in `task.md`, follow this cycle:

1.  **Draft:** Update code.
2.  **Verify:** Run tests (or manual run with `npm start`).
3.  **Commit:** via Husky/Git.
