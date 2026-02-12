import { AgentCore } from '../../agent-core/src/engine/agent-core';
import { OperationalMode } from '../../agent-core/src/engine/mode-manager';
import { PdfIngestionSkill } from '../../agent-core/src/skills/ingestion/pdf-loader';
import { OllamaClient } from '../../agent-core/src/infrastructure/ollama-client';
import { ReflexionEngine } from '../../agent-core/src/engine/reflexion-engine';

// Mock dependencies
jest.mock('../../agent-core/src/skills/ingestion/pdf-loader');
jest.mock('../../agent-core/src/infrastructure/ollama-client');
jest.mock('../../agent-core/src/engine/reflexion-engine');
jest.mock('../../agent-core/src/memory/file-logbook'); // Mock logbook too to prevent file I/O
jest.mock('../../agent-core/src/skills/evolution/capability-evolver');
jest.mock('../../agent-core/src/skills/evolution/success-capsule');

describe('AgentCore Unit Tests', () => {
  let agent: AgentCore;

  // Type checking for mocks
  const MockPdfLoader = PdfIngestionSkill as jest.MockedClass<typeof PdfIngestionSkill>;
  const MockOllama = OllamaClient as jest.MockedClass<typeof OllamaClient>;
  const MockReflexion = ReflexionEngine as jest.MockedClass<typeof ReflexionEngine>;

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
    });
    MockReflexion.prototype.run.mockResolvedValue({
      summary: 'Mocked Summary',
      pbis: [],
      crs: [],
    });

    agent = new AgentCore({
      mode: OperationalMode.REVIEW,
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
