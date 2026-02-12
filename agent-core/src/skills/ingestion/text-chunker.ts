import { Document } from './pdf-loader';

export interface TextChunk {
  id: number;
  content: string;
  pageStart: number;
  pageEnd: number;
}

export class SmartChunker {
  private static readonly MAX_CHUNK_SIZE = 6000; // Approx 1500 tokens

  /**
   * Splits the document into manageable chunks.
   * Strategy: Group complete pages until MAX_CHUNK_SIZE is reached.
   * This avoids splitting sentences in the middle of a page (usually).
   */
  static chunkDocument(doc: Document): TextChunk[] {
    const chunks: TextChunk[] = [];

    // If no pages content (legacy or error), fallback to simple text split
    if (!doc.pages || doc.pages.length === 0) {
      console.warn('SmartChunker: No page structure found. Falling back to simple text slicing.');
      return this.fallbackChunking(doc.text);
    }

    let currentChunkContent = '';
    let currentStartPage = doc.pages[0].page;
    let currentEndPage = doc.pages[0].page;
    let chunkCounter = 1;

    for (const page of doc.pages) {
      // Check if adding this page would exceed the limit
      // (Only if we already have content. If a single page is huge, we must take it alone or split it separately - but here we take it alone)
      if (
        currentChunkContent.length + page.text.length > this.MAX_CHUNK_SIZE &&
        currentChunkContent.length > 0
      ) {
        // Push current chunk
        chunks.push({
          id: chunkCounter++,
          content: currentChunkContent.trim(),
          pageStart: currentStartPage,
          pageEnd: currentEndPage,
        });

        // Reset for next chunk
        currentChunkContent = '';
        currentStartPage = page.page;
      }

      // Add page to current buffer
      currentChunkContent += `\n--- Page ${page.page} ---\n` + page.text;
      currentEndPage = page.page;
    }

    // Push the final chunk
    if (currentChunkContent.trim().length > 0) {
      chunks.push({
        id: chunkCounter++,
        content: currentChunkContent.trim(),
        pageStart: currentStartPage,
        pageEnd: currentEndPage,
      });
    }

    console.log(
      `SmartChunker: Created ${chunks.length} chunks from ${doc.metadata.totalPages} pages.`,
    );
    return chunks;
  }

  private static fallbackChunking(text: string): TextChunk[] {
    const chunks: TextChunk[] = [];
    let index = 0;
    let counter = 1;

    while (index < text.length) {
      const slice = text.slice(index, index + this.MAX_CHUNK_SIZE);
      chunks.push({
        id: counter++,
        content: slice,
        pageStart: -1, // Unknown
        pageEnd: -1,
      });
      index += this.MAX_CHUNK_SIZE;
    }
    return chunks;
  }
}
