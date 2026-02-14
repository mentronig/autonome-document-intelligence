import { z } from 'zod';
import { ISkill } from '../types/ISkill';

// Define the Result Interface (matches T2Analyzer)
export interface PBI {
  id: string;
  description: string;
  impact: string;
  module?: string;
}

export interface ReleaseAuditorResult {
  pbis: PBI[];
  crs: string[];
  summary: string;
}

// Define the Zod Schema
const PbiSchema = z.object({
  id: z.string(),
  description: z.string(),
  impact: z.string(),
  module: z.string().optional(),
});

const ResultSchema = z.object({
  pbis: z.array(PbiSchema),
  crs: z.array(z.string()),
  summary: z.string(),
});

export class ReleaseAuditorSkill implements ISkill<void, ReleaseAuditorResult> {
  id = 'release-auditor';
  name = 'Release Auditor';
  description =
    'Analyzes T2 Release notes for Production Problems (PBIs) and Change Requests (CRs).';

  configure(): void {
    // No config needed for existing logic yet
  }

  generatePrompt(chunkText: string): string {
    return `
You are an expert T2 Release Note Analyst.
Your task is to extract "Production Problems" (PBIs) and "Change Requests" (CRs) from the provided text.
Also provide a brief summary.

INSTRUCTIONS:
1. Identify all PBIs. They usually have IDs like PBI-xxxxxx or similar.
2. Identify all CRs. They usually have IDs like CR-xxxx.
3. For each PBI, extract the Description and assess the Impact (High/Medium/Low).
4. Return the result strictly as valid JSON.

FORMAT:
{
  "pbis": [
    { "id": "PBI-...", "description": "...", "impact": "...", "module": "..." }
  ],
  "crs": ["CR-..."],
  "summary": "..."
}

TEXT TO ANALYZE:
${chunkText}
`;
  }

  getOutputSchema(): z.ZodSchema<ReleaseAuditorResult> {
    return ResultSchema;
  }

  mergeResults(results: ReleaseAuditorResult[]): ReleaseAuditorResult {
    const merged: ReleaseAuditorResult = {
      pbis: [],
      crs: [],
      summary: '',
    };

    const seenPbis = new Set<string>();
    const seenCrs = new Set<string>();

    for (const res of results) {
      // Merge PBIs (Deduplicate by ID)
      for (const pbi of res.pbis) {
        if (!seenPbis.has(pbi.id)) {
          merged.pbis.push(pbi);
          seenPbis.add(pbi.id);
        }
      }

      // Merge CRs (Deduplicate)
      for (const cr of res.crs) {
        if (!seenCrs.has(cr)) {
          merged.crs.push(cr);
          seenCrs.add(cr);
        }
      }

      // Merge Summary (Concat)
      if (res.summary) {
        merged.summary += res.summary + '\n';
      }
    }

    return merged;
  }

  formatReport(result: ReleaseAuditorResult): string {
    return `
## Executive Summary
${result.summary}

## Identified Issues
### Production Problems (PBIs)
${result.pbis.map((p) => `- **${p.id}**: ${p.description} (Impact: ${p.impact})`).join('\n')}

### Change Requests (CRs)
${result.crs.map((c) => `- ${c}`).join('\n')}
`;
  }
}
