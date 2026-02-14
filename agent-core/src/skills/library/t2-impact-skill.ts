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

    // Context Injection from enriched kfw.json
    const systemContext = this.config.components
      .map((c) => `- **${c.name} (${c.type})**: ${c.description || 'No description'}`)
      .join('\n');
    const messageContext = this.config.managedMessages.join('\n- ');

    return `
# ROLE: Senior T2 Analyst (BA & Tech Expert)
You are the "Quantum Intelligence" engine for ${this.config.bankName}. Your job is to analyze T2 Release Notes and identify impacts on OUR specific infrastructure.

# CONTEXT: ${this.config.bankName} Infrastructure
${systemContext}

# CONTEXT: Managed ISO20022 Messages
- ${messageContext}

# TASK
Analyze the provided text for Change Requests (CRs). For each CR found, you must generate a structured analysis containing:
1. **Scores:** Evaluate impact on Structure (40%), Payment Flow (25%), Tech (20%), Regulatory (15%).
2. **BA Analysis:** Business-friendly explanation of WHY it is relevant (or not).
3. **Tech Analysis:** Technical details (XPaths, Schema changes) for engineers.
4. **Adjustments:** Specific systems from our CONTEXT that need changes.

# IMPACT SCORING RULES (0-3)
- **Structure:** 3=Breaking/Removal, 2=New Optional, 1=Doc Update, 0=None.
- **Payment Flow:** 3=Core Flow (pacs.008/009) blocked, 2=Reporting, 0=None.
- **Technical:** 3=Multiple Systems (TPH+Archive), 2=One Complex System, 1=Config only.
- **Regulatory:** 3=Mandatory (ECB), 0=Optional.

# STYLE GUIDELINES (Strict!)
- **LANGUAGE: GERMAN (DEUTSCH)**
  - All output text (descriptions, reasoning, analysis) MUST be in GERMAN.
  - **CRITICAL:** DO NOT TRANSLATE JSON KEYS! Check that keys like "structure_change" remain exactly as shown.
  - Do NOT translate technical terms (e.g., "pacs.008", "XPath", "XML Tag"), but explain them in German.
- **BA_REASONING:**
  - ✅ Use business terms ("Kundenüberweisung" instead of just "pacs.008").
  - ✅ Specific impacts ("TPH Settlement blockiert").
  - ❌ NO XPaths, NO Schema details, NO "minOccurs".
- **TECHNICAL_ANALYSIS:**
  - ✅ Use XPaths, Schema details, "minOccurs".
  - ✅ Mention specific XML tags.

# OUTPUT FORMAT (JSON)
{
  "found_crs": [
    {
      "id": "T2-xxxx",
      "title": "Titel auf Deutsch",
      "description": "Kurze Zusammenfassung auf Deutsch...",
      "scores": { "structure_change": 0-3, "payment_flow_impact": 0-3, "technical_impact": 0-3, "regulatory_impact": 0-3 },
      "ba_reasoning": "Geschäftliche Begründung auf Deutsch (Siehe STYLE GUIDELINES)",
      "technical_analysis": "Technische Analyse auf Deutsch (Siehe STYLE GUIDELINES)",
      "breaking_change": true/false,
      "affected_processes": ["RTGS", "CLM", ...],
      "adjustments": [ { "system": "TPH", "description": "Beschreibung der Anpassung auf Deutsch...", "effort": "Medium" } ]
    }
  ],
  "summary_fragment": "Optionaler Text für Management Summary auf Deutsch..."
}

# TEXT TO ANALYZE
${chunkText}
`;
  }

  getOutputSchema(): z.ZodSchema<T2ChunkResult> {
    return T2ChunkResultSchema;
  }

  mergeResults(chunkResults: T2ChunkResult[]): T2ImpactAnalysisResult {
    const crMap = new Map<string, T2ChangeRequest>();


    for (const chunk of chunkResults) {

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

    const stats = {
      total_crs: allCrs.length,
      critical: allCrs.filter((c) => c.impact_category === 'Critical').length,
      high: allCrs.filter((c) => c.impact_category === 'High').length,
      medium: allCrs.filter((c) => c.impact_category === 'Medium').length,
      low: allCrs.filter((c) => c.impact_category === 'Low').length,
    };

    const baReport = this.generateBAReport(allCrs);
    const techReport = this.generateTechReport(allCrs);
    const mgmtReport = this.generateMgmtReport(allCrs, stats);

    return {
      crs: allCrs,
      stats,
      baReport,
      techReport,
      mgmtReport,
    };
  }

  formatReport(result: T2ImpactAnalysisResult): string {
    return `${result.mgmtReport}\n\n---\n\n${result.baReport}\n\n---\n\n${result.techReport}`;
  }

  private generateBAReport(crs: T2ChangeRequest[]): string {
    const header = `# PHASE 1: BA-REPORT MIT RELEVANZ-SCORING\n\n## Relevanzmodell (gewichtet)\nNachrichtenstruktur (0.40) · Zahlungsabwicklung & Liquidität (0.25) · Technische Umsetzung (0.20) · Regulatorische Anforderungen (0.15)\nThresholds: ≥1.80 = Critical · 1.00–1.79 = High · 0.50–0.99 = Medium · <0.50 = Not Relevant\n\n## CR-Übersicht (Relevanz-Tabelle)\n| CR | Titel | Score | Kategorie | Hauptgrund |\n|---|---|---|---|---|\n${crs.map((cr) => `| ${cr.id} | ${cr.title} | ${this.calculateTotalScore(cr.scores).toFixed(2)} | ${cr.impact_category} | ${cr.ba_reasoning || cr.description} |`).join('\n')}\n\n---\n`;

    const details = crs
      .map((cr) => {
        const score = this.calculateTotalScore(cr.scores).toFixed(2);
        const icon = this.getIcon(cr.impact_category);
        return `## ${icon} CR ${cr.id}: ${cr.title} — Score: ${score} (${cr.impact_category})
### Was ändert sich?
${cr.ba_reasoning || cr.description}

### Betroffene Prozesse/Workflows
${cr.affected_processes.map((p) => `- ${p}`).join('\n')}

### Erforderliche Anpassungen
${cr.adjustments.map((a) => `- **${a.system}** (${a.effort}): ${a.description}`).join('\n')}

### Bewertung nach Kriterien
- **Struktur:** ${cr.scores.structure_change}/3 × 0.40 = ${(cr.scores.structure_change * 0.4).toFixed(2)}
- **Payment Flow:** ${cr.scores.payment_flow_impact}/3 × 0.25 = ${(cr.scores.payment_flow_impact * 0.25).toFixed(2)}
- **Technisch:** ${cr.scores.technical_impact}/3 × 0.20 = ${(cr.scores.technical_impact * 0.2).toFixed(2)}
- **Regulatorik:** ${cr.scores.regulatory_impact}/3 × 0.15 = ${(cr.scores.regulatory_impact * 0.15).toFixed(2)}
**Gesamtscore:** ${score} → ${cr.impact_category}
`;
      })
      .join('\n---\n');

    return header + details;
  }

  private generateTechReport(crs: T2ChangeRequest[]): string {
    const header = `# PHASE 2: TECHNISCHER BERICHT FÜR ENGINEERS\n\n`;
    const details = crs
      .map((cr) => {
        return `## 🔧 ${cr.id} — ${cr.title}
**Breaking Change:** ${cr.breaking_change ? '✅ JA' : '❌ NEIN'}
**Migrations-Aufwand:** ${this.getMaxEffort(cr.adjustments)}

### Betroffene Systeme
${Array.from(new Set(cr.adjustments.map((a) => a.system)))
            .map((s) => `- ${s}`)
            .join('\n')}

### Technische Details
${cr.technical_analysis || 'Keine technischen Details verfügbar.'}

### System-Auswirkungen & Migration
${cr.adjustments.map((a) => `**${a.system}:** ${a.description} (Aufwand: ${a.effort})`).join('\n')}
`;
      })
      .join('\n---\n');
    return header + details;
  }

  private generateMgmtReport(
    crs: T2ChangeRequest[],
    stats: { critical: number; high: number; medium: number; low: number; total_crs: number },
  ): string {
    const recommendation =
      stats.critical > 0 || crs.some((c) => c.breaking_change)
        ? '⚠️ GO MIT BEDINGUNGEN'
        : '✅ GO';

    return `# PHASE 3: MANAGEMENT-BERICHT (Executive Summary)

## Kurzfazit
Analyse abgeschlossen. ${stats.total_crs} Change Requests analysiert.
Status: ${stats.critical} Kritisch, ${stats.high} Hoch.
Breaking Changes: ${crs.filter((c) => c.breaking_change).length}.

## CR-Verteilung
| Kategorie | Anzahl | CRs |
|---|---|---|
| 🚨 Kritisch | ${stats.critical} | ${crs
        .filter((c) => c.impact_category === 'Critical')
        .map((c) => c.id)
        .join(', ')} |
| ⚠️ Hoch | ${stats.high} | ${crs
        .filter((c) => c.impact_category === 'High')
        .map((c) => c.id)
        .join(', ')} |
| 📋 Mittel | ${stats.medium} | ${crs
        .filter((c) => c.impact_category === 'Medium')
        .map((c) => c.id)
        .join(', ')} |
| 📌 Niedrig | ${stats.low} | ${crs
        .filter((c) => c.impact_category === 'Low')
        .map((c) => c.id)
        .join(', ')} |

## Empfehlung
**${recommendation}**
`;
  }

  private getIcon(category: string): string {
    switch (category) {
      case 'Critical':
        return '🚨';
      case 'High':
        return '⚠️';
      case 'Medium':
        return '📋';
      default:
        return '📌';
    }
  }

  private getMaxEffort(adjustments: { effort: string }[]): string {
    if (adjustments.some((a) => a.effort === 'High')) return '🔴 HOCH';
    if (adjustments.some((a) => a.effort === 'Medium')) return '🟡 MITTEL';
    return '🟢 NIEDRIG';
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
