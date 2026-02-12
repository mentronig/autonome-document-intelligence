# 📘 Agenten-Entwicklung für Einsteiger: Ein Leitfaden

Willkommen im Team! Dieser Guide erklärt dir Schritt für Schritt, wie wir sicherstellen, dass unser KI-Agent zuverlässig arbeitet.

## 1. Warum Testen wir Agenten?

KI-Modelle (wie GPT-4 oder in unserem Fall `llama3`) sind **nicht deterministisch**. Das heißt:

- Wenn du `print("Hallo")` schreibst, kommt immer _"Hallo"_.
- Wenn du die KI fragst _"Fasse diesen Text zusammen"_, kommt heute eine kurze und morgen eine lange Antwort.

**Das Problem:** Wir bauen Software, die sich auf diese wackeligen Antworten verlässt.
**Die Lösung:** Tests dienen als "Leitplanken". Wir prüfen nicht, _ob_ die KI kreativ ist, sondern _ob_ sie das Format einhält (z.B. "Ist das Ergebnis valides JSON?").

## 2. Deine Werkzeuge

Wir nutzen zwei Hauptwerkzeuge:

1.  **Jest (TypeScript):** Unser "Prüfer". Er führt den Agenten aus und checkt das Ergebnis.
2.  **pdfplumber (Python):** Unser "Auge". Es liest die PDF-Dateien, die der Agent verarbeiten soll.

## 3. Workflow: Wie füge ich ein neues Sample hinzu?

Du hast echte EZB-Dokumente. Großartig! So nutzen wir sie sicher:

### Schritt A: Datei ablegen

Lege die PDF-Datei in den Ordner `tests/samples/`.

> **WICHTIG:** Wenn die Datei vertraulich ist (DSGVO/Bankgeheimnis), darf sie NIEMALS zu GitHub hochgeladen werden! Füge sie zur `.gitignore` hinzu, wenn du unsicher bist.

### Schritt B: Einen Test schreiben

Wir erstellen eine Datei in `tests/integration/` (z.B. `ecb_request.test.ts`).

```typescript
import { AgentCore } from '../../agent-core/src/AgentCore';

describe('EZB Change Request Analyse', () => {
  it('sollte die wichtigsten Metadaten extrahieren', async () => {
    // 1. Agenten starten
    const agent = new AgentCore();

    // 2. Das PDF verarbeiten lassen
    const result = await agent.processFile('tests/samples/ecb_change_request_001.pdf');

    // 3. Prüfen (Assertions)
    expect(result).toBeDefined();
    expect(result.summary).toContain('EZB'); // Prüfen, ob "EZB" im Text vorkommt
    expect(result.status).toBe('COMPLETED');
  });
});
```

### Schritt C: Test ausführen

Öffne das Terminal und tippe:

```bash
cd agent-core
chcp 65001
npm test
```

Du wirst sehen:

- **GRÜN (PASS):** Alles gut. Der Agent hat verstanden.
- **ROT (FAIL):** Der Agent hat Quatsch gemacht. Wir müssen den Prompt anpassen.

> **Pro-Tipp:** Wenn dich die vielen Ausgaben stören, nutze `npm run test:quiet`. Dann siehst du nur das Ergebnis.

## 4. Was tun bei Fehlern?

Wenn ein Test rot ist, hast du zwei Möglichkeiten:

1.  **Prompt Engineering:** Verbessere die Anweisungen an die KI (in `agent-core/src/prompts/`).
2.  **Code Logik:** Vielleicht ist der Python-Parser abgestürzt? Schau in die Logs.

## 5. Tipps für Windows-Nutzer

Falls die Ausgabe "komische Zeichen" (wie `âˆš`) anzeigt:

- Nutze am besten **PowerShell 7**.
- Falls du die alte PowerShell nutzt, gib vorher `chcp 65001` ein, um die Zeichenkodierung auf UTF-8 zu setzen.

---

---

## 6. Exkurs: Unit-Tests & Die Kunst des "Mocking"

Neben den Integrationstests (die echte PDFs lesen) haben wir jetzt auch **Unit-Tests** (`tests/unit/`).

### Was ist der Unterschied?

- **Integrationstest:** Prüft das _ganze Auto_. Springt der Motor an? Drehen sich die Räder? (Langsam, braucht Benzin/PDFs).
- **Unit-Test:** Prüft _nur die Zündkerze_. Funktioniert sie isoliert? (Superschnell).

### Das Problem mit dem Agenten

Unser `AgentCore` ist wie ein Regisseur. Er ruft:

1.  "Kamera!" (PDF laden)
2.  "Action!" (Ollama fragen)

Wenn wir das testen wollen, haben wir zwei Probleme:

1.  **PDF laden** dauert lange.
2.  **Ollama** ist vielleicht gerade offline oder gibt heute eine andere Antwort als gestern.

### Die Lösung: "Stunt-Doubles" (Mocking)

Wir benutzen **Mocks**. Das sind "Stunt-Doubles" für unsere Werkzeuge.

Im Test (`agent_core.test.ts`) siehst du Code wie diesen:

```typescript
// 1. Wir sagen Jest: "Benutze NICHT das echte PDF-Tool, sondern eine Attrappe"
jest.mock('../../agent-core/src/skills/ingestion/pdf-loader');

// 2. Wir programmieren die Attrappe
MockPdfLoader.prototype.loadPdf.mockResolvedValue({
  text: 'Hallo Welt', // Wir tun so, als stünde das im PDF
  metadata: { totalPages: 1 },
});
```

**Was passiert hier?**
Wenn der Agent jetzt läuft und `loadPdf` aufruft, geht er **nicht** zur Festplatte. Stattdessen springt der "Stunt-Double" ein und ruft sofort: _"Ich habe den Text 'Hallo Welt' gefunden!"_.

**Warum machen wir das?**

- **Geschwindigkeit:** Der Test läuft in Millisekunden.
- **Stabilität:** Der Test funktioniert auch im Flugzeug ohne Internet (weil wir Ollama auch "mocken").
- **Fokus:** Wenn der Test fehlschlägt, wissen wir: Es liegt an der _Logik_ des Agenten, nicht daran, dass das Internet weg war.
