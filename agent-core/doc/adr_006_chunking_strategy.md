# Architecture Decision Record (ADR) 006: Smart Chunking Strategy for Large PDFs

**Status:** Accepted
**Date:** 2026-02-12
**Author:** Antigravity Agent (Admin & Mentor Persona)

## 1. The Context

Our "Autonomous Document Intelligence" agent currently has a critical limitation: it truncates the input text at 8,000 characters (approx. 2-3 pages). This makes it unusable for real-world documents like 50-page Technical Release Notes or large contracts.

The goal is to enable the analysis of documents of arbitrary length while maintaining the quality of the reasoning process.

## 2. The Options

We considered three approaches:

### Option A: Recursive Summarization (Map-Reduce)

1.  Split document into chunks.
2.  Summarize each chunk.
3.  Summarize the summaries.

- **Pros:** Good for "Gist" or general understanding.
- **Cons:** Loss of detail. Specific PBIs (Production Problems) or CR-IDs buried in page 45 might be smoothed over in the summary.

### Option B: Vector Database (RAG)

1.  Embed all chunks into ChromaDB.
2.  Query the DB for "Production Problems".

- **Pros:** Handles massive scale (1000+ pages).
- **Cons:** High complexity (Need embedding model, vector store). RAG is good for _answering questions_, but bad for _exhaustive extraction_ ("Find ALL errors").

### Option C: Linear Chunking with Aggregation (Rolling Window)

1.  Split document into strictly defined chunks (e.g., by page or character count).
2.  Analyze _each_ chunk independently with the full prompt ("Find all PBIs").
3.  Merge the results (JSON) into one final report.

- **Pros:** Exhaustive. Nothing is missed. Simple to implement in our current loop.
- **Cons:** Higher latency (linear time complexity) and more Token usage.

## 3. The Decision: Option C (Linear Chunking)

We choose **Option C** because our use case is "Audit/Review". An auditor cannot afford to miss a critical error just because the AI summarized it away. We need completeness over speed.

### Technical Implementation

#### 1. Chunking Logic (The "Slicer")

Since `pdfplumber` gives us text page-by-page, we prioritize **Page-Based Chunking**.

- **Default:** 1 Page per Chunk (if page < 4000 chars).
- **Fallback:** If a page is massive (unlikely in PDFs), split by characters (4000 chars) with 500 chars overlap to avoid cutting sentences.

#### 2. The Analysis Loop

Existing `AgentCore.run()` will undergo a major refactoring:

```typescript
let globalPBIs = [];
let globalCRs = [];

for (const chunk of chunks) {
  const result = await reflexinEngine.run(chunk);
  globalPBIs.push(...result.pbis);
  globalCRs.push(...result.crs);
}
```

#### 3. Result Aggregation (The "Merger")

- **PBIs:** Deduplicate by ID (e.g., "PBI-1234"). If ID is missing, usage strict string similarity on Description.
- **Summary:** We will append the summaries or run a final "Meta-Summary" pass if the combined summary is too long.

## 4. Consequences

- **Positive:** We can now process 100-page documents.
- **Negative:** Analysis time increases linearly. A 50-page document might take 5-10 minutes. We need to implement **Progress Logging** (Phase 9.3) so the user knows the agent hasn't crashed.

## 5. Future Optimization

In Phase 10/11, we can parallelize the loop (Promise.all) if we have access to a stronger machine or cloud API, but for Local Llama 3, sequential is safer to avoid OOM (Out Of Memory).
