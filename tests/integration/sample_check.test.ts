import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

// Helper to run the python script directly (simulating what AgentCore does but simpler for this test)
// ideally we would test AgentCore, but let's start by verifying the python part works on the sample
// const pythonScriptPath = path.join(__dirname, '../../agent-core/src/ingestion/pdf_processor.py'); 
// Waite, I need to check where the python script actually is. 
// Let's assume standard path first, or just check AgentCore logic if possible.
// Actually, let's look at AgentCore first to see how it calls the python script.
// For now, I'll write a test that checks if the file exists and is readable.

describe('Integration Test: PDF Samples', () => {
    const samplesDir = path.join(__dirname, '../samples');

    test('Samples directory should contain PDF files', () => {
        const files = fs.readdirSync(samplesDir);
        const pdfs = files.filter(f => f.endsWith('.pdf'));
        expect(pdfs.length).toBeGreaterThan(0);
        // console.log('Found PDFs:', pdfs);
    });

    test('pdf_parser.py should extract text from ALL sample PDFs (Stress Test)', async () => {
        const files = fs.readdirSync(samplesDir);
        const pdfs = files.filter(f => f.endsWith('.pdf'));

        if (pdfs.length === 0) {
            console.warn('No PDFs found. Skipping stress test.');
            return;
        }

        console.log(`Starting stress test on ${pdfs.length} documents...`);

        // Process sequentially to avoid spawning too many python processes at once
        // (Simulating a queue)
        for (const pdf of pdfs) {
            const pdfPath = path.join(samplesDir, pdf);
            const scriptPath = path.join(__dirname, '../../agent-core/pdf_parser.py');
            const command = `python "${scriptPath}" "${pdfPath}"`;

            await new Promise<void>((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        return reject(new Error(`Failed on ${pdf}: ${error.message}\nStderr: ${stderr}`));
                    }
                    try {
                        const result = JSON.parse(stdout);
                        expect(result).toBeDefined();
                        expect(result.text.length).toBeGreaterThan(10);
                        // console.log(`√ Processed ${pdf} (${result.numpages} pages)`);
                        resolve();
                    } catch (e) {
                        reject(new Error(`JSON Parse error on ${pdf}: ${e}`));
                    }
                });
            });
        }
    }, 120000); // 2 minutes timeout for stress test
});
