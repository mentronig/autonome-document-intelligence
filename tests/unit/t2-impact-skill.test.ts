import { T2ImpactSkill } from '../../agent-core/src/skills/library/t2-impact-skill';
import { T2ChunkResult } from '../../agent-core/src/skills/library/t2-types';
import { T2Config } from '../../agent-core/src/skills/library/t2-types';

describe('T2ImpactSkill', () => {
    let skill: T2ImpactSkill;
    const mockConfig: T2Config = {
        bankName: 'TestBank',
        components: [{ name: 'TPH', type: 'technisch', keywords: ['TPH'] }],
        managedMessages: ['pacs.008'],
    };

    beforeEach(() => {
        skill = new T2ImpactSkill();
        skill.configure(mockConfig);
    });

    test('should generate 3 distinct reports from chunks', () => {
        const mockChunkResults: T2ChunkResult[] = [
            {
                found_crs: [
                    {
                        id: 'CR-001',
                        title: 'Test CR',
                        description: 'Test Description',
                        scores: {
                            structure_change: 3,
                            payment_flow_impact: 2,
                            technical_impact: 1,
                            regulatory_impact: 0,
                        },
                        ba_reasoning: 'BA says critical',
                        technical_analysis: 'Tech says schema change',
                        breaking_change: true,
                        affected_processes: ['Payments'],
                        adjustments: [
                            { system: 'TPH', description: 'Update Schema', effort: 'High' },
                        ],
                    },
                ],
                summary_fragment: 'Summary part 1',
            },
        ];

        const result = skill.mergeResults(mockChunkResults);

        expect(result.baReport).toContain('PHASE 1: BA-REPORT');
        expect(result.baReport).toContain('BA says critical');

        expect(result.techReport).toContain('PHASE 2: TECHNISCHER BERICHT');
        expect(result.techReport).toContain('Tech says schema change');

        expect(result.mgmtReport).toContain('PHASE 3: MANAGEMENT-BERICHT');
        expect(result.mgmtReport).toContain('GO MIT BEDINGUNGEN'); // Critical CR
    });
});
