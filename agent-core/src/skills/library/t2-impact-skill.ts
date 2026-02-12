import { z } from 'zod';
import { ISkill } from '../types/ISkill';
import {
  T2Config,
  T2ChunkResult,
  T2ChunkResultSchema,
  T2ChangeRequest,
  T2ImpactAnalysisResult,
  ImpactScores,
} from './t2-types';

export class T2ImpactSkill implements ISkill<T2Config, T2ChunkResult, T2ImpactAnalysisResult> {
  id = 't2-impact-analyzer';
  name = 'T2 Impact Analyzer';
  description =
    'Analyzes T2 Release Notes for architectural impacts on specific bank infrastructure.';

  private config: T2Config | undefined;

  configure(config: T2Config): void {
    this.config = config;
  }

  generatePrompt(chunkText: string, _context?: Record<string, unknown>): string {
    if (!this.config) {
      throw new Error('T2ImpactSkill not configured! Call configure() first.');
    }

    const systemList = this.config.components.map((c) => `${c.name} (${c.type})`).join(', ');
    const messageList = this.config.managedMessages.join(', ');

    return `
ROLE: Senior Business Analyst & Technical Architect (T2/ISO20022 Expert).
TASK: Analyze the provided text chunk for impacts on OUR SPECIFIC INFRASTRUCTURE.

CONTEXT (${this.config.bankName}):
- Systems: ${systemList}
- Relevant Messages: ${messageList}

INSTRUCTIONS:
1. Identify Change Requests (CRs) described in the text.
2. For each CR, analyze the impact on our systems based on 4 criteria (0-3 score):
   - Structure Change (0=None, 3=Breaking/Removal)
   - Payment Flow Impact (0=None, 3=Core Flow Blocked)
   - Technical Impact (0=None, 3=Multiple Systems need Update)
   - Regulatory Impact (0=None, 3=Mandatory)
3. Identify which specific systems (from the list above) need adjustment.
4. Assess if it is a BREAKING CHANGE.

CONSTRAINT:
- Do NOT hallucinate systems not in the list.
- If a field is removed, Structure Change MUST be 3.

OUTPUT FORMAT (JSON):
{
  "found_crs": [
    {
      "id": "T2-xxxx",
      "title": "...",
      "description": "Business concise description...",
      "scores": { "structure_change": 0-3, "payment_flow_impact": 0-3, "technical_impact": 0-3, "regulatory_impact": 0-3 },
      "breaking_change": true/false,
      "affected_processes": ["..."],
      "adjustments": [ { "system": "TPH", "description": "...", "effort": "Medium" } ]
    }
  ],
  "summary_fragment": "..."
}

TEXT TO ANALYZE:
${chunkText}
`;
  }

  getOutputSchema(): z.ZodSchema<T2ChunkResult> {
    return T2ChunkResultSchema;
  }

  mergeResults(chunkResults: T2ChunkResult[]): T2ImpactAnalysisResult {
    const crMap = new Map<string, T2ChangeRequest>();
    let fullSummary = '';

    for (const chunk of chunkResults) {
      if (chunk.summary_fragment) {
        fullSummary += chunk.summary_fragment + '\n';
      }

      for (const cr of chunk.found_crs) {
        // Simple deduplication: Last write wins for now, or merge?
        // Ideally we'd merge the descriptions, but for MVP we overwrite or ignore duplicates if identical.
        // Let's assume CRs might be split across chunks, but usually a CR is described in one place.
        // We'll update if we see it again, assuming later chunks might have more detail?
        // Or just keep the first one. Let's keep the one with higher total score (most pessimistic).

        const existing = crMap.get(cr.id);
        const currentScore = this.calculateTotalScore(cr.scores);

        let shouldUpdate = true;
        if (existing) {
          const existingScore = this.calculateTotalScore(existing.scores);
          if (existingScore >= currentScore) {
            shouldUpdate = false;
          }
        }

        if (shouldUpdate) {
          // Calculate proper category before storing
          const category = this.calculateCategory(currentScore);

          // We need to cast the Zod result (which lacks category) to the full internal type
          // The Zod schema for input doesn't enforce category, we compute it.
          const fullCR: T2ChangeRequest = {
            ...cr,
            impact_category: category,
            scores: cr.scores, // Ensure structure matches
            adjustments: cr.adjustments.map((a) => ({
              ...a,
              effort: a.effort as 'Low' | 'Medium' | 'High',
            })),
          } as T2ChangeRequest;

          crMap.set(cr.id, fullCR);
        }
      }
    }

    const allCrs = Array.from(crMap.values());

    // Sort by impact (Critical first)
    const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1, None: 0 };
    allCrs.sort((a, b) => severityOrder[b.impact_category] - severityOrder[a.impact_category]);

    return {
      executive_summary: fullSummary.trim(),
      crs: allCrs,
      stats: {
        total_crs: allCrs.length,
        critical: allCrs.filter((c) => c.impact_category === 'Critical').length,
        high: allCrs.filter((c) => c.impact_category === 'High').length,
        medium: allCrs.filter((c) => c.impact_category === 'Medium').length,
        low: allCrs.filter((c) => c.impact_category === 'Low').length,
      },
    };
  }

  formatReport(result: T2ImpactAnalysisResult): string {
    return `
# T2 Analysis Report (Bank Context: ${this.config?.bankName || 'Unknown'})

## Executive Summary
${result.executive_summary}

## Impact Statistics
- **Total CRs:** ${result.stats.total_crs}
- **🚨 Critical:** ${result.stats.critical}
- **⚠️ High:** ${result.stats.high}
- **📋 Medium:** ${result.stats.medium}
- **📌 Low:** ${result.stats.low}

## Detailed CR Analysis

${result.crs.map((cr) => this.formatCR(cr)).join('\n\n---\n\n')}
`;
  }

  private formatCR(cr: T2ChangeRequest): string {
    const score = this.calculateTotalScore(cr.scores).toFixed(2);
    const icon =
      cr.impact_category === 'Critical'
        ? '🚨'
        : cr.impact_category === 'High'
          ? '⚠️'
          : cr.impact_category === 'Medium'
            ? '📋'
            : '📌';

    return `### ${icon} ${cr.id}: ${cr.title}
**Impact Category:** ${cr.impact_category} (Score: ${score})
**Breaking Change:** ${cr.breaking_change ? '❌ YES' : '✅ No'}

**Description:**
${cr.description}

**Scores:**
- Structure: ${cr.scores.structure_change}/3
- Payment Flow: ${cr.scores.payment_flow_impact}/3
- Technical: ${cr.scores.technical_impact}/3
- Regulatory: ${cr.scores.regulatory_impact}/3

**Affected Processes:**
${cr.affected_processes.map((p) => `- ${p}`).join('\n')}

**Required Adjustments:**
${cr.adjustments.map((a) => `- **${a.system}** (${a.effort}): ${a.description}`).join('\n')}
`;
  }

  private calculateTotalScore(s: ImpactScores): number {
    return (
      s.structure_change * 0.4 +
      s.payment_flow_impact * 0.25 +
      s.technical_impact * 0.2 +
      s.regulatory_impact * 0.15
    );
  }

  private calculateCategory(score: number): T2ChangeRequest['impact_category'] {
    if (score >= 1.8) return 'Critical';
    if (score >= 1.0) return 'High';
    if (score >= 0.5) return 'Medium';
    return 'Low';
  }
}
