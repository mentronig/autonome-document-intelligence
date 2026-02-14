# Autonome Document Intelligence (ADI)

Ein autonomer KI-Agent zur Analyse von komplexen Bankdokumenten (EZB Change Requests).

## Projektstruktur

Dieses Repository ist als **Monorepo** organisiert:

- 📂 **`agent-core/`**: Das "Gehirn" des Agenten.
  - Hier liegt der gesamte Quellcode (TypeScript & Python).
  - Hier starten alle Befehle (`npm start`, `npm test`).
- 📂 **`tests/`**: Qualitätssicherung.
  - `tests/samples/`: Echte PDF-Dokumente für Integrationstests.
  - `tests/integration/`: End-to-End Tests.
  - `tests/unit/`: Tests für die interne Logik.

## Schnellstart

Voraussetzungen: Node.js (v20+), Python (3.11+), Ollama (Llama 3).

```bash
# 1. In das Kern-Verzeichnis wechseln
cd agent-core

# 2. Abhängigkeiten installieren
npm install

# 3. Tests ausführen (stellt sicher, dass alles läuft)
npm test

# 4. Agenten starten (Review-Modus)
npm start -- "C:\Pfad\zu\deinem.pdf"
```

## Features

- **Autonome Analyse:** Liest PDFs, chunked sie intelligent und extrahiert Impact-Analysen.
- **Multilingual GUI:** Umschaltbar zwischen Deutsch und Englisch.
- **Config Editor:** Bearbeiten von Bank-Profilen direkt im Browser.
- **Live-Logs:** Echtzeit-Fortschrittsanzeige via Server-Sent Events (SSE).
- **Export:** Ergebnisse als Markdown/JSON herunterladen oder in die Zwischenablage kopieren.

## Dokumentation

Detaillierte Anleitungen findest du im Ordner `agent-core/doc/`:

- [Einsteiger-Guide zum Testen](agent-core/doc/guide_agent_testing_basics.md)
- [Architektur-Entscheidungen (ADRs)](agent-core/doc/)
- [Handover Dokumentation](agent-core/doc/HANDOVER.md)
