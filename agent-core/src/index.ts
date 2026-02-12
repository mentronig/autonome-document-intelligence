import { AgentCore } from './engine/agent-core';
import { OperationalMode } from './engine/mode-manager';
import dotenv from 'dotenv';

dotenv.config();

function printUsage() {
  console.log(`
Usage: node dist/index.js <path-to-pdf> [options]

Options:
  --mode <mode>    'review' (default) or 'maddog' (autonomous)
  --help           Show this help message
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const pdfPath = args[0];
  let mode = OperationalMode.REVIEW;

  const modeIndex = args.indexOf('--mode');
  if (modeIndex !== -1 && args[modeIndex + 1]) {
    const modeArg = args[modeIndex + 1].toUpperCase();
    if (modeArg === 'MADDOG') {
      mode = OperationalMode.MAD_DOG;
    } else if (modeArg === 'REVIEW') {
      mode = OperationalMode.REVIEW;
    } else {
      console.warn(`Unknown mode '${modeArg}'. Defaulting to REVIEW.`);
    }
  }

  const agent = new AgentCore({
    mode: mode,
  });

  await agent.run(pdfPath);
}

main().catch(console.error);
