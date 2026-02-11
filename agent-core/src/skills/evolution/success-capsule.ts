
import fs from 'fs';
import path from 'path';

export interface SuccessCapsule {
    id: string;
    timestamp: number;
    input: any;
    expectedOutput: any;
    metadata: any;
}

export class SuccessCapsuleManager {
    private storagePath: string;

    constructor(storagePath: string = './memory/capsules') {
        this.storagePath = storagePath;
        if (!fs.existsSync(this.storagePath)) {
            fs.mkdirSync(this.storagePath, { recursive: true });
        }
    }

    async saveCapsule(input: any, output: any, metadata: any = {}): Promise<string> {
        const id = `capsule_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const capsule: SuccessCapsule = {
            id,
            timestamp: Date.now(),
            input,
            expectedOutput: output,
            metadata
        };

        const filePath = path.join(this.storagePath, `${id}.json`);
        await fs.promises.writeFile(filePath, JSON.stringify(capsule, null, 2), 'utf-8');
        console.log(`Success Capsule saved: ${id}`);
        return id;
    }

    async loadAllCapsules(): Promise<SuccessCapsule[]> {
        const files = await fs.promises.readdir(this.storagePath);
        const capsules: SuccessCapsule[] = [];

        for (const file of files) {
            if (file.endsWith('.json')) {
                const content = await fs.promises.readFile(path.join(this.storagePath, file), 'utf-8');
                capsules.push(JSON.parse(content));
            }
        }
        return capsules;
    }

    async validate(processor: (input: any) => Promise<any>): Promise<{ success: boolean; failures: string[] }> {
        const capsules = await this.loadAllCapsules();
        const failures: string[] = [];

        for (const capsule of capsules) {
            try {
                const result = await processor(capsule.input);
                // Simple equality check for now. Ideally needs deep comparison or semantic similarity.
                if (JSON.stringify(result) !== JSON.stringify(capsule.expectedOutput)) {
                    failures.push(`Capsule ${capsule.id} failed. Output mismatch.`);
                }
            } catch (error) {
                failures.push(`Capsule ${capsule.id} threw error: ${error}`);
            }
        }

        return {
            success: failures.length === 0,
            failures
        };
    }
}
