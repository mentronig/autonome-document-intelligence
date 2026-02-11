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
