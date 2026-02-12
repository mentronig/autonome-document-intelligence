# Aufgaben: Autonome Document Intelligence

## Phase 6: Erweitertes Testen (Nächste Sitzung)

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

## Phase 7: Deployment & CI-Vorbereitung (In Planung)

- [ ] **Qualitätssicherung (Linting & Formatting)**
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
