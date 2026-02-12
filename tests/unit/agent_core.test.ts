import { AgentCore } from '../../agent-core/src/engine/agent-core';
import { OperationalMode } from '../../agent-core/src/engine/mode-manager';
import { PdfIngestionSkill } from '../../agent-core/src/skills/ingestion/pdf-loader';
import { OllamaClient } from '../../agent-core/src/infrastructure/ollama-client';
import { SkillManager } from '../../agent-core/src/skills/skill-manager';
// import { ReleaseAuditorSkill } from '../../agent-core/src/skills/library/release-auditor-skill';

// Mock dependencies
jest.mock('../../agent-core/src/skills/ingestion/pdf-loader');
jest.mock('../../agent-core/src/infrastructure/ollama-client');
jest.mock('../../agent-core/src/skills/skill-manager');
jest.mock('../../agent-core/src/skills/library/release-auditor-skill');
jest.mock('../../agent-core/src/memory/file-logbook'); // Mock logbook too to prevent file I/O
jest.mock('../../agent-core/src/skills/evolution/capability-evolver');
jest.mock('../../agent-core/src/skills/evolution/success-capsule');

describe('AgentCore Unit Tests', () => {
  let agent: AgentCore;

  // Type checking for mocks
  const MockPdfLoader = PdfIngestionSkill as jest.MockedClass<typeof PdfIngestionSkill>;
  const MockOllama = OllamaClient as jest.MockedClass<typeof OllamaClient>;
  const MockSkillManager = SkillManager as jest.MockedClass<typeof SkillManager>;
  // const MockReleaseAuditorSkill = ReleaseAuditorSkill as jest.MockedClass<typeof ReleaseAuditorSkill>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default mock behaviors
    MockOllama.prototype.isConnected.mockResolvedValue(true);
    MockOllama.prototype.generateCompletion.mockResolvedValue(
      JSON.stringify({
        summary: 'Mock Summary',
        pbis: [],
        crs: [],
      }),
    );

    MockPdfLoader.prototype.loadPdf.mockResolvedValue({
      text: 'Sample PDF Text Content',
      metadata: {
        totalPages: 1,
        source: 'dummy.pdf',
      },
      pages: [{ page: 1, text: 'Sample PDF Text Content' }],
    });

    // Mock Skill Behavior
    const mockSkillInstance = {
      id: 'release-auditor',
      name: 'Release Auditor',
      description: 'Mock Skill',
      configure: jest.fn(),
      generatePrompt: jest.fn().mockReturnValue('Mock Prompt'),
      getOutputSchema: jest.fn().mockReturnValue({
        parse: jest.fn().mockReturnValue({
          pbis: [],
          crs: [],
          summary: 'Mocked Result',
        }),
      }),
      mergeResults: jest.fn().mockReturnValue({
        pbis: [],
        crs: [],
        summary: 'Merged Summary',
      }),
      formatReport: jest.fn().mockReturnValue('# Mock Report'),
    };

    MockSkillManager.prototype.getSkill.mockReturnValue(
      mockSkillInstance as unknown as import('../../agent-core/src/skills/types/ISkill').ISkill,
    );

    // Mock register needs to do nothing
    MockSkillManager.prototype.register.mockImplementation(() => {});

    agent = new AgentCore({
      mode: OperationalMode.REVIEW,
    });
  });

  test('should instantiate correctly', () => {
    expect(agent).toBeDefined();
    // Verify dependencies were instantiated
    expect(MockPdfLoader).toHaveBeenCalledTimes(1);
    expect(MockOllama).toHaveBeenCalledTimes(1);
    expect(MockSkillManager).toHaveBeenCalledTimes(1);
  });

  test('should run basic ingestion flow', async () => {
    await agent.run('dummy.pdf');

    // Check if loadPdf was called
    const mockIngestorInstance = MockPdfLoader.mock.instances[0];
    expect(mockIngestorInstance.loadPdf).toHaveBeenCalledWith('dummy.pdf');
  });

  test('should execute skill flow', async () => {
    await agent.run('dummy.pdf');

    // Verify Skill Execution
    expect(MockSkillManager.prototype.getSkill).toHaveBeenCalledWith('release-auditor');
    // We can't easily check the mock instance created inside, but getSkill returns our mock object.
    // So we can check if our mock object methods were called.
    const skill = MockSkillManager.prototype.getSkill.mock.results[0].value;
    expect(skill.generatePrompt).toHaveBeenCalled();
    expect(skill.getOutputSchema().parse).toHaveBeenCalled();
    expect(skill.mergeResults).toHaveBeenCalled();
    expect(skill.formatReport).toHaveBeenCalled();
  });

  test('should abort if Ollama is disconnected', async () => {
    // Setup: Ollama is disconnected
    MockOllama.prototype.isConnected.mockResolvedValue(false);

    // Capture console.warn to verify output (optional, good practice)
    // Note: Logger uses console.warn, so this still works? Logger.warn uses console.warn.
    const spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await agent.run('dummy.pdf');

    // Currently Logger formats output like [TIMESTAMP] [WARN] ...
    // So we assume it contains the text.
    // Actually Logger uses console.warn, so spyWarn should capture it.

    // We expect the log message to contain the text.
    expect(spyWarn).toHaveBeenCalledWith(expect.stringContaining('Ollama NOT connected'));

    // Restore spy
    spyWarn.mockRestore();
  });
});
