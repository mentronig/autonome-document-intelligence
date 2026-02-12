import { OllamaClient } from '../../infrastructure/ollama-client';

export interface PBI {
  id: string;
  description: string;
  impact: string;
  module?: string;
}

export interface AnalysisResult {
  pbis: PBI[];
  crs: string[];
  summary: string;
}

export class T2Analyzer {
  private ollama: OllamaClient;

  constructor(ollama: OllamaClient) {
    this.ollama = ollama;
  }

  async analyze(text: string, context: string = ''): Promise<AnalysisResult> {
    const prompt = `
You are an expert T2 Release Note Analyst.
Your task is to extract "Production Problems" (PBIs) and "Change Requests" (CRs) from the provided text.
Also provide a brief summary.

CONTEXT / PREVIOUS CRITIQUE:
${context}

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
${text}
`;

    try {
      const response = await this.ollama.generateCompletion(prompt);
      // Basic cleanup to find JSON if model chats around it
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Error in T2Analyzer:', error);
      throw error;
    }
  }
}
