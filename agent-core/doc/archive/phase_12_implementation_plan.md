# Implementation Plan - Phase 12: The Analyst Workbench 🛠️

**Goal:** Transform the Phase 11 "Quantum Glass" mockup into a functional Business Analyst tool.
**Purpose:** Enable non-technical users (Analysts) to configure Payment Traffic Relevance criteria (Bank Profiles) without editing JSON files.

## User Review Required

> [!IMPORTANT]
> This plan assumes we are modifying the existing `agent-core` Express server and Frontend. We will add read/write capabilities for configuration files.

## Proposed Changes

### Component: Backend (Logic & Skill)

We need to align the `T2ImpactSkill` with the strict 3-Phase output format defined in `Master Prompt.md`.

#### [MODIFY] [t2-types.ts](file:///c:/Users/Roland/source/ag-workspace/Autonome%20Document%20Intelligence/agent-core/src/skills/library/t2-types.ts)
- Update `T2ImpactAnalysisResult` to store structured data for:
    - `baReport`: { scores, relevantCRs, affectedProcesses }
    - `techReport`: { breakingChanges, systemImpacts, effortEstimates }
    - `mgmtReport`: { executiveSummary, riskMatrix, goNoGo }

#### [MODIFY] [t2-impact-skill.ts](file:///c:/Users/Roland/source/ag-workspace/Autonome%20Document%20Intelligence/agent-core/src/skills/library/t2-impact-skill.ts)
- Implement `formatReport` to return a JSON structure with 3 Markdown blobs (one for each phase) instead of a single string.
- Logic to generate the specific content for Phase 2 (Tech) and Phase 3 (Mgmt) based on the aggregated CR data.

### Component: Backend (Express Server)

We need to connect the frontend to the real AgentCore and handle the new structured response.

#### [MODIFY] [server.ts](file:///c:/Users/Roland/source/ag-workspace/Autonome%20Document%20Intelligence/agent-core/src/interface/server.ts)
- Update `POST /api/analyze`:
    - Instantiate `AgentCore` with the selected config.
    - Execute `agent.run()`.
    - Return the full `T2ImpactAnalysisResult` JSON.
- Add `GET /api/configs` & `POST /api/configs` endpoints.

### Component: Frontend (The Face)

Expand the UI to display the 3-Phase Report.

#### [MODIFY] [index.html](file:///c:/Users/Roland/source/ag-workspace/Autonome%20Document%20Intelligence/agent-core/public/index.html)
- **Results Section:** Add Tabs: [BA Report] | [Tech Report] | [Mgmt Report].
- **Config Section:** Add Editor UI.

#### [MODIFY] [app.js](file:///c:/Users/Roland/source/ag-workspace/Autonome%20Document%20Intelligence/agent-core/public/js/app.js)
- **Render Logic:** Parse the JSON response and inject the Markdown into the correct tab.
- **Config Logic:** Fetch and save JSON profiles.


## Verification Plan

### Automated Tests
- We can write a simple test script (or use `curl`) to verify the API endpoints:
    - `curl http://localhost:3000/api/configs` -> Should return list.
    - `curl -X POST ...` -> Should save a file.

### Manual Verification
1.  **Start Server**: `npm run start:web`
2.  **Open Browser**: Go to `http://localhost:3000`
3.  **Navigate**: Switch to "Configuration" tab (once implemented).
4.  **Edit**: Change the "Bank Name" of `kfw.json` (or a test file) to "Test Bank".
5.  **Save**: Click Save.
6.  **Verify Persistence**: Restart server (or check file system) to ensure `agent-core/config/kfw.json` was updated.
