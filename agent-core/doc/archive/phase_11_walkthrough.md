# Phase 11: The Face (Web UI) - Walkthrough

We have successfully implemented the "Face" of the agent: a local web interface for interacting with the document intelligence system.

## Changes

- **New Express Server**: `agent-core/src/interface/server.ts` handles API requests and serves the frontend.
- **Frontend UI**:
  - `index.html`: Main interface with "Quantum Glass" design.
  - `style.css`: Styling using CSS variables for the glassmorphism effect.
  - `app.js`: Logic for file drag & drop and backend communication.
- **Package Scripts**: Added `npm run start:web` to launch the web interface.

## How to Run

1.  Open a terminal in the project root.
2.  Run the web server:
    ```bash
    npm run start:web
    ```
3.  Open your browser and navigate to:
    [http://localhost:3000](http://localhost:3000)

## How to Test

1.  **Interface Check**: Verify the "Quantum Glass" design (dark mode, blur effects).
2.  **Upload**: Drag and drop a PDF file into the drop zone.
3.  **Process**: Watch the status bar update (mock simulation for now).
4.  **Result**: See the mock report displayed in the result section.

## Next Steps

- Connect the mock API endpoints to the real `AgentCore`.
- Implement real-time progress updates via WebSockets or SSE (Optional).
