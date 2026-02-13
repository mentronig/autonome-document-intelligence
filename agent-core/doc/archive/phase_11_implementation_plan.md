# Implementation plan - Phase 11: The Face (Interaktion) 🖥️

Wir bauen das "Gesicht" des Agenten: Ein lokales Web-Interface, damit man nicht mehr mit der Konsole arbeiten muss.
**Ziel:** Ein einfaches Dashboard, wo man PDFs reinwirft und Ergebnisse sieht.

## User Review Required

> [!NOTE]
> Wir verwenden **Vanilla HTML/CSS/JS** für das Frontend, um Dependencies gering zu halten (Local-First Prinzip).
> Backend ist ein simpler **Express Server**, der den `AgentCore` aufruft.

## Proposed Changes

### Agent Core (Backend)

#### [NEW] [server.ts](file:///c:/Users/Roland/source/ag-workspace/Autonome%20Document%20Intelligence/agent-core/src/interface/server.ts)

- Express Server Setup
- API Routes:
  - `POST /api/analyze`: Nimmt PDF entgegen, startet Agent.
  - `GET /api/status`: Gibt Status zurück (für Progress Bar).
  - `GET /api/results`: Listet letzte Reports.

#### [MODIFY] [agent-core/package.json](file:///c:/Users/Roland/source/ag-workspace/Autonome%20Document%20Intelligence/agent-core/package.json)

- Add dependencies: `express`, `multer` (File Upload), `cors`.
- Add script: `npm run start:web`.

### Web Frontend (Public)

#### [NEW] [index.html](file:///c:/Users/Roland/source/ag-workspace/Autonome%20Document%20Intelligence/agent-core/public/index.html)

- Hero Section (Quantum Glass Design).
- Dropzone für PDFs.
- Result-Container (Live-Log & Markdown-View).

#### [NEW] [app.js](file:///c:/Users/Roland/source/ag-workspace/Autonome%20Document%20Intelligence/agent-core/public/js/app.js)

- File Upload Logic.
- Polling für Status-Updates.

## Verification Plan

### Automated Tests

- `curl` Tests gegen die API Endpoints.
- Browser-Automation (später).

### Manual Verification

- `npm run start:web` ausführen.
- Browser öffnen (`http://localhost:3000`).
- PDF reinziehen -> Report sehen.
