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

- [ ] **Web UI (Local-First)**
  - [ ] Express Server aufsetzen
  - [ ] Einfaches Frontend (Drag & Drop) erstellen

## Phase 12: The Context Architect (Setup Wizard) 🧙‍♂️

- [ ] **Interactive Setup**
  - [ ] CLI/UI Wizard zur Erfassung der Bank-Infrastruktur
  - [ ] Generierung der `kfw.json` (oder anderer Profile) durch Interview-Fragen
  - [ ] Validierung der Eingaben gegen T2-Logik

## Phase 13: The Strategist (Product Management) ♟️

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
