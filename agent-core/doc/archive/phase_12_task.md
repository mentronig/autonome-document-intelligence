
## Phase 12: The Analyst Workbench (GUI & Configuration) 🛠️

- [ ] **Backend: Logic Refactoring (3-Phase Report)**
  - [ ] Update `T2ImpactSkill` to generate split reports (BA, Tech, Management) as per Master Prompt
  - [ ] Enhance `T2ImpactAnalysisResult` type to hold structured data for all 3 phases
- [ ] **API Layer (Configuration & Execution)**
  - [ ] Implement `GET /api/config` to list profiles
  - [ ] Implement `POST /api/config` to save profiles
  - [ ] Implement `POST /api/analyze` to trigger REAL AgentCore execution
- [ ] **Frontend: Analyst Dashboard**
  - [ ] **Configuration Tab:** Visual Editor for `T2Config`
  - [ ] **Analysis Tab:** Real-time progress bar (streaming logs?)
  - [ ] **Report View:** Tabbed view for the 3 Report Phases (BA / Tech / Mgmt)
- [ ] **Simulation (Optional)**
  - [ ] Simple text box to test keyword matching in real-time

## Phase 13: The Strategist (Product Management) ♟️

- [ ] **Vision & Roadmap**
  - [ ] Persona-Entwicklung (Admin vs. Manager)
  - [ ] Market Research & Konkurrenzanalyse
  - [ ] Definition der langfristigen Produkt-Vision
  - [ ] Roadmap-Planung (Features vs. Value)

# Task: Allow German Enum Values for 'Effort'

- [x] Analyze `t2-types.ts` Zod Schema for `effort` <!-- id: 5 -->
- [x] Create Implementation Plan to support German values <!-- id: 6 -->
- [x] Modify `t2-types.ts` to accept "Niedrig", "Mittel", "Hoch" <!-- id: 7 -->
- [x] Update `t2-impact-skill.ts` to map German inputs to internal English values (or keep German) <!-- id: 8 -->
- [x] Verify <!-- id: 9 -->

# Task: Fix Missing Score Fields

- [x] Analyze `t2-impact-skill.ts` prompt for ambiguity regarding JSON keys <!-- id: 10 -->
- [x] Modify prompt in `t2-impact-skill.ts` to strictly enforce English JSON keys <!-- id: 11 -->
- [x] Verify with re-run <!-- id: 12 -->

# Task: Delete Stale Build Artifacts

- [x] Delete `*.js` files in `src` directory to force recompilation <!-- id: 13 -->
- [x] Verify fix <!-- id: 14 -->

# Task: Documentation

- [x] Document debugging issues and solutions (`doc/issue_report_t2_debugging.md`) <!-- id: 15 -->
- [x] Document session learnings (`doc/learnings_session_t2.md`) <!-- id: 16 -->
