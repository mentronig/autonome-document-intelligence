
import fs from 'fs';
import path from 'path';

export class FileLogbook {
    private baseDir: string;

    constructor(baseDir: string = './memory') {
        this.baseDir = baseDir;
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
    }

    async saveEntry(filename: string, content: string): Promise<string> {
        const fullPath = path.join(this.baseDir, filename);
        // Ensure directory exists for filename with path
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await fs.promises.writeFile(fullPath, content, 'utf-8');
        console.log(`Logbook entry saved to: ${fullPath}`);
        return fullPath;
    }

    async readEntry(filename: string): Promise<string> {
        const fullPath = path.join(this.baseDir, filename);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`Entry not found: ${fullPath}`);
        }
        return await fs.promises.readFile(fullPath, 'utf-8');
    }
}
