# Phase 13: Problems & Learnings

## 🛑 Problems Encountered at Implementation

### 1. UI/CSS Issues
- **Problem:** The Language Selector was initially too wide, breaking the sleek nav layout.
  - *Fix:* Applied `width: auto` and `min-width` to constrain it.
- **Problem:** Dropdown options (`<option>`) were invisible (White text on White/Transparent background) due to the Glassmorphism theme interacting with browser defaults.
  - *Fix:* Explicitly set `background-color: #0f172a` (Dark) and `color: #fff` for `option` elements.
- **Problem:** Vertical scrolling was disabled on the body (`overflow: hidden`), making the app unusable on smaller screens when content expanded.
  - *Fix:* Changed to `overflow-y: auto`.

### 2. Logic & defaults
- **Problem:** App defaulted to English ("en") despite the user preference being German.
  - *Fix:* Changed default fallback in `localStorage` logic to `"de"`.
- **Problem:** Hardcoded translations in `app.js` cluttered the code and made it hard to read.
  - *Fix:* Refactored to external `locales/en.json` and `de.json` loaded via `fetch`.

---

## 💡 Learnings & Best Practices

### 1. Server-Sent Events (SSE) for Real-Time Updates
- **Insight:** SSE is a lightweight alternative to WebSockets for uni-directional updates (Server -> Client).
- **Benefit:** allowed us to show "Live CR Logging" and precise progress without polling or complex libraries.

### 2. Architecture: Separation of Concerns (i18n)
- **Insight:** Moving text out of logic (`app.js`) into data (`*.json`) massively improves maintainability.
- **Benefit:** Scaling to new languages (e.g., French) now only requires adding a file, not touching code.

### 3. Iterative UI Refinement
- **Insight:** "Quantum Glass" aesthetics are fragile. Standard elements like `<select>` and `<table>` need specific overrides to look good on glass backgrounds.
- **Takeaway:** Always verify standard browser inputs against custom backgrounds immediately.

### 4. Git Hygiene
- **Insight:** Keeping `memory/` and `logs/` out of version control is critical for long-term project health.
- **Action:** `.gitignore` was consolidated to prevent "pollution" with runtime artifacts.
