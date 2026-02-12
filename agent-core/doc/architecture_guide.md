# Architektur-Guide für Einsteiger: Der Autonome Dokumentenanalyse-Agent

Willkommen! Dieses Dokument erklärt Ihnen, wie der von uns gebaute AI-Agent "unter der Haube" funktioniert. Es ist speziell für Einsteiger geschrieben, um die Konzepte hinter modernen AI-Agenten verständlich zu machen.

---

## 1. Was ist ein "Autonomer AI-Agent"?

Stellen Sie sich normale Software (wie Excel) als Werkzeug vor: Sie müssen jeden Schritt selbst klicken.
Ein **AI-Agent** ist eher wie ein Mitarbeiter: Sie geben ihm ein Ziel ("Analysiere dieses Dokument"), und er erledigt die Schritte eigenständig. Er kann lesen, "denken", Entscheidungen treffen und sogar seine Fehler korrigieren.

Unser Agent ist **autonom**, weil er:

1.  Den Inhalt selbstständig versteht (via LLM).
2.  Seine Ergebnisse überprüft (Reflexion).
3.  Seinen eigenen Code anpassen kann, wenn er auf neue Probleme stößt (Evolution).
4.  Alles **lokal** auf Ihrem Computer läuft (Datenschutz!).

---

## 2. Die Kern-Komponenten (Der Körper des Agenten)

Man kann die Architektur mit dem menschlichen Körper vergleichen:

| Komponente        | Analogie              | Funktion im Agenten                                                                          | Tech-Stack                  |
| :---------------- | :-------------------- | :------------------------------------------------------------------------------------------- | :-------------------------- |
| **Agent Core**    | **Gehirn/Zentrale**   | Steuert alle anderen Teile. Entscheidet, was als nächstes passiert.                          | Node.js (TypeScript)        |
| **Skill Manager** | **Talent-Verwaltung** | Kennt alle Fähigkeiten (Skills) des Agenten und wählt die passende aus.                      | TypeScript (`SkillManager`) |
| **Skills**        | **Fähigkeiten**       | Spezialisierte Module für bestimmte Aufgaben (z.B. "T2 Impact Analyse", "Rechnungsprüfung"). | TypeScript (`ISkill`)       |
| **Ingestion**     | **Augen**             | Liest Dokumente (PDFs) und wandelt sie in verständlichen Text um.                            | Python (`pdfplumber`)       |
| **LLM Client**    | **Sprachzentrum**     | Die Schnittstelle zur KI (Ollama). Führt die Befehle der Skills aus.                         | Llama 3 via Ollama          |
| **Memory**        | **Gedächtnis**        | Speichert Ergebnisse langfristig ab.                                                         | Dateisystem (JSON/MD)       |

---

## 3. Der Ablauf: Vom PDF zur Analyse (Skill Architecture)

Seit Phase 10 ("The Brain Expansion") ist der Agent nicht mehr fest verdrahtet, sondern **dynamisch**.
Er lädt je nach Aufgabe den passenden Skill und die passende Konfiguration.

```mermaid
graph TD
    A[Start: PDF-Datei] --> B(Ingestion: Augen);
    B --> C{Skill wählen};
    C -->|z.B. T2 Analyse| D[Skill: T2 Impact Analyzer];
    D --> E[Lade Konfiguration (z.B. kfw.json)];
    E --> F[Prompt Generierung (mit Kontext)];
    F --> G(LLM: Llama 3);
    G --> H[Validierung (Zod-Schema)];
    H -->|Fehler| G;
    H -->|OK| I[Ergebnis Aggregation];
    I --> J[Ende: Strukturierter Bericht];
```

### Schritt 1: Ingestion & Skill Selection

Der Agent liest das PDF und entscheidet (oder wird konfiguriert), welchen **Skill** er nutzen soll.
Für T2 Release Notes wählt er den `T2ImpactSkill`.

### Schritt 2: Context Injection (Das "Wissen")

Der Skill lädt eine Konfigurationsdatei (z.B. `kfw.json`).
Das ist neu in Phase 10: Der Agent weiß nun, dass er für die **KfW** arbeitet und kennt deren Systeme (TPH, ESMIG, etc.).
Er injiziert dieses Wissen direkt in den Prompt für die KI.

### Schritt 3: Reasoning & Validation (Das Denken)

Der Skill führt die Analyse durch:

1.  **Prompting:** Er generiert einen maßgeschneiderten Befehl für das LLM.
2.  **Validierung:** Der Output der KI wird gegen ein **Schema (Zod)** geprüft. Wenn die KI halluziniert oder falsches JSON liefert, wird das erkannt.
3.  **Scoring:** Kritische Kennzahlen (z.B. Impact Score) werden **im Code berechnet**, um Rechenfehler der KI auszuschließen.

---

## 4. Die Technologien (Der Werkzeugkasten)

- **Node.js / TypeScript:** Die Hauptsprache. Schnell, modern und typensicher (weniger Fehler).
- **Ollama:** Ein Tool, um große Sprachmodelle (wie Llama 3) lokal auf Ihrem PC auszuführen. Es ersetzt die Cloud (OpenAI/Google).
- **ChromaDB:** Eine "Vektor-Datenbank". Sie speichert nicht nur Text, sondern die _Bedeutung_ von Text. So kann der Agent später fragen: "Hatten wir so ein Problem schon mal?" (Zukunftsmusik für Version 2).
- **pdfplumber:** Eine Python-Bibliothek, die PDFs extrem präzise auslesen kann, besser als die meisten JavaScript-Alternativen.

---

## 5. Die Wächter (DevOps & Qualitätssicherung)

Da "autonom" auch "gefährlich" heißen kann (wenn der Agent Quatsch macht), haben wir strenge Wächter eingebaut. Diese Tools laufen **bevor** neuer Code akzeptiert wird.

| Wächter (Tool)          | Funktion                                                                    | Analogie             |
| :---------------------- | :-------------------------------------------------------------------------- | :------------------- |
| **TypeScript (Strict)** | Verhindert Tippfehler und falsche Datentypen.                               | Der strenge Lektor.  |
| **ESLint / Flake8**     | Prüft auf schlechten Stil (z.B. ungenutzte Variablen).                      | Der Style-Coach.     |
| **Prettier / Black**    | Formatiert den Code automatisch (Einrückung, Leerzeichen).                  | Der Setzer/Layouter. |
| **Jest (Tests)**        | Führt den Agenten probehalber aus.                                          | Der TÜV-Prüfer.      |
| **Husky (Pre-Commit)**  | Verhindert, dass Sie Code speichern ("committen"), wenn Tests fehlschlagen. | Der Türsteher.       |

---

## 6. Projektstruktur (Wo finde ich was?)

Das Projekt ist als **Monorepo** organisiert. Das bedeutet, alle Teile des Systems liegen in einem Hauptordner:

- **`@Root`** (Hauptverzeichnis)
  - `task.md` - Die aktuelle Aufgabenliste.
  - `tests/` - Systemweite Tests & Beispieldateien (PDFs).
  - `agent-core/` - **Der eigentliche Agent** (Das "Backend").

Innerhalb von **`agent-core/`** finden Sie:

- `src/` - Der Quellcode (Source).
  - `src/engine/` - Das Herzstück (`AgentCore`, `ReflexionEngine`).
  - `src/skills/` - Die Fähigkeiten (PDF lesen, Analysieren, Lernen).
  - `src/memory/` - Speicherfunktionen (ChromaDB).
- `dist/` - Der _übersetzte_ Code (JavaScript).
- `doc/` - Dokumentation & ADRs.

---

## 7. Warum "Local-First"?

Moderne "Cloud-First" Software sendet Ihre Daten an Server von Google oder Microsoft.
Unser **Local-First** Ansatz bedeutet:

- **Datenschutz (Der wichtigste Grund):** Die T2 Release Notes selbst sind öffentlich (EZB). Aber um sie zu _bewerten_, füttern wir den Agenten mit **streng vertraulichem Bank-Wissen** (Netzwerk-Architektur, Fachliche Prozesse, Schnittstellen-Beschreibungen).
  Dieses interne Wissen darf Ihren gesicherten Bereich niemals verlassen.
- **Kosten:** Keine API-Gebühren für jeden Aufruf.
- **Unabhängigkeit:** Läuft auch ohne Internet (sobald Modelle geladen sind).

---

Ich hoffe, dieser Guide hilft Ihnen, sich in der Welt der autonomen AI-Agenten zurechtzufinden! 🚀
