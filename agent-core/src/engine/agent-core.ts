import * as path from 'path';
import * as fs from 'fs'; // Added for config loading
import { PdfIngestionSkill } from '../skills/ingestion/pdf-loader';
import { OllamaClient } from '../infrastructure/ollama-client';
import { FileLogbook } from '../memory/file-logbook';
// import { T2Evaluator } from '../skills/evaluation/t2-evaluator'; // TODO: integrate via skill?
// import { ReflexionEngine } from '../engine/reflexion-engine'; // Removed
import { SkillManager } from '../skills/skill-manager';
import { ReleaseAuditorSkill } from '../skills/library/release-auditor-skill';
import { T2ImpactSkill } from '../skills/library/t2-impact-skill'; // New Skill
import { T2Config } from '../skills/library/t2-types';
import { CapabilityEvolver } from '../skills/evolution/capability-evolver';
import { SuccessCapsuleManager } from '../skills/evolution/success-capsule';
import { ModeManager, OperationalMode } from '../engine/mode-manager';
import { SmartChunker } from '../skills/ingestion/text-chunker';
import { Logger } from '../infrastructure/logger';

export interface AgentConfig {
  mode: OperationalMode;
  ollamaModel?: string;
}

export class AgentCore {
  private ingestor: PdfIngestionSkill;
  private ollama: OllamaClient;
  private logbook: FileLogbook;
  private skillManager: SkillManager;
  private evolver: CapabilityEvolver;
  private capsules: SuccessCapsuleManager;
  private modeManager: ModeManager;

  constructor(config: AgentConfig) {
    this.ingestor = new PdfIngestionSkill();
    this.ollama = new OllamaClient({ modelName: config.ollamaModel || 'llama3' });
    this.logbook = new FileLogbook();

    this.skillManager = new SkillManager();
    this.skillManager.register(new ReleaseAuditorSkill());

    // Phase 10: Register T2 Impact Skill & Load Config
    try {
      const t2Skill = new T2ImpactSkill();
      // Load config from file (assuming relative to project root or agent-core root)
      // Adjust path as needed. Given structure: agent-core/config/kfw.json
      const configPath = path.resolve(__dirname, '../../config/kfw.json');
      if (fs.existsSync(configPath)) {
        const rawConfig = fs.readFileSync(configPath, 'utf-8');
        const kfwConfig: T2Config = JSON.parse(rawConfig);
        t2Skill.configure(kfwConfig);
        this.skillManager.register(t2Skill);
        Logger.info(`Registered Skill: ${t2Skill.name} (Configured for ${kfwConfig.bankName})`);
      } else {
        Logger.warn(`Configuration file not found at ${configPath}. T2ImpactSkill not registered.`);
      }
    } catch (error) {
      Logger.error('Failed to register T2ImpactSkill:', error);
    }

    this.capsules = new SuccessCapsuleManager();
    this.evolver = new CapabilityEvolver(this.ollama, this.capsules);
    this.modeManager = new ModeManager(config.mode);
  }

  async run(filePath: string): Promise<void> {
    Logger.info(`=== Agent Core: Starting Analysis of '${path.basename(filePath)}' ===`);
    Logger.info(`Operational Mode: ${this.modeManager.getMode()}`);

    try {
      // 1. Ingestion
      Logger.info('-> Ingesting Document...');
      const doc = await this.ingestor.loadPdf(filePath);
      Logger.info(`   Internalized ${doc.metadata.totalPages} pages.`);

      // 2. Formatting & Chunking
      Logger.info(`-> Smart Chunking (Strategy: Page-Based, Limit: 6000 chars)...`);
      const chunks = SmartChunker.chunkDocument(doc);
      Logger.info(`   Document split into ${chunks.length} chunks.`);

      // 3. Reasoning Loop (via SkillManager)
      if (!(await this.ollama.isConnected())) {
        Logger.warn('! Ollama NOT connected. Skipping Reasoning/Evolution phases.');
        return;
      }

      // Select Skill (Defaulting to T2 Impact for Phase 10 if available, else ReleaseAuditor)
      let skillId = 't2-impact-analyzer';
      try {
        this.skillManager.getSkill(skillId);
      } catch {
        Logger.warn(
          `Skill '${skillId}' not found (maybe config missing?), falling back to 'release-auditor'.`,
        );
        skillId = 'release-auditor';
      }

      const skill = this.skillManager.getSkill(skillId);
      Logger.info(`-> Executing Skill: ${skill.name} (${skillId})`);

      const chunkResults: unknown[] = [];

      for (const chunk of chunks) {
        Logger.info(
          `   Processing Chunk ${chunk.id}/${chunks.length} (Pages ${chunk.pageStart}-${chunk.pageEnd})...`,
        );
        try {
          const prompt = skill.generatePrompt(chunk.content);
          const response = await this.ollama.generateCompletion(prompt);

          // Parse JSON (Robustly)
          let jsonStr = '';
          const codeBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1];
          } else {
            const start = response.indexOf('{');
            const end = response.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
              jsonStr = response.substring(start, end + 1);
            }
          }

          if (!jsonStr) {
            throw new Error(`No JSON found in response for chunk ${chunk.id}`);
          }

          const rawJson = JSON.parse(jsonStr);

          // Validate Schema (Zod)
          const result = skill.getOutputSchema().parse(rawJson);
          chunkResults.push(result);

          // Logger: Need generic logging?
          // If result has pbis, log count. (Optional)
          if (
            typeof result === 'object' &&
            result !== null &&
            'pbis' in result &&
            Array.isArray((result as { pbis: unknown[] }).pbis)
          ) {
            Logger.info(
              `   > Chunk ${chunk.id} analyzed. Found ${(result as { pbis: unknown[] }).pbis.length} PBIs.`,
            );
          } else {
            Logger.info(`   > Chunk ${chunk.id} analyzed.`);
          }
        } catch (error) {
          Logger.error(`   ! Error processing Chunk ${chunk.id}:`, error);
          // Continue with next chunk, don't crash the whole process
        }
      }

      // 4. Aggregation (via Skill)
      Logger.info('-> Aggregating Results...');
      const finalResult = skill.mergeResults(chunkResults);

      // 5. Memory & Capsule Storage (Store the FINAL result)
      Logger.info('-> Memorizing Result...');
      const timestamp = Date.now();
      const jsonFilename = `analysis_${path.basename(filePath)}_${timestamp}.json`;
      await this.logbook.saveEntry(jsonFilename, JSON.stringify(finalResult, null, 2));

      // Save the *first* chunk as a sample capsule (for now, as full text might be huge)
      // Ideally we'd save the specific chunk that caused an issue, but standardizing on first chunk for regression
      if (chunks.length > 0) {
        await this.capsules.saveCapsule(chunks[0].content, chunkResults[0] || finalResult, {
          source: filePath,
          chunkId: 1,
          skillId,
        });
      }

      // 6. Output Summary (User Facing)
      const mdFilename = `summary_${path.basename(filePath)}_${Date.now()}.md`;

      // Skill generates the core report
      const skillReport = skill.formatReport(finalResult);
      // Agent wraps it with metadata
      const fullReport = `# Analysis Report: ${path.basename(filePath)}\nSkill: ${skill.name}\n${skillReport}`;

      const savedPath = await this.logbook.saveEntry(mdFilename, fullReport);
      Logger.info(`-> Report generated: ${savedPath}`);
      Logger.info('=== Analysis Complete ===\n');
    } catch (error) {
      Logger.error('CRITICAL AGENT ERROR:', error);
    }
  }
}
