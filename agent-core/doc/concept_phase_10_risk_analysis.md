# Challenge: Phase 10 - "The Brain Expansion" (Risiko-Analyse) ⚠️

**Identität:** Admin & Mentor (Red Team Mode)
**Ziel:** Kritische Schwachstellen im "Masken"-Konzept (Templates) aufdecken.

Hier sind die **drei größten Risiken**, warum dieses Konzept scheitern könnte:

## 1. Die "Struktur-Falle" (Type Safety vs. Flexibilität) 🏗️

**Das Problem:**
Aktuell ist unser `T2Analyzer` extrem typensicher (`AnalysisResult`).
Er erwartet _zwingend_ `{ pbis: [], crs: [] }`.

Wenn wir Templates einführen (z.B. "Rechnung"), ändert sich die erwartete JSON-Struktur radikal (z.B. `{ iban: string, total: number }`).

**Warum es scheitern könnte:**

- **Keine Validierung mehr:** Wir müssen im TypeScript-Code auf `any` oder extrem generische Typen (`Record<string, unknown>`) zurückfallen.
- **Verlust der "Reflexion":** Unser `ReflexionEngine` prüft aktuell hart auf PBI-IDs (Regex). Ein generischer Validator ("Prüfe, ob das Feld 'iban' eine IBAN ist") ist extrem schwer zu bauen, ohne für jedes Template neuen Code zu schreiben.
- **Ergebnis:** Der Agent wird "dumm". Er validiert nicht mehr, ob die IBAN stimmt, sondern glaubt einfach dem LLM.

## 2. Das "Kontext-Problem" (Chunking vs. Globale Fakten) 🧩

**Das Problem:**
In Phase 9 haben wir "Smart Chunking" eingeführt (Seite für Seite analysieren).
Das funktioniert perfekt für _lokale_ Probleme (ein Tippfehler auf Seite 5).

Aber Dokumente wie Verträge oder Rechnungen haben _globale_ Zusammenhänge:

- Seite 1: "Rechnungsbetrag: 50.000 €"
- Seite 5: "Zahlungsziel: 30 Tage"

**Warum es scheitern könnte:**

- Unsere Logik bearbeitet Seite 1. Das LLM sieht "Betrag", aber kein "Ziel". Es gibt `{ amount: 50000, target: null }` zurück.
- Dann bearbeitet es Seite 5. Es sieht "Ziel", aber keinen "Betrag". Es gibt `{ amount: null, target: "30 Tage" }` zurück.
- **Merge-Hölle:** Am Ende haben wir zwei JSON-Objekte, die sich widersprechen oder schwer zu vereinen sind. Ein einfaches `Array.concat` (wie bei PBIs) funktioniert hier nicht mehr.

## 3. Die "Prompt-Fragilität" (Garbage In, Garbage Out) 🗑️

**Das Problem:**
Wir verlagern die Intelligenz vom Code (`Analyzer.ts`) in Text-Dateien (`template.json`).
Das klingt gut ("User kann es ändern!"), ist aber gefährlich.

**Warum es scheitern könnte:**

- **User sind keine Prompt Engineers:** Ein User schreibt: _"Such mir die Rechnungsnummer."_
- Das lokale Modell (Llama 3) braucht aber sehr präzise Anweisungen (Few-Shot Examples, JSON-Schema), um valides JSON zu liefern.
- **Ergebnis:** Der Agent stürzt ab oder liefert Müll, weil das User-Template nicht robust ist. Wir verlieren die Kontrolle über die Qualität der Analyse.

---

**Fazit:**
Das Konzept "Templates" klingt einfach, erfordert aber eine **komplette Überarbeitung** von:

1.  Der **ReflexionEngine** (muss konfigurierbare Regeln/Regex unterstützen).
2.  Der **AggregationStrategy** (muss wissen, wie man Rechnungen merget vs. Listen merget).
