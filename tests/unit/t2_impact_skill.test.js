"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t2_impact_skill_1 = require("../../agent-core/src/skills/library/t2-impact-skill");
describe('T2ImpactSkill Unit Tests', () => {
    let skill;
    const mockConfig = {
        bankName: 'TestBank',
        components: [
            { name: 'TPH', type: 'fachlich', keywords: ['Travic'] },
            { name: 'ESMIG', type: 'technisch', keywords: ['Gateway'] },
        ],
        managedMessages: ['pacs.008'],
    };
    beforeEach(() => {
        skill = new t2_impact_skill_1.T2ImpactSkill();
        skill.configure(mockConfig);
    });
    test('should generate prompt with configured context', () => {
        const prompt = skill.generatePrompt('Sample Text');
        expect(prompt).toContain('TestBank'); // Ideally bank name isn't in prompt directly but context is
        // Actually prompt template uses "OUR SPECIFIC INFRASTRUCTURE"
        // But it lists systems.
        expect(prompt).toContain('TPH (fachlich)');
        expect(prompt).toContain('ESMIG (technisch)');
        expect(prompt).toContain('pacs.008');
    });
    test('should validate output schema', () => {
        const schema = skill.getOutputSchema();
        const validData = {
            found_crs: [
                {
                    id: 'T2-0001',
                    title: 'Test CR',
                    description: 'Description',
                    scores: {
                        structure_change: 3,
                        payment_flow_impact: 2,
                        technical_impact: 1,
                        regulatory_impact: 0,
                    },
                    breaking_change: true,
                    affected_processes: ['Payment'],
                    adjustments: [{ system: 'TPH', description: 'Update', effort: 'High' }],
                },
            ],
            summary_fragment: 'Summary',
        };
        expect(() => schema.parse(validData)).not.toThrow();
    });
    test('should calculate scores and categories correctly in mergeResults', () => {
        const chunkResults = [
            {
                found_crs: [
                    {
                        id: 'CR-1',
                        title: 'Critical CR',
                        description: 'Desc',
                        // Score: 3*0.4(1.2) + 3*0.25(0.75) + 0 + 0 = 1.95 -> Critical (>=1.8)
                        scores: {
                            structure_change: 3,
                            payment_flow_impact: 3,
                            technical_impact: 0,
                            regulatory_impact: 0,
                        },
                        breaking_change: true,
                        affected_processes: [],
                        adjustments: [],
                    },
                ],
                summary_fragment: 'Part 1',
            },
            {
                found_crs: [
                    {
                        id: 'CR-2',
                        title: 'Low CR',
                        description: 'Desc',
                        // Score: 0 + 1*0.25 + 0 + 0 = 0.25 -> Low (<0.5)
                        scores: {
                            structure_change: 0,
                            payment_flow_impact: 1,
                            technical_impact: 0,
                            regulatory_impact: 0,
                        },
                        breaking_change: false,
                        affected_processes: [],
                        adjustments: [],
                    },
                ],
            },
        ];
        const result = skill.mergeResults(chunkResults);
        expect(result.crs.length).toBe(2);
        const criticalCR = result.crs.find((c) => c.id === 'CR-1');
        expect(criticalCR).toBeDefined();
        expect(criticalCR?.impact_category).toBe('Critical');
        const lowCR = result.crs.find((c) => c.id === 'CR-2');
        expect(lowCR).toBeDefined();
        expect(lowCR?.impact_category).toBe('Low');
        expect(result.stats.critical).toBe(1);
        expect(result.stats.low).toBe(1);
    });
});
