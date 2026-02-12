# Analyse: T2 Impact Analysis Use Case 🏦

**Status:** Review
**Basis:** User Input & `Master Prompt v1.1.3`

## 1. Mehrwert-Bewertung (Value Proposition) 💎

**Dein Ansatz:**
Du lieferst nicht nur eine "Zusammenfassung" (Commodity), sondern eine **kontextbezogene Auswirkungsanalyse** für eine spezifische Banken-Infrastruktur (KfW-Kontext: TPH, ZV-Systeme, Meldewesen).

**Bewertung:**

- **Hoher Wert:** Generische KI sagt: "Feld X ändert sich". Dein Agent sagt: _"Feld X ändert sich -> TPH-Mapping muss angepasst werden -> Testaufwand Hoch -> Kritisch für Release."_
- **USP:** Das Wissen um die _Abhängigkeiten_ (z.B. "ESMIG-Änderungen sind technisch relevant, aber fachlich für den BA egal") ist der echte Mehrwert. Das kann ein Standard-LLM ohne diesen Kontext nicht wissen.
- **Persona-Splitting:** Die Trennung in BA (Fachlich), Engineer (Technisch) und Manager (Entscheidung) ist exzellent und spiegelt reale Bank-Prozesse wider.

## 2. Markttauglichkeit (Market Viability) 🚀

**Analyse:**

- **Nische:** Target2/SWIFT-Teilnehmer (Banken, Finanzdienstleister).
- **Schmerzpunkt:** Release Notes sind hunderte Seiten lang, kryptisch und kommen 2x im Jahr. Manuelle Analyse kostet Tage/Wochen von teuren Experten.
- **Produkt-Fit:** Ein Agent, der diese Analyse zu 80% automatisiert und direkt "Bank-Sprech" (TPH, ZV, Reporting) spricht, spart massive Kosten und reduziert das Risiko, kritische Änderungen zu übersehen.
- **Skalierbarkeit:** Das Modell ist auf andere Banken übertragbar, wenn man die "Infrastruktur-Konfiguration" (Schritt 2.3 im Prompt) austauschbar macht.

**Urteil:** **Sehr hoch markttauglich.** Es ist ein klassisches B2B-Vertical-SaaS/Agent-Szenario.

## 3. Kritische Analyse: Master Prompt (Step-by-Step) 🧐

Ich habe `Master Prompt v1.1.3` analysiert.

**Stärken:**

- ✅ **Klare Rollentrennung:** Prompt zwingt das LLM in spezifische Perspektiven.
- ✅ **Negativ-Listen:** "VERBOT-Liste" (kein XPath im BA-Report) ist sehr stark, um Halluzinationen/Techno-Babble zu verhindern.
- ✅ **Explizites Domänenwissen:** Die Listen der ISO20022-Nachrichten (pacs, camt) und Systemkomponenten (TPH, ESMIG) geben dem LLM den nötigen Rahmen.
- ✅ **Relevanz-Formel:** Die Berechnungslogik (0.4 \* Struktur + ...) ist ein guter Versuch, "Gefühl" in "Zahlen" zu verwandeln.

**Schwächen / Risiken (für die Automatisierung):**

1.  **Token-Limit & Gedächtnis:** Der Prompt ist riesig. Wenn das PDF auch noch 50 Seiten hat, vergessen lokale Modelle (Llama3) oft die Anweisungen vom Anfang (z.B. die Formel).
2.  **Rechenschwäche:** LLMs sind schlecht im Rechnen ("Score = 2 \* 0.4 + ..."). Hier halluzinieren sie oft Ergebnisse.
3.  **Halluzinierte Referenzen:** "Siehe Abschnitt 2.3" funktioniert im Chat, aber wenn der Agent das PDF in Chunks liest, verliert er den Bezug zu "Kapitel 2.3 des Prompts".
4.  **Kontext-Verlust beim Chunking:** Wenn eine Änderung auf Seite 5 beschrieben wird, aber die Auswirkung ("TPH betroffen") aus dem Prompt kommt, muss der Agent diese Verbindung aktiv herstellen. Das ist bei "dummem" Chunking schwer.

## 4. Integration in Phase 10 v2 (Skill Architecture) 🏗️

Wir bauen diesen Use Case nicht als Text-Prompt, sondern als **`T2ImpactSkill`**.

### Das Skill-Design

```typescript
class T2ImpactAnalysisSkill implements ISkill {
  // 1. Kontext-Injektion (Der "Bank-Kontext")
  // Statt fest im Prompt, laden wir das aus einer Config ("kfw_infrastructure.json")
  private context = {
    systems: ['TPH', 'Meldewesen', 'OMT'],
    iso_families: ['pacs', 'camt'],
  };

  // 2. Prompt-Generierung (Dynamisch)
  generatePrompt(chunk: string): string {
    // Wir injizieren NUR den relevanten Kontext für den Chunk, um Token zu sparen.
    return `
            Analysiere diesen Text-Ausschnitt auf T2-Änderungen.
            Kontext: Unsere Systeme sind ${this.context.systems.join(', ')}.
            ...
        `;
  }

  // 3. Validierung (Type Safety)
  // Wir zwingen das LLM, strukturiert zu antworten, nicht als Freitext-Report.
  schema = z.object({
    cr_id: z.string(),
    impact_score: z.number(), // Wir lassen das LLM schätzen...
    affected_systems: z.array(z.string()), // ...aber wir validieren die Systeme gegen unsere Liste!
    breaking_change: z.boolean(),
  });

  // 4. Aggregation & Berechnung (Code statt LLM)
  mergeResults(results: AnalysisResult[]): FinalReport {
    // HIER berechnen wir den Score!
    // Wir verlassen uns nicht auf das LLM für Mathe.
    // Das LLM liefert Indikatoren ("Feld entfällt"), der Code berechnet:
    // if (field_removed) score += 3 * 0.4;
    return generateReports(results);
  }
}
```

**Vorteile der Integration:**

1.  **Rechnen im Code:** Der Agent berechnet den Score deterministisch (JavaScript), nicht das LLM (Gefühl).
2.  **Konfigurierbarkeit:** Du kannst den Skill für "Bank B" nutzen, indem du nur die `systems_config.json` tauschst.
3.  **Präzision:** Wir validieren, ob das LLM wirklich "TPH" sagt und nicht "The Payment Hub", indem wir gegen die Config matchen.

---

**Fazit:**
Dein Use Case ist **Gold wert**.
Aber als reiner Prompt (Textdatei) ist er fragil.
Als **Skill (Code + Prompt)** wird er skalierbar und zuverlässig.
