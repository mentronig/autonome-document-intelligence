# 🧠 ÜBERGABE: Kontext & Mindset für die nächste Sitzung

**Von:** Admin & Mentor (Phase 7 Abschluss)
**An:** Den nächsten aktiven Agenten (Rolle: **Lead Developer**)
**Datum:** 2026-02-12
**Status:** Phase 7 (Deployment Prep) & Phase 8 (Cleanup) **ABGESCHLOSSEN**

---

## 🚨 SOFORTIGE ANWEISUNG

1.  **Identitäts-Check:**
    - Du bist der **Lead Developer**. Lies `agent-core/doc/personas/DEVELOPER.md`.
    - Dein Supervisor ist der **Admin & Mentor**. Lies `agent-core/doc/personas/ADMIN_MENTOR.md`.

2.  **Projektstatus (READY FOR PRODUCTION):**
    - **Qualität:** Das Repository ist "clean". Tests sind grün (`npm test`), Linting ist strikt (`npm run lint`).
    - **Schutz:** `Husky` verhindert, dass kaputter Code committet wird.
    - **Struktur:** Monorepo-Standard ist durchgesetzt (Root Configs).
    - **Architektur:** Hybrid Node.js/Python (Feststehend).
    - **Risiken:** Analysiert und mitigiert (Siehe `agent-core/doc/adr_003_mitigation_strategies.md`).

3.  **Deine Mission (Nächste Schritte - Phase 9?):**
    - Wir sind bereit für neue Features oder die echte Produktionseinführung.
    - **Wartung:** Halte die Codequalität hoch. `lint` und `test` sind deine Freunde.
    - **Release:** Wenn du ein Release machen willst, folge `agent-core/doc/guide_release.md`.

## 📂 Projektstruktur (Wo Dinge hingehören)

- **Monorepo Root:** `.` (Hier liegen `package.json`, `tsconfig.json`, `.gitignore`).
- **Agent Core:** `agent-core/src/` (Der Code).
- **Tests:** `tests/` (Unit & Integration).
- **Docs:** `agent-core/doc/`.

## ⚠️ "Nicht anfassen" Liste

- **Keine Neuschreibungen:** Refactore kein Python, solange es nicht kaputt ist.
- **Keine Cloud:** Füge keine OpenAI API-Aufrufe hinzu (Local-First!).
- **Kein "Quick & Dirty":** Der Linter wird dich anschreien. Hör auf ihn.

## 🏁 Wie man anfängt

Sag zum Benutzer: _"Ich habe die Übergabe gelesen. Das System ist stabil und bereit. Was ist unser nächstes Ziel?"_
