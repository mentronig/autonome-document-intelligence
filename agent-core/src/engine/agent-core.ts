
import * as path from 'path';
import { PdfIngestionSkill } from '../skills/ingestion/pdf-loader';
import { OllamaClient } from '../infrastructure/ollama-client';
import { FileLogbook } from '../memory/file-logbook';
import { T2Analyzer } from '../skills/reasoning/t2-analyzer';
import { T2Evaluator } from '../skills/evaluation/t2-evaluator';
import { ReflexionEngine } from '../engine/reflexion-engine';
import { CapabilityEvolver } from '../skills/evolution/capability-evolver';
import { SuccessCapsuleManager } from '../skills/evolution/success-capsule';
import { ModeManager, OperationalMode } from '../engine/mode-manager';

export interface AgentConfig {
    mode: OperationalMode;
    ollamaModel?: string;
}

export class AgentCore {
    private ingestor: PdfIngestionSkill;
    private ollama: OllamaClient;
    private logbook: FileLogbook;
    private reflexionEng: ReflexionEngine;
    private evolver: CapabilityEvolver;
    private capsules: SuccessCapsuleManager;
    private modeManager: ModeManager;

    constructor(config: AgentConfig) {
        this.ingestor = new PdfIngestionSkill();
        this.ollama = new OllamaClient(config.ollamaModel || 'llama3');
        this.logbook = new FileLogbook();

        const analyzer = new T2Analyzer(this.ollama);
        const evaluator = new T2Evaluator();
        this.reflexionEng = new ReflexionEngine(analyzer, evaluator);

        this.capsules = new SuccessCapsuleManager();
        this.evolver = new CapabilityEvolver(this.ollama, this.capsules);
        this.modeManager = new ModeManager(config.mode);
    }

    async run(filePath: string): Promise<void> {
        console.log(`\n=== Agent Core: Starting Analysis of '${path.basename(filePath)}' ===`);
        console.log(`Operational Mode: ${this.modeManager.getMode()}`);

        try {
            // 1. Ingestion
            console.log('-> Ingesting Document...');
            const doc = await this.ingestor.loadPdf(filePath);
            console.log(`   Internalized ${doc.metadata.totalPages} pages.`);

            // 2. Reasoning (Reflexion)
            if (!(await this.ollama.isConnected())) {
                console.warn('! Ollama NOT connected. Skipping Reasoning/Evolution phases.');
                return;
            }

            console.log('-> Reasoning (Reflexion Engine)...');
            // Truncate for POC safety/speed
            const textSegment = doc.text.slice(0, 8000);

            let result;
            try {
                result = await this.reflexionEng.run(textSegment);
                console.log('   Analysis successful.');

                // 3. Memory & Capsule Storage
                console.log('-> Memorizing Result...');
                const timestamp = Date.now();
                const jsonFilename = `analysis_${path.basename(filePath)}_${timestamp}.json`;
                await this.logbook.saveEntry(jsonFilename, JSON.stringify(result, null, 2));

                // Save as Success Capsule for future regression testing
                await this.capsules.saveCapsule(textSegment, result, { source: filePath });

            } catch (error) {
                console.error('! Reflexion failed. Initiating Evolution Protocol...');

                // 4. Evolution (Simulated Trigger)
                // In a real scenario, we'd pass the error and context to evolver
                const evolutionPrompt = `Function failed with error: ${error}. Input was a T2 Release Note.`;
                const dummyCode = `// Current mocked failing code...`;

                if (await this.modeManager.requireApproval("Evolve Codebase based on failure")) {
                    console.log('-> Evolution approved (Mad Dog Mode). Evolving...');
                    await this.evolver.evolveRule(textSegment, evolutionPrompt, dummyCode);
                } else {
                    console.log('-> Evolution halted. Mode requires manual approval.');
                }
                return; // Stop here if failed
            }

            // 5. Output Summary (User Facing)
            const mdFilename = `summary_${path.basename(filePath)}_${Date.now()}.md`;
            const mdContent = this.formatMarkdown(path.basename(filePath), result);
            const savedPath = await this.logbook.saveEntry(mdFilename, mdContent);
            console.log(`-> Report generated: ${savedPath}`);
            console.log('=== Analysis Complete ===\n');

        } catch (error) {
            console.error('CRITICAL AGENT ERROR:', error);
        }
    }

    private formatMarkdown(filename: string, result: any): string {
        return `# Analysis Report: ${filename}
        
## Executive Summary
${result.summary}

## Identified Issues
### Production Problems (PBIs)
${result.pbis.map((p: any) => `- **${p.id}**: ${p.description} (Impact: ${p.impact})`).join('\n')}

### Change Requests (CRs)
${result.crs.map((c: any) => `- ${c}`).join('\n')}
`;
    }
}
