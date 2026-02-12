# Autonomous Document Intelligence Agent (POC)

A local-first, self-learning agent designed to analyze T2 Release Notes.

## Architecture

- **Runtime:** Node.js (TypeScript)
- **Ingestion:** Python (`pdfplumber`) via parsing script
- **Reasoning:** Local LLM (`llama3` via Ollama) + Reflexion Loop
- **Memory:** ChromaDB (Vector) + File Logbook (Audit)
- **Evolution:** Genetic Evolutionary Programming (Simulated)

## Prerequisites

1.  **Node.js** (v18+)
2.  **Python** (v3.10+) with `pip`
    - Install dependencies: `pip install pdfplumber`
3.  **Ollama** (Running locally)
    - Install from [ollama.com](https://ollama.com)
    - Pull model: `ollama pull llama3`

## Setup

1.  Install Node dependencies:
    ```bash
    npm install
    ```
2.  Build the project:
    ```bash
    npx tsc
    ```

## Usage

Run the agent on a PDF file:

```bash
node dist/index.js <path-to-pdf> [options]
```

### Options

- `--mode review`: (Default) The agent asks for confirmation before critical actions (Self-Evolution).
- `--mode maddog`: The agent acts fully autonomously (Riskier, faster).

### Example

```bash
node dist/index.js ../doc/samples/T2_Release_Note_Dummy.pdf --mode review
```

## Output

Results are saved in the `memory/` directory:

- `memory/logs/`: Markdown reports and JSON analysis data.
- `memory/capsules/`: Successful usage examples for regression testing.
