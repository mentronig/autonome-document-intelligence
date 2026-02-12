import { z } from 'zod';

export interface ISkill<TConfig = unknown, TChunkResult = unknown, TFinalResult = TChunkResult> {
  // Metadata
  id: string; // e.g., "t2-impact-analyzer"
  name: string; // e.g., "T2 Impact Analysis"
  description: string; // e.g., "Analyzes T2 Release notes for KfW infrastructure impacts."

  // 1. Context Injection (Config)
  // Replaces "Step 2.3 KfW-Infrastruktur" from Master Prompt
  configure(config: TConfig): void;

  // 2. Prompt Engineering (Dynamic)
  // Replaces "Step 3: Rollendefinitionen".
  // `chunkText` is the current PDF page content.
  // `context` is optional runtime context (like accumulated state).
  generatePrompt(chunkText: string, context?: Record<string, unknown>): string;

  // 3. Validation (Type Safety)
  // Replaces "Output-Struktur" instructions in Master Prompt.
  // Returns a Zod schema to validate the LLM's JSON output.
  getOutputSchema(): z.ZodSchema<TChunkResult>;

  // 4. Aggregation Logic
  // Replaces manual copy-pasting of results.
  // Merges results from multiple chunks (pages) into one final report.
  mergeResults(results: TChunkResult[]): TFinalResult;

  // 5. Reporting
  formatReport(result: TFinalResult): string;
}
