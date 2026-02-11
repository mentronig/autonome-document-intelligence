
import { ChromaClient, Collection } from 'chromadb';
import dotenv from 'dotenv';

dotenv.config();

export class ChromaDbClient {
    private client: ChromaClient;
    private collectionName: string;
    private collection: Collection | null = null;

    constructor() {
        this.client = new ChromaClient({ path: process.env.CHROMA_SERVER_URL || 'http://localhost:8000' });
        this.collectionName = process.env.CHROMA_COLLECTION_NAME || 't2-release-notes';
    }

    async init() {
        try {
            this.collection = await this.client.getOrCreateCollection({
                name: this.collectionName,
            });
            console.log(`ChromaDB collection '${this.collectionName}' initialized.`);
        } catch (error) {
            console.error('Error initializing ChromaDB:', error);
            throw error;
        }
    }

    async addDocument(id: string, text: string, metadata: any, embedding: number[]) {
        if (!this.collection) await this.init();

        await this.collection!.add({
            ids: [id],
            documents: [text],
            metadatas: [metadata],
            embeddings: [embedding]
        });
    }

    async query(embedding: number[], nResults: number = 3) {
        if (!this.collection) await this.init();

        const results = await this.collection!.query({
            queryEmbeddings: [embedding],
            nResults: nResults
        });
        return results;
    }
}
