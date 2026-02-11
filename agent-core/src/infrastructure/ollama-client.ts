
import { Ollama } from 'ollama';
import dotenv from 'dotenv';

dotenv.config();

export class OllamaClient {
    private ollama: Ollama;
    private model: string;

    constructor(modelName: string = 'llama3') {
        this.ollama = new Ollama({ host: process.env.OLLAMA_BASE_URL || 'http://localhost:11434' });
        this.model = modelName;
    }

    async generateCompletion(prompt: string): Promise<string> {
        try {
            const response = await this.ollama.generate({
                model: this.model,
                prompt: prompt,
                stream: false
            });
            return response.response;
        } catch (error) {
            console.error('Error generating completion from Ollama:', error);
            throw error;
        }
    }

    async generateEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.ollama.embeddings({
                model: this.model,
                prompt: text
            });
            return response.embedding;
        } catch (error) {
            console.error('Error generating embedding from Ollama:', error);
            throw error;
        }
    }

    async isConnected(): Promise<boolean> {
        try {
            await this.ollama.list();
            return true;
        } catch (error) {
            return false;
        }
    }
}
