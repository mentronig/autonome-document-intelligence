# Konzept: Phase 10 v2 - "The Skill Architecture" (Skill-Plugins) 🧩

**Status:** Draft
**Ziel:** Generalisierung ohne Verlust von Qualität/Robustheit.

Anstatt unsicherer Text-Templates ("Masken") führen wir **"Skill Plugins"** ein.

## 1. Die Kern-Idee: Code > Text

Ein "Skill" ist nicht nur ein Prompt, sondern ein kleines **Logik-Modul**.
Es definiert drei Dinge streng:

1.  **Den Prompt** (Wie fragt man das LLM?)
2.  **Das Schema/Validierung** (Was muss zurückkommen? Ist die IBAN valide?)
3.  **Die Aggregation** (Wie fügt man Seite 1 und Seite 5 zusammen?)

## 2. Struktur eines Skills (`interface ISkill`)

```typescript
interface AnalysisSkill {
  id: string; // z.B. "invoice-scanner"
  description: string;

  // 1. Prompting Strategy
  generatePrompt(chunk: string): string;

  // 2. Validation (Zod Schema)
  outputSchema: ZodSchema;

  // 3. Merge Logic (Critical for Chunking!)
  mergeResults(results: any[]): any;
}
```

## 3. Beispiele

### 🛡️ Skill A: "Release Auditor" (Unser aktueller Stand)

- **Prompt:** "Suche PBIs..."
- **Schema:** `{ pbis: PBI[], crs: string[] }`
- **Merge:** `ListConcatenation` (Einfach alle Listen zusammenfügen).

### 💰 Skill B: "Invoice Scanner" (Neu)

- **Prompt:** "Suche Rechnungssumme und Datum..."
- **Schema:** `{ total: number, date: string, iban?: string }`
- **Merge:** `SmartObjectMerge`
  - Wenn Seite 1 `{ total: 500 }` hat und Seite 2 `{ total: null }` -> Nimm 500.
  - Wenn Seite 1 `{ total: 500 }` und Seite 2 `{ total: 600 }` -> **Konflikt!** (Melde Warnung oder nimm das Höchste/Letzte).

## 4. Vorteile gegenüber Templates (v1)

1.  **Sicherheit:** Wir können `zod` nutzen, um sicherzustellen, dass das LLM keinen Müll liefert. Wenn die Validierung fehlschlägt, können wir das LLM _automatisch_ bitten, es zu korrigieren ("Reflexion Loop").
2.  **Kontext-Lösung:** Die `mergeResults`-Funktion löst das Problem, dass Informationen auf verschiedenen Seiten verteilt sind. Das ist mit reinem JSON-Merging unmöglich.
3.  **Testbarkeit:** Jeder Skill kann einzeln mit Unit-Tests geprüft werden ("Erkennt er die Rechnung X?").

## 5. Umsetzung in der CLI

Der User wählt nicht mehr `--template invoice`, sondern `--skill invoice`.
Skills liegen als `.ts` (oder kompilierte `.js`) Dateien in `agent-core/src/skills/library/`.

Das ist zwar etwas "technischer" (man muss TypeScript/JS schreiben statt nur JSON), aber für ein **Enterprise-Produkt** ist Robustheit wichtiger als dass _jeder_ Laie es konfigurieren kann.
(Für Laien bauen wir später eine UI, die diese Files generiert).
