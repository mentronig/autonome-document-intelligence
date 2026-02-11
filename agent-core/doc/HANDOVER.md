
# 🧠 ÜBERGABE: Kontext & Mindset für die nächste Sitzung

**Von:** Admin & Mentor (Aktuelle Sitzung)
**An:** Den nächsten aktiven Agenten (Rolle: **Lead Developer**)
**Datum:** 2026-02-11
**Status:** Bereit für Phase 6 (Testing)

---

## 🚨 SOFORTIGE ANWEISUNG

1.  **Identitäts-Check:**
    *   Du bist der **Lead Developer**. Lies `agent-core/doc/personas/DEVELOPER.md`.
    *   Dein Supervisor ist der **Admin & Mentor**. Lies `agent-core/doc/personas/ADMIN_MENTOR.md`.

2.  **Projektstatus:**
    *   **Architektur:** Hybrid Node.js/Python (Feststehende Entscheidung. Siehe `agent-core/doc/adr_001_node_vs_python.md`).
    *   **Risiken & Maßnahmen:** Wir haben die Risiken analysiert (Siehe `agent-core/doc/adr_002_risk_analysis.md`) und Gegenmaßnahmen definiert (Siehe `agent-core/doc/adr_003_mitigation_strategies.md`).

3.  **Deine Mission (Phase 6):**
    *   Wir brauchen **Tests**. Die Codebasis funktioniert (POC), hat aber kein Sicherheitsnetz.
    *   **Ziel 1:** Unit-Tests schreiben (Jest) -> Abgelegt in `tests/unit/`.
    *   **Ziel 2:** Echte PDFs testen -> Abgelegt in `tests/samples/`. (Vertrauliche Dateien NICHT in die Versionskontrolle!)

## 📂 Projektstruktur (Wo Dinge hingehören)
*   **Monorepo:** Wir haben eine Monorepo-Struktur eingeführt (Siehe `agent-core/doc/adr_004_monorepo_structure.md`).
*   **Root:** `.` (Git Repository Root)
*   **Agent Core Logic:** `agent-core/src/`
*   **Dokumentation:** `agent-core/doc/`
*   **Tests:** `tests/` (Neu!)
    *   `tests/unit`: Jest-Tests für die Logik.
    *   `tests/samples`: Echte PDF-Dateien zum Testen.
*   **Helfer:** `tests/samples/generate_pdf.py` (Testdaten-Generator)

## ⚠️ "Nicht anfassen" Liste
*   **Keine Neuschreibungen:** Refactore kein Python, solange es nicht kaputt ist.
*   **Keine Cloud:** Füge keine OpenAI API-Aufrufe hinzu.

## 🏁 Wie man anfängt
Sag zum Benutzer: *"Ich habe die Übergabe gelesen. Ich bin bereit, Phase 6 als Ihr Lead Developer zu beginnen."*
