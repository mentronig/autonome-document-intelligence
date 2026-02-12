import { z } from 'zod';

// --- CONFIGURATION TYPES ---------------------------------------------------

export type T2ComponentType = 'fachlich' | 'technisch';

// Represents a bank-specific system (like "TPH" or "OSPlus")
export interface T2Component {
  name: string;
  type: T2ComponentType;
  keywords: string[]; // Keywords to detect relevance in text
}

// The injected "Bank Context"
export interface T2Config {
  bankName: string;
  components: T2Component[];
  managedMessages: string[]; // List of ISO20022 message types (e.g., "pacs.008")
}

// --- ANALYSIS RESULT TYPES -------------------------------------------------

// Detailed breakdown of impact scores
export interface ImpactScores {
  structure_change: number; // 0-3 (40%)
  payment_flow_impact: number; // 0-3 (25%)
  technical_impact: number; // 0-3 (20%)
  regulatory_impact: number; // 0-3 (15%)
}

// An operational adjustment required for a system
export interface SystemAdjustment {
  system: string; // Must match a component name from T2Config
  description: string;
  effort: 'Low' | 'Medium' | 'High';
}

// A single Change Request (CR) analysis
export interface T2ChangeRequest {
  id: string; // e.g., "T2-XXXX"
  title: string;
  description: string; // Business-friendly description
  impact_category: 'Critical' | 'High' | 'Medium' | 'Low' | 'None';
  scores: ImpactScores;
  breaking_change: boolean;
  affected_processes: string[];
  adjustments: SystemAdjustment[];
}

// The final aggregated report structure
export interface T2ImpactAnalysisResult {
  executive_summary: string;
  crs: T2ChangeRequest[];
  stats: {
    total_crs: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

// --- ZOD SCHEMAS (for LLM Validation) --------------------------------------

export const ImpactScoresSchema = z.object({
  structure_change: z.number().min(0).max(3),
  payment_flow_impact: z.number().min(0).max(3),
  technical_impact: z.number().min(0).max(3),
  regulatory_impact: z.number().min(0).max(3),
});

export const SystemAdjustmentSchema = z.object({
  system: z.string(),
  description: z.string(),
  effort: z.enum(['Low', 'Medium', 'High']),
});

export const T2ChangeRequestSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  // Note: We don't ask LLM for 'impact_category' directly, we calculate it!
  scores: ImpactScoresSchema,
  breaking_change: z.boolean(),
  affected_processes: z.array(z.string()),
  adjustments: z.array(SystemAdjustmentSchema),
});

// The LLM output per chunk (might find multiple CRs or partials)
export const T2ChunkResultSchema = z.object({
  found_crs: z.array(T2ChangeRequestSchema),
  summary_fragment: z.string().optional(),
});

export type T2ChunkResult = z.infer<typeof T2ChunkResultSchema>;
