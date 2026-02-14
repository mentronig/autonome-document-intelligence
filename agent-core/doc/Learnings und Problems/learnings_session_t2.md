# Learnings: T2 Impact Analyzer Integration

## 1. LLM Sprache vs. Datenstruktur
**Learning:**
Bei der Anweisung an LLMs, Ausgaben in einer bestimmten Sprache (z.B. Deutsch) zu generieren, muss **explizit** zwischen Inhalt (Values) und Struktur (Keys) unterschieden werden. LLMs neigen dazu, "alles" zu übersetzen, inklusive technischer Feldnamen, wenn nicht strikt untersagt.
**Best Practice:**
Immer eine explizite "DO NOT TRANSLATE JSON KEYS" Regel in den System-Prompt aufnehmen, wenn die Ausgabesprache von der Codesprache abweicht.

## 2. Zod Transformationen für Robustheit
**Learning:**
Anstatt vom LLM perfekte Konformität zu verlangen (was "flaky" sein kann), ist es robuster, das Schema flexibler zu gestalten.
**Best Practice:**
Verwendung von `z.union` und `.transform()` in Zod, um Synonyme oder übersetzte Begriffe (z.B. `Niedrig` -> `Low`) direkt bei der Validierung zu normalisieren. Dies verlagert die Komplexität vom Prompt-Engineering (unsicher) in den Code (deterministisch).

## 3. Tooling-Fallen (ts-node & JS Artefakte)
**Learning:**
In einer gemischten Umgebung (TypeScript Source, aber existierende JS Build-Artefakte im selben Ordner) kann `ts-node` verwirrt werden und veralteten Code ausführen.
**Best Practice:**
Regelmäßiges Bereinigen (`clean`) von Build-Artefakten, besonders wenn unerklärliche Fehler auftreten, die scheinbar Code-Änderungen ignorieren. Vorzugsweise Output-Dir (`dist/`) strikt von Source-Dir (`src/`) trennen.

## 4. Frontend Rendering Strategien
**Learning:**
Wenn das Backend Markdown liefert (was für LLMs natürlich ist), sollte das Frontend darauf vorbereitet sein. Rohes Einfügen wirkt kaputt.
**Best Practice:**
Standardmäßige Integration eines Markdown-Parsers (wie `marked` oder `markdown-it`) in Frontend-Komponenten, die LLM-Output anzeigen, sowie passendes CSS für Standard-HTML-Tags (`table`, `ul`, `h1-h3`), die im Markdown vorkommen.
