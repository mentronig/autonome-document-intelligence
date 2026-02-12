import { Ollama } from 'ollama';
import dotenv from 'dotenv';

dotenv.config();

export class OllamaClient {
  private ollama: Ollama;
  private model: string;
  private retryDelay: number;

  constructor(config: { modelName?: string; retryDelay?: number } = {}) {
    this.ollama = new Ollama({ host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434' });
    this.model = config.modelName || 'llama3';
    this.retryDelay = config.retryDelay || 1000;
  }

  private async retry<T>(
    operation: () => Promise<T>,
    retries: number = 3,
    delay?: number,
  ): Promise<T> {
    const currentDelay = delay || this.retryDelay;
    try {
      return await operation();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }
      console.warn(
        `Ollama operation failed. Retrying in ${currentDelay}ms... (Attempts left: ${retries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      return this.retry(operation, retries - 1, currentDelay * 2);
    }
  }

  async generateCompletion(prompt: string): Promise<string> {
    return this.retry(async () => {
      const response = await this.ollama.generate({
        model: this.model,
        prompt: prompt,
        stream: false,
      });
      return response.response;
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.retry(async () => {
      const response = await this.ollama.embeddings({
        model: this.model,
        prompt: text,
      });
      return response.embedding;
    });
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.ollama.list();
      return true;
    } catch {
      return false;
    }
  }
}
