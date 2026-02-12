# Technical Design: Phase 10 - Skill Architecture 🏗️

**Status:** Draft
**Target:** To translate the "Master Prompt" into a robust, type-safe software architecture.

## 1. Core Architecture Interfaces

We move from "String Templates" to "Class-based Skills".

### 1.1 `ISkill` Interface

Every skill (Use Case) must implement this contract.

```typescript
import { z } from 'zod';

export interface ISkill<TConfig = any, TResult = any> {
  // Metadata
  id: string; // e.g., "t2-impact-analyzer"
  name: string; // e.g., "T2 Impact Analysis"
  description: string; // e.g., "Analyzes T2 Release notes for KfW infrastructure impacts."

  // 1. Context Injection (Config)
  // Replaces "Step 2.3 KfW-Infrastruktur" from Master Prompt
  configure(config: TConfig): void;

  // 2. Prompt Engineering (Dynamic)
  // Replaces "Step 3: Rollendefinitionen"
  generatePrompt(chunkText: string, context?: any): string;

  // 3. Validation (Type Safety)
  // Replaces "Output-Struktur" instructions in Master Prompt
  getOutputSchema(): z.ZodSchema<TResult>;

  // 4. Aggregation Logic
  // Replaces manual copy-pasting of results
  mergeResults(results: TResult[]): TResult;
}
```

### 1.2 `SkillManager`

Responsible for selecting and executing the right skill.

```typescript
export class SkillManager {
  private skills: Map<string, ISkill> = new Map();

  register(skill: ISkill) { ... }
  getSkill(id: string): ISkill { ... }

  // Later: Auto-detect skill based on document content?
  detectSkill(documentSample: string): string | null { ... }
}
```

---

## 2. Deep Dive: `T2ImpactSkill` (The "Master Prompt" Mapping) 🏦

Here is how we translate the specific instructions from `Master Prompt v1.1.3` into Code.

### 2.1 Configuration (`T2Config`)

_From "Schritt 2: Konfiguration"_

```typescript
interface T2Config {
  bankName: string; // "KfW"

  // "2.1 KfW T2-Komponenten"
  components: {
    name: string; // "TPH"
    type: 'fachlich' | 'technisch';
    keywords: string[]; // ["Travic Payment Hub", "Settlement"]
  }[];

  // "2.2 ISO20022 MX-Nachrichten"
  managedMessages: string[]; // ["pacs.008", "camt.053", ...]
}
```

### 2.2 The Prompt Logic (`generatePrompt`)

_From "Schritt 3: Rollendefinitionen"_

Instead of sending the _entire_ Master Prompt (which is too huge), we generate smaller, focused prompts for each chunk.

```typescript
generatePrompt(chunk: string): string {
  return `
    ROLE: Senior Business Analyst (T2/ISO20022 Expert).
    TASK: Analyze the following text chunk for impacts on SPECIFIC systems.

    // Injected from Config
    RELEVANT SYSTEMS: ${this.config.components.map(c => c.name).join(', ')}
    RELEVANT MESSAGES: ${this.config.managedMessages.join(', ')}

    // From "Verbot-Liste"
    CONSTRAINT: Do NOT use technical XPaths/XSD details. Focus on Business Process.

    INPUT TEXT:
    "${chunk}"
  `;
}
```

### 2.3 The Schema (`zod`)

_From "Schritt 5: Analyse Durchführen / Output-Struktur"_

We force the LLM to output structured data, not Markdown tables. We generate the Markdown later.

```typescript
const T2AnalysisSchema = z.object({
  crs: z.array(z.object({
    id: z.string(), // "T2-XXXX"
    title: z.string(),

    // "Relevanzmodell (40% Structure, 25% Payment...)"
    // We let the Model categorize, but WE calculate the final score in code?
    // OR we let the model output the sub-scores.
    scores: z.object({
      structure_change: z.number().min(0).max(3),
      payment_flow_impact: z.number().min(0).max(3),
      technical_impact: z.number().min(0).max(3),
      regulatory_impact: z.number().min(0).max(3)
    }),

    // "Betroffene Prozesse"
    affected_processes: z.array(z.string()),

    // "Erforderliche Anpassungen" -> Explicitly linked to Systems
    adjustments: z.array(z.object({
      system: z.enum(['TPH', 'DWH', 'ESMIG', ...]), // Validated against Config!
      description: z.string()
    }))
  }))
});
```

### 2.4 The Aggregation (`mergeResults`)

_From "Phase 3: Management Report"_

When `AgentCore` finishes all chunks, this function runs:

1.  **Deduplicate** CRs (if T2-1234 appears on page 5 and 10).
2.  **Calculate Scores** (JavaScript): `TotalScore = (s.structure * 0.4) + ...`.
    - _Advantage:_ JavaScript doesn't make math errors. LLMs do.
3.  **Generate Markdown:**
    - Creates the "BA Report", "Tech Report", and "Management Summary" from the JSON data.

## 3. Implementation Plan

1.  **Create Interface:** `src/engine/types/skill.ts`
2.  **Create Manager:** `src/engine/skill-manager.ts`
3.  **Implement T2 Skill:** `src/skills/library/t2-impact-skill.ts`
    - Defining the `Zod` schema.
    - Implementing the `configure(config: T2Config)` method.

## 4. Multi-Client Flexibility (Scalability) 🌍

The core strength of this architecture is the separation of **Logic (Skill)** and **Data (Context)**.
You can run the same agent for 10 different banks without changing a single line of code.

### Example: Switching Contexts

**Bank A (KfW):** `config/kfw.json`

```json
{
  "bankName": "KfW",
  "components": [
    { "name": "TPH", "type": "technical", "keywords": ["Travic", "Payment Hub"] },
    { "name": "ESMIG", "type": "technical", "keywords": ["Gateway"] }
  ]
}
```

**Bank B (Sparkasse):** `config/sparkasse.json`

```json
{
  "bankName": "Sparkasse",
  "components": [
    { "name": "OSPlus", "type": "technical", "keywords": ["Kernbank", "OSPlus"] },
    { "name": "S-Pay", "type": "fachlich", "keywords": ["Zahlungsverkehr"] }
  ]
}
```

**Runtime:**
`agent.run(pdf, { skill: "t2-impact", config: "./config/sparkasse.json" })`

The agent now seamlessly "speaks" Sparkasse (OSPlus) instead of KfW (TPH).
