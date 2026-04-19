import { NextResponse } from 'next/server';
import { pipeline } from '@xenova/transformers';
import { knowledgeBase } from '@/data/knowledge-base';

// FAISS Mathematical Equivalent (Cosine Similarity)
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Lazy loaded singleton to respect Vercel / Next.js memory limits
let extractor: any = null;
let kbEmbeddingsCache: { id: string, title: string, content: string, embedding: number[] }[] = [];

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!extractor) {
      console.log('Loading Xenova Embeddings Model (all-MiniLM-L6-v2)...');
      // Set to load locally
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true,
      });
    }

    // 1. Cache Knowledge Base Vector Embeddings 
    // Usually handled by FAISS offline, simulated entirely localized in memory here
    if (kbEmbeddingsCache.length === 0) {
        console.log('Vectorizing Knowledge Base locally...');
        for (const chunk of knowledgeBase) {
            const output = await extractor(chunk.content, { pooling: 'mean', normalize: true });
            kbEmbeddingsCache.push({
                id: chunk.id,
                title: chunk.title,
                content: chunk.content,
                embedding: Array.from(output.data) as number[]
            });
        }
        console.log('✅ Local FAISS Vector Store Hydrated.');
    }

    // 2. Vectorize the User Query
    const queryOutput = await extractor(query, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(queryOutput.data) as number[];

    // 3. Execute FAISS Cosine Similarity retrieval
    const rankedResults = kbEmbeddingsCache.map((chunk) => {
        const score = cosineSimilarity(queryEmbedding, chunk.embedding);
        return { ...chunk, score };
    }).sort((a, b) => b.score - a.score);

    const topDoc = rankedResults[0];

    return NextResponse.json({
        topChunk: topDoc,
        score: topDoc.score.toFixed(4),
        traces: [
            "> Initializing Local FAISS Vector Engine",
            `> Embedding dimension generated via miniLM`,
            `> Cosine Similarity Max Score: ${topDoc.score.toFixed(4)}`,
            `> FAISS Retrieved Chunk ID: [${topDoc.id}]`
        ]
    });

  } catch (error) {
    console.error('Vector DB Error:', error);
    return NextResponse.json({ error: 'Vector engine failed.' }, { status: 500 });
  }
}
