'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const agent_core_1 = require('../../agent-core/src/engine/agent-core');
const mode_manager_1 = require('../../agent-core/src/engine/mode-manager');
const pdf_loader_1 = require('../../agent-core/src/skills/ingestion/pdf-loader');
const ollama_client_1 = require('../../agent-core/src/infrastructure/ollama-client');
const reflexion_engine_1 = require('../../agent-core/src/engine/reflexion-engine');
// Mock dependencies
jest.mock('../../agent-core/src/skills/ingestion/pdf-loader');
jest.mock('../../agent-core/src/infrastructure/ollama-client');
jest.mock('../../agent-core/src/engine/reflexion-engine');
jest.mock('../../agent-core/src/memory/file-logbook'); // Mock logbook too to prevent file I/O
jest.mock('../../agent-core/src/skills/evolution/capability-evolver');
jest.mock('../../agent-core/src/skills/evolution/success-capsule');
describe('AgentCore Unit Tests', () => {
  let agent;
  // Type checking for mocks
  const MockPdfLoader = pdf_loader_1.PdfIngestionSkill;
  const MockOllama = ollama_client_1.OllamaClient;
  const MockReflexion = reflexion_engine_1.ReflexionEngine;
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Setup default mock behaviors
    MockOllama.prototype.isConnected.mockResolvedValue(true);
    MockPdfLoader.prototype.loadPdf.mockResolvedValue({
      text: 'Sample PDF Text Content',
      metadata: {
        totalPages: 1,
        source: 'dummy.pdf',
      },
      pages: [{ page: 1, text: 'Sample PDF Text Content' }],
    });
    MockReflexion.prototype.run.mockResolvedValue({
      summary: 'Mocked Summary',
      pbis: [],
      crs: [],
    });
    agent = new agent_core_1.AgentCore({
      mode: mode_manager_1.OperationalMode.REVIEW,
    });
  });
  test('should instantiate correctly', () => {
    expect(agent).toBeDefined();
    // Verify dependencies were instantiated
    expect(MockPdfLoader).toHaveBeenCalledTimes(1);
    expect(MockOllama).toHaveBeenCalledTimes(1);
  });
  test('should run basic ingestion flow', async () => {
    await agent.run('dummy.pdf');
    // Check if loadPdf was called
    const mockIngestorInstance = MockPdfLoader.mock.instances[0];
    expect(mockIngestorInstance.loadPdf).toHaveBeenCalledWith('dummy.pdf');
  });
  test('should abort if Ollama is disconnected', async () => {
    // Setup: Ollama is disconnected
    MockOllama.prototype.isConnected.mockResolvedValue(false);
    // Capture console.warn to verify output (optional, good practice)
    const spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await agent.run('dummy.pdf');
    expect(spyWarn).toHaveBeenCalledWith(expect.stringContaining('Ollama NOT connected'));
    // Restore spy
    spyWarn.mockRestore();
  });
});
