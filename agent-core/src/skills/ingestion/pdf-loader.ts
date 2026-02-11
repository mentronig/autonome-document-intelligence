
import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';

export interface Document {
    text: string;
    metadata: {
        source: string;
        totalPages: number;
        info?: any;
    };
}

export class PdfIngestionSkill {
    async loadPdf(filePath: string): Promise<Document> {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(filePath)) {
                return reject(new Error(`File not found: ${filePath}`));
            }

            // Path to the python script in the project root
            // Assuming process.cwd() is the agent-core root where we run node from
            const scriptPath = path.resolve(process.cwd(), 'pdf_parser.py');

            // Spawn python process
            const pythonProcess = spawn('python', [scriptPath, filePath]);

            let dataString = '';
            let errorString = '';

            pythonProcess.stdout.on('data', (data) => {
                dataString += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorString += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0 && errorString) {
                    return reject(new Error(`PDF parsing returned error code ${code}: ${errorString}`));
                }
                try {
                    // Try to parse the collected stdout
                    const result = JSON.parse(dataString);
                    if (result.error) {
                        return reject(new Error(`PDF parsing error: ${result.error}`));
                    }

                    resolve({
                        text: result.text,
                        metadata: {
                            source: filePath,
                            totalPages: result.numpages,
                            info: result.info
                        }
                    });
                } catch (e) {
                    reject(new Error(`Failed to parse JSON output from python script: ${e}\nRaw output: ${dataString}\nStderr: ${errorString}`));
                }
            });
        });
    }
}
