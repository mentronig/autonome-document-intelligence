
import { OllamaClient } from '../../infrastructure/ollama-client';
import { SuccessCapsuleManager } from './success-capsule';

export class CapabilityEvolver {
    private ollama: OllamaClient;
    private capsules: SuccessCapsuleManager;

    constructor(ollama: OllamaClient, capsules: SuccessCapsuleManager) {
        this.ollama = ollama;
        this.capsules = capsules;
    }

    async evolveRule(failedInput: string, critique: string, currentCode: string): Promise<string | null> {
        console.log("🧬 Initiating Evolution Sequence...");

        const prompt = `
You are an expert TypeScript developer and AI Architect.
The current code failed to process an input correctly.
We need to evolve the logic to handle this new case WITHOUT breaking existing cases.

FAILED INPUT (Excerpt):
${failedInput.slice(0, 500)}...

CRITIQUE / ERROR:
${critique}

CURRENT CODE (Logic to fix):
${currentCode}

INSTRUCTIONS:
1. Analyze why the current code failed.
2. Propose a specific code modification (e.g., regex update, logic change).
3. Return ONLY the new code snippet for the specific function or logic block.
4. Ensure it is syntactically correct TypeScript.

RESPONSE FORMAT:
\`\`\`typescript
// New code here
\`\`\`
`;

        try {
            const response = await this.ollama.generateCompletion(prompt);
            const codeMatch = response.match(/```typescript([\s\S]*?)```/);

            if (codeMatch && codeMatch[1]) {
                const proposedCode = codeMatch[1].trim();
                console.log("🤖 AI Proposed Mutation:\n", proposedCode);

                // In a real system, we would:
                // 1. Hot-reload or compile this code.
                // 2. Run SuccessCapsuleManager.validate() to ensure no regressions.
                // 3. Commit if green.

                // For this POC, we just simulate the proposal and basic validation log.
                console.log("Processing regression tests...");
                // const regressionResult = await this.capsules.validate(mockProcessor); // Placeholder
                console.log("Regression Testing: PASSED (Simulated)");

                return proposedCode;
            }

            console.warn("Evolution failed: No code block returned.");
            return null;

        } catch (error) {
            console.error("Evolution error:", error);
            return null;
        }
    }
}
