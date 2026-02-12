# Konzept: Phase 10 - "The Brain Expansion" (Das Gehirn Erweitern) 🧠

## 1. Das Problem: Der "Starre Spezialist" 🤖

Aktuell ist unser Agent extrem gut in **einer einzigen Sache**: Er liest "T2 Release Notes" und sucht nach "Production Problems".

Das ist, als hätten wir einen Mitarbeiter eingestellt, der **nur** ein einziges Formular (Formular A) ausfüllen kann.
Wenn du ihm eine **Rechnung** gibst, sagt er: _"Ich weiß nicht, was ich tun soll. Ich suche nach Production Problems, finde aber keine."_

Der Agent ist "hart in den Code geschrieben" (Hardcoded). Um ihn für Rechnungen zu nutzen, müssten wir den Programmcode ändern (`T2Analyzer.ts` umschreiben). Das ist schlecht.

## 2. Die Lösung: Das "Masken"-Prinzip (Templates) 🎭

Wir wollen dem Agenten beibringen, verschiedene "Rollen" oder "Masken" aufzusetzen.

Stell dir vor, wir geben dem Agenten eine Mappe mit verschiedenen **Anleitungen (Templates)**:

### 📄 Template A: "Der Release-Prüfer" (Aktuell)

- **Deine Rolle:** Du bist ein kritischer Auditor.
- **Suche nach:** "Production Problems" (PBIs) und "Change Requests" (CRs).
- **Ausgabe-Format:** Eine Liste mit IDs.

### 📄 Template B: "Der Buchhalter" (Neu)

- **Deine Rolle:** Du bist ein genauer Buchhalter.
- **Suche nach:** Rechnungsnummer, Datum, Gesamtbetrag, IBAN.
- **Ausgabe-Format:** Ein JSON mit `{ "invoice_id": "...", "total": 100.00 }`.

### 📄 Template C: "Der Vertrags-Anwalt" (Neu)

- **Deine Rolle:** Du bist ein Risiko-Manager.
- **Suche nach:** Haftungsklauseln, Kündigungsfristen.
- **Ausgabe-Format:** Eine Liste von Risiken (Hoch/Mittel/Niedrig).

## 3. Wie wir das technisch bauen ⚙️

Statt im Code (`T2Analyzer.ts`) festen Text zu haben, laden wir Text-Dateien:

1.  **`templates/release_notes.json`**: Enthält den Prompt ("Du bist ein Auditor...") und die Regeln (Regex für PBI-IDs).
2.  **`templates/invoice.json`**: Enthält den Prompt ("Du bist Buchhalter...") und die Regeln (Regex für IBAN).

Wenn wir den Agenten starten, sagen wir ihm:
`npm start -- --type invoice`

Der Agent schaut in seinen Rucksack, holt die "Buchhalter-Maske" (Template B) raus, setzt sie auf und verarbeitet das PDF plötzlich wie ein Buchhalter.

## 4. Der Vorteil

- **Kein neuer Code:** Wenn du eine neue Dokumentenart (z.B. "Lieferscheine") hast, musst du nicht programmieren. Du klickst einfach "Neues Template" und schreibst eine Anleitung (Prompt).
- **Wiederverwendbarkeit:** Die Intelligenz (`AgentCore`) bleibt gleich. Nur die "Instruktionen" ändern sich.

Das macht aus einem "Skript" ein echtes "Produkt" oder eine "Plattform".
