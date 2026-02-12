# Analyse: Integration von Kundenkontext (Customer Context) 🏦

**Status:** Draft
**Ziel:** Das "geheime Wissen" (Infrastruktur, Embargo-Prozesse, TPH-Specs) in die Analyse einbringen.

## Das Problem: Kontext-Volumen vs. Präzision

Kundenwissen ist zweigeteilt:

1.  **Harte Fakten (Strukturiert):** "System TPH verarbeitet pacs.008 v2". "Schnittstelle X nutzt Format Y".
2.  **Weiches Wissen (Unstrukturiert):** "Der Embargo-Prozess prüft Zahlungen aus Land Z manuell". (Prosa in Handbüchern).

Ein reiner Prompt (selbst mit riesigem Kontext-Fenster) wird hier scheitern oder halluzinieren, wenn wir ihm 500 Seiten Handbuch geben.

---

## Die 3 Architektur-Vorschläge

### 1. Proposal A: "Context-as-Code" (Die Config-Datei) 📄

Wir kondensieren das Wissen manuell in strukturierte JSON-Dateien.

- **Wie es funktioniert:**
  - `systems.json`: Eine Liste von Systemen und ihren unterstützten Nachrichten-Typen.
  - `processes.json`: Kurze Zusammenfassungen der Prozesse.
  - **Laufzeit:** Der `T2ImpactSkill` lädt diese JSONs und injiziert sie direkt in den Prompt.
- **Vorteile:** 100% Deterministisch. Keine Halluzinationen. Einfach zu implementieren.
- **Nachteile:** Manueller Pflegeaufwand. Man muss das Handbuch lesen und "übersetzen". Kann keine komplexen Prosa-Fragen beantworten.

### 2. Proposal B: "Local RAG" (Der Bibliothekar) 📚

Wir nutzen eine Vektor-Datenbank (ChromaDB), um Dokumente durchsuchbar zu machen.

- **Wie es funktioniert:**
  - Du wirfst die PDFs (TPH-Handbuch, Prozess-Doku) in einen Ordner `customer_docs/`.
  - Der Agent indiziert diese (Embeddings).
  - **Laufzeit:** Wenn der Agent "pacs.008" analysiert, fragt er die DB: _"Was steht in den Handbüchern über pacs.008?"_ und bekommt die relevanten Absätze.
- **Vorteile:** Skaliert auf Tausende Seiten. Automatische Aufnahme von Wissen.
- **Nachteile:** "Fuzzy" (unscharf). Manchmal findet er die Info nicht. Vektor-Suche versteht keine harten logischen Abhängigkeiten ("Wenn A, dann zwingend B").

### 3. Proposal C: "The Structured Brain" (Hybrid: Graph + RAG) 🧠 ✨

Wir kombinieren harte Abhängigkeiten mit weicher Suche.

- **Wie es funktioniert:**
  - **Layer 1 (The Graph):** Eine schlanke `dependency_map.json` definiert harte Links: `TPH -> [pacs.008, camt.053]`. Das injizieren wir IMMER.
  - **Layer 2 (The Library):** Für Details ("Wie läuft der Embargo-Check?") nutzt der Agent RAG (ChromaDB).
  - **Laufzeit:**
    1.  Router checkt Graph: "Aha, pacs.008 Änderung betrifft TPH."
    2.  Router fragt RAG: "Gibt es spezielle TPH-Regeln für pacs.008 Felder?"
- **Vorteile:** Best of both worlds. Präzise Impact-Analyse (Graph) + Tiefe Prozess-Details (RAG).
- **Nachteile:** Aufwändigste Implementierung.

---

## Bewertung & Favorit 🏆

### Mein Favorit: Proposal C (Hybrid), aber gestuft.

Warum?

- Bank-IT ist **binär**: Entweder das System nutzt die Nachricht oder nicht. Das darf kein RAG "vielleicht" finden. Das braucht eine harte Config (Layer 1).
- Prozesse sind **nuanciert**: "Embargo" ist komplex beschreiben. Das passt nicht in JSON. Das braucht RAG (Layer 2).

### Empfohlene Roadmap

1.  **Phase 10 (MVP):** Wir starten mit **Proposal A (Context-as-Code)**.
    - Wir bauen eine `kfw_infrastructure.json`. Das deckt 80% des "Technical Report" ab (welches System ist betroffen?).
    - Das ist robust, schnell und deckt die "Harten Fakten" ab.

2.  **Phase 11/12 (Scale):** Wir erweitern um **RAG**.
    - Wir füttern Prozess-Handbücher in ChromaDB.
    - Der Agent lernt, dort nachzuschlagen ("Function Calling"), wenn er im Graph nicht weiterkommt.

**Entscheidung:** Wir sollten in Phase 10 die Infrastruktur für **Config-Injection** (`T2Config` im Design-Dokument) bauen, aber Schnittstellen für einen späteren RAG-Client offenhalten.
