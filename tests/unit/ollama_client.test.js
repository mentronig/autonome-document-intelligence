"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ollama_client_1 = require("../../agent-core/src/infrastructure/ollama-client");
const ollama_1 = require("ollama");
// Mock the 'ollama' package
jest.mock('ollama');
describe('OllamaClient Retry Logic', () => {
    let ollamaClient;
    let mockGenerate;
    beforeEach(() => {
        jest.clearAllMocks();
        mockGenerate = jest.fn();
        ollama_1.Ollama.mockImplementation(() => ({
            generate: mockGenerate,
        }));
        ollamaClient = new ollama_client_1.OllamaClient({ retryDelay: 1 });
    });
    test('should return response immediately if successful', async () => {
        mockGenerate.mockResolvedValue({ response: 'Success' });
        const result = await ollamaClient.generateCompletion('test');
        expect(result).toBe('Success');
        expect(mockGenerate).toHaveBeenCalledTimes(1);
    });
    test('should retry 3 times and succeed', async () => {
        // Fail 2 times, then succeed
        mockGenerate
            .mockRejectedValueOnce(new Error('Fail 1'))
            .mockRejectedValueOnce(new Error('Fail 2'))
            .mockResolvedValue({ response: 'Success' });
        // Use real timers because total delay is very short (1ms start)
        const result = await ollamaClient.generateCompletion('test');
        expect(result).toBe('Success');
        expect(mockGenerate).toHaveBeenCalledTimes(3);
    });
    test('should fail after max retries', async () => {
        mockGenerate.mockRejectedValue(new Error('Available failure'));
        const promise = ollamaClient.generateCompletion('test');
        await expect(promise).rejects.toThrow('Available failure');
        // Initial + 3 retries = 4 calls?
        // Logic: retry(op, 3).
        // 1. op() fails. internal retry(op, 2).
        // 2. op() fails. internal retry(op, 1).
        // 3. op() fails. internal retry(op, 0).
        // 4. op() fails. retries <= 0 -> throw.
        expect(mockGenerate).toHaveBeenCalledTimes(4);
    });
});
