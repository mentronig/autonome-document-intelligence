# Implementation Plan - Phase 13: Optimierung (Fortschritt & Export)

## Goals
1.  **Real-Time Progress:** Der User sieht während der Analyse genau, was passiert (z.B. "Analysiere Chunk 1/3", "Gefundener CR: T2-0067").
2.  **Report Export:** Der User kann die generierten Berichte kopieren oder als Datei herunterladen.

## Proposed Changes

### Feature 1: Real-Time Progress Visualizer (SSE)

#### Backend (`server.ts`)
- [NEW] Endpoint `GET /api/progress`: Implement Server-Sent Events (SSE).
- Modifiziere `POST /api/analyze`:
  - Statt auf das Ende zu warten, starte den Prozess und sende Updates an alle verbundenen SSE-Clients.
  - *Herausforderung:* `AgentCore` muss Events emitten.
  - *Lösung:* Übergebe eine `onProgress` Callback-Funktion an `AgentCore.run()`.

#### Engine (`agent-core.ts` & Skills)
- [MODIFY] `AgentCore.run()`: Akzeptiere `onProgress` Callback.
- [MODIFY] `T2ImpactSkill`: Rufe `onProgress` auf, wenn Chunks verarbeitet oder CRs gefunden werden.

#### Frontend (`app.js`)
- [MODIFY] `handleFile()`:
  - Verbinde mit `EventSource('/api/progress')` vor dem Start.
  - Zeige Nachrichten im UI an (`statusText`).

### Feature 3: Live CR Logging (User Feedback)

#### Backend (`AgentCore.ts`)
- [MODIFY] `run()`: When a chunk is analyzed and CRs are found, call `notify()` with a structured prefix.
  - Format: `CR_FOUND: [ID] Title`

#### Frontend (`index.html`)
- [MODIFY] Add a list container `<ul id="live-cr-list"></ul>` inside `#status-section` (below progress bar).

#### Frontend (`app.js`)
- [MODIFY] `eventSource.onmessage`:
- [x] [MODIFY] `run()`: When a chunk is analyzed and CRs are found, call `notify()` with a structured prefix.
  - [x] Format: `CR_FOUND: [ID] Title`

#### Frontend (`index.html`)
- [x] [MODIFY] Add a list container `<ul id="live-cr-list"></ul>` inside `#status-section` (below progress bar).

#### Frontend (`app.js`)
- [x] [MODIFY] `eventSource.onmessage`:
  - [x] Check if `data.message` starts with `CR_FOUND:`.
  - [x] If yes, append logical item to `#live-cr-list`.
  - [x] If not, update status text as usual.

### Feature 4: Filename in Status Section (User Feedback)
- [x] **Goal:** Show filename immediately when analysis starts.
- [x] **UI:** `<p id="status-filename">` in `#status-section` (above progress bar).
- [x] **JS:** Populate this element in `handleFile`.

### Feature 5: Layout Optimization (User Feedback)
- [x] **Goal:** Widen overall layout and prevent text truncation in tables.
- [x] **CSS:**
  - [x] `.glass-container`: Increase `max-width` to `1200px`.
  - [x] `td`: Set `white-space: normal` and `vertical-align: top`.

### Feature 6: Remove Text Truncation (User Feedback)
- **TS:** `T2ImpactSkill.ts`: Removed `.substring(0, 50) + '...'` from `generateBAReport`.

### Feature 7: Fix Vertical Scrolling (User Feedback)
- **Goal:** Allow scrolling when window height is small.
- **CSS:**
  - `body`: Remove `overflow: hidden`. Fix centering logic (`margin: 40px auto` on container).

### Feature 8: New Analysis Button (User Request)
- **Goal:** Allow user to start a fresh analysis without reloading.
- **UI:** Button "🔄 New Analysis" in report header/actions.
- **JS:** Reset UI state (show upload, hide report, clear variables).

### Feature 9: Multilingual GUI (User Request)
- **Goal:** Switch between English and German interface.
- **UI:** Dropdown/Toggle `EN | DE` in Navbar (Width adjusted).
- **HTML:** Add `data-i18n="key"` to all text nodes.
- **JS:**
  - Translations stored in `/locales/en.json` and `/locales/de.json`.
  - `async function updateLanguage(lang)`: Fetches JSON and updates text.
  - Store preference in `localStorage`.

### Feature 2: Report Actions (Copy & Download)

#### Frontend (`index.html`)
- [MODIFY] Füge eine Toolbar über dem `report-viewer` hinzu:
  - Button `[📋 Copy]`
  - Button `[💾 Download .md]`

#### Frontend (`app.js`)
- [NEW] Funktion `copyToClipboard(text)`
- [NEW] Funktion `downloadFile(filename, content)`
- [MODIFY] Event Listener für die neuen Buttons.

## Verification Plan

### Manual Verification
1.  **Progress:** Upload a PDF. Beobachte den Status-Text. Er sollte sich dynamisch ändern (nicht nur "Analyzing...").
2.  **Copy:** Klicke "Copy", füge in Notepad ein.
3.  **Download:** Klicke "Download", prüfe ob `.md` Datei gespeichert wird.
