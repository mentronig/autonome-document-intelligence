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

    test('pdf_parser.py should extract text from a sample PDF', (done) => {
        // Find a valid PDF
        const files = fs.readdirSync(samplesDir);
        const pdf = files.find(f => f.endsWith('.pdf') && !f.includes('Dummy')); // Skip dummy if present

        if (!pdf) {
            console.warn('No real PDF found for integration test. Skipping.');
            done();
            return;
        }

        const pdfPath = path.join(samplesDir, pdf);
        // Correct path to python script: ../../agent-core/pdf_parser.py (relative to this test file)
        const scriptPath = path.join(__dirname, '../../agent-core/pdf_parser.py');

        const command = `python "${scriptPath}" "${pdfPath}"`;
        // console.log(`Executing: ${command}`);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing python script: ${error.message}`);
                console.error(`Stderr: ${stderr}`);
                // Don't fail if python environment is not set up perfectly in this environment yet, just warn
                // But generally we expect it to work. 
                // Let's output it.
                done(error);
                return;
            }

            try {
                // console.log('Python Output:', stdout); // Too verbose
                const result = JSON.parse(stdout);
                expect(result).toBeDefined();
                expect(result.text).toBeDefined();
                expect(result.text.length).toBeGreaterThan(10);
                done();
            } catch (e) {
                done(e);
            }
        });
    }, 30000); // 30s timeout
});
