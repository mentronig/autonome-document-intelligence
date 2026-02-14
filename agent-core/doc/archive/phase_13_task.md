# Aufgaben: Autonome Document Intelligence

## Phase 9: The Engine Upgrade (Robustheit & Skalierung) (Abgeschlossen)

- [x] **Smart Chunking (Skalierung)**
  - [x] Konzept für "Rolling Window" Analyse entwerfen (`agent-core/doc/adr_006_chunking_strategy.md`)
  - [x] `AgentCore` Refactoring: Loop über Text-Chunks statt 8k-Limit
  - [x] `AnalysisResult` Aggregation: Ergebnisse aus mehreren Chunks zusammenführen
- [x] **Resilience (Widerstandsfähigkeit)**
  - [x] `OllamaClient`: Retry-Logic mit Exponential Backoff implementieren
  - [x] Error-Handling: Graceful Degradation (Warnung statt Crash bei Offline-Status)
- [x] **Structured Logging**
  - [x] `Logger` Klasse erstellen (`infrastructure/logger.ts`)
  - [x] `console.log` Calls durch strukturiertes Logging ersetzen (mit Levels: INFO, WARN, ERROR)

## Phase 10: The Brain Expansion (v2 - Skill Architecture) 🧠 (Abgeschlossen)

- [x] **Core Skill System**
  - [x] `ISkill` Interface definieren (Prompt, Schema, Merge-Logic)
  - [x] `SkillManager` erstellen (`agent-core/src/skills/skill-manager.ts`)
- [x] **Refactoring**
  - [x] `T2Analyzer` zu `ReleaseAuditorSkill` migrieren
  - [x] `AgentCore` auf `SkillManager` umstellen (dynamische Skill-Wahl)
- [x] **High-Value Skill: T2 Impact Analysis**
  - [x] `T2ImpactSkill` konzipieren: Prompt-Logik (`Master Prompt v1.1.3`) in Code gießen
  - [x] `Config` für Bank-Infrastruktur (TPH, ZV-Systeme) erstellen
  - [x] `Zod`-Schema für Impact-Validierung definieren
  - [x] `ResultAggregator` für T2-Reports implementieren (Score-Berechnung im Code)

## Phase 11: The Face (Interaktion)

- [x] **Web UI (Local-First)**
  - [x] Express Server aufsetzen
    - [x] Create `agent-core/src/interface/server.ts`
    - [x] Add `express`, `multer`, `cors` to `package.json`
    - [x] Create API routes (`/api/analyze`, `/api/status`)
  - [x] Einfaches Frontend (Drag & Drop) erstellen
    - [x] Create `agent-core/public/index.html` (Quantum Glass)
    - [x] Create `agent-core/public/js/app.js` (Upload Logic)
    - [x] Create `agent-core/public/css/style.css`
  - [x] Verification
    - [x] Verify server starts (`npm run start:web`)
    - [x] Verify file upload works


## Phase 12: The Analyst Workbench (GUI & Configuration) 🛠️ (Abgeschlossen)

- [x] **Enforce Configuration Selection**
  - [x] `t2Config` Injection in `AgentCore`
  - [x] Backend API (`POST /api/analyze`) validates & loads config
  - [x] Frontend UI: Dropdown for Bank Profile
  - [x] Frontend Logic: Block upload if no config selected

- [x] **Backend: Logic Refactoring (3-Phase Report)**
  - [x] Update `T2ImpactSkill` to generate split reports (BA, Tech, Management) as per Master Prompt
  - [x] Enhance `T2ImpactAnalysisResult` type to hold structured data for all 3 phases
- [x] **API Layer (Configuration & Execution)**
  - [x] Implement `GET /api/config` to list profiles
  - [x] Implement `POST /api/config` to save profiles
  - [x] Implement `POST /api/analyze` to trigger REAL AgentCore execution
- [x] **Frontend: Analyst Dashboard**
  - [x] **Configuration Tab:** Visual Editor for `T2Config` (The "Setup Wizard")
  - [x] **Analysis Tab:** Progress Updates
  - [x] **Report View:** Tabbed view for the 3 Report Phases (BA / Tech / Mgmt)
- [x] **Simulation (Optional)**
  - [x] Simple text box to test keyword matching in real-time

## Phase 13: Optimierung der Anwendung 🚀

- [x] **Sprechende Profil-Namen**
  - [x] API `GET /api/configs` liefert `name` + `filename`
  - [x] Frontend zeigt `bankName` im Dropdown

- [x] **Real-Time Progress (Fortschrittsanzeige)**
  - [x] Backend: `GET /api/progress` Endpoint (SSE)
  - [x] Engine: `AgentCore` emittet Status-Events an Server
  - [x] Frontend: `EventSource` Integration (`app.js`)
  - [x] **Live CR Display:** Show Filename & Found CRs (ID/Title) in UI
  - [x] **Status Filename:** Show 'Analyzing: [filename]' immediately
- [x] **UI Layout Optimization (User Feedback)**
  - [x] **Wider Layout:** Container max-width increased to 1200px
  - [x] **Text Visibility:** Removed truncation in `T2ImpactSkill` & added `white-space: normal`
  - [x] **Vertical Scrolling:** Fixed `overflow: hidden` issue on body
  - [x] **Reset Flow:** Added "New Analysis" button to restart process
- [x] **Report Export (Kopieren & Download)**
  - [x] UI: Toolbar mit Copy/Download Buttons
  - [x] Logic: Clipboard API & Blob Download

### Phase 13.5: Multilingual GUI (User Request)
- [x] **UI Implementation**
  - [x] Add Language Selector (EN/DE) to Header/Nav
  - [x] Add `data-i18n` attributes to all text elements in `index.html`
- [x] **Logic Implementation**
  - [x] Create External JSON Translations (`/locales/*.json`)
  - [x] Implement async `updateLanguage(lang)` with `fetch`
  - [x] Persist selection (localStorage)

### Phase 13.9: Projekt-Cleanup (Vorbereitung Git Push)
- [x] **Dateistruktur bereinigen**
  - [x] `.gitignore` aktualisiert (Memory, Logs, Temp-Dateien)
  - [x] Temporäre Analysedateien entfernt (`memory/*.json`, `*.md`)
  - [x] `README.md` aktualisiert (Features, Dokumentation)

## Phase 14: The Context Architect (Integrated in Phase 12) (Abgeschlossen)

- [x] **Interactive Setup (Config Editor)**
  - [x] UI Wizard zur Erfassung der Bank-Infrastruktur (`/config` Tab)
  - [x] Generierung der Profile (`.json`)
  - [x] Validierung (Basic Inputs)

## Phase 15: The Strategist (Product Management) ♟️

- [ ] **Vision & Roadmap**
  - [ ] Persona-Entwicklung (Admin vs. Manager)
  - [ ] Market Research & Konkurrenzanalyse
  - [ ] Definition der langfristigen Produkt-Vision
  - [ ] Roadmap-Planung (Features vs. Value)

## Phase 6: Erweitertes Testen (Abgeschlossen)

- [x] **Wissensvermittlung & Onboarding**
  - [x] Erstelle `agent-core/doc/guide_agent_testing_basics.md` (Schritt-für-Schritt für Anfänger)
- [x] **Test-Infrastruktur einrichten**
  - [x] Jest und Types installieren (`npm install --save-dev jest ts-jest @types/jest`)
  - [x] `jest.config.js` für TypeScript konfigurieren
- [x] **Unit-Testing**
  - [x] Verzeichnis `tests/unit/` erstellen
  - [x] Tests für `AgentCore` Logik schreiben
  - [x] Tests für `Reflexion Loop` Zustandsübergänge schreiben (via ModeManager Test)
- [x] **Integration/Stress-Testing**
  - [x] `pdfplumber` Integration mit Beispiel-PDFs verifizieren (alle 6 Samples als Stress-Test)

## Phase 7: Deployment & CI-Vorbereitung (Abgeschlossen)

- [x] **Qualitätssicherung (Linting & Formatting)**
  - [x] ESLint & Prettier für TypeScript einrichten
  - [x] Flake8 & Black für Python einrichten
  - [x] Konsistente Regeln definieren (z.B. keine `any`, keine ungenutzten Imports)
- [x] **Automatisierung (DevOps-Light)**
  - [x] `package.json` Skripte optimieren (Cross-Platform Builds)
  - [x] Husky (Pre-Commit Hooks) einrichten -> Verhindert Bad Code im Repo
- [x] **Release-Prozess**
  - [x] `agent-core/doc/guide_release.md` erstellen

## Phase 8: Cleanup & Maintenance (Abgeschlossen)

- [x] **Projektstruktur bereinigen**
  - [x] Redundante Config-Dateien in `agent-core/` entfernt (`package.json`, `tsconfig.json`)
  - [x] `.gitignore` konsolidiert (Root)
  - [x] `dist/` und `node_modules/` aus Unterordnern entfernt
