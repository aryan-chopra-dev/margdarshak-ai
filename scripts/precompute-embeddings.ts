/**
 * Pre-compute Knowledge Base Embeddings
 * ============================================================================
 * [FIX FM-8]: Resolves the serverless memory leak / cold-start crash.
 *
 * PROBLEM: The production vector-search route was re-vectorizing the entire
 * knowledge base on every cold start via a global in-memory cache
 * (`kbEmbeddingsCache`). In serverless environments (Vercel), this cache is
 * purged frequently, causing:
 *   1. Severe memory limit crashes (loading the ~80MB @xenova/transformers model)
 *   2. 30-60 second cold-start latency on the first request after purge
 *   3. Degraded UX on subsequent fast requests due to cache thrashing
 *
 * SOLUTION: Pre-compute embeddings at build time and save to a static JSON.
 * The vector-search route then imports this static file instead of computing
 * at runtime — zero cold-start cost, no ML model loaded in production.
 *
 * Usage:
 *   npm run precompute
 *   (or: npx tsx scripts/precompute-embeddings.ts)
 *
 * Output: src/data/kb-embeddings.json
 * Run this script whenever knowledge-base.ts is updated.
 * ============================================================================
 */

import { pipeline } from '@xenova/transformers';
import { knowledgeBase } from '../src/data/knowledge-base';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('  Margdarshak AI — Knowledge Base Embedding Pre-Computation');
  console.log('═'.repeat(60));
  console.log(`\n📚 Knowledge base chunks to embed: ${knowledgeBase.length}`);

  console.log('\n🔄 Loading MiniLM-L6-v2 embedding model (quantized)...');
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    quantized: true,
  });
  console.log('✅ Model loaded.\n');

  const results: { id: string; title: string; content: string; embedding: number[] }[] = [];

  for (let i = 0; i < knowledgeBase.length; i++) {
    const chunk = knowledgeBase[i];
    process.stdout.write(`   [${String(i + 1).padStart(2, '0')}/${knowledgeBase.length}] Embedding: "${chunk.title}"...`);

    const output = await extractor(chunk.content, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data) as number[];

    results.push({
      id: chunk.id,
      title: chunk.title,
      content: chunk.content,
      embedding,
    });

    process.stdout.write(` ✓ (dim: ${embedding.length})\n`);
  }

  const outputPath = path.join(process.cwd(), 'src', 'data', 'kb-embeddings.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

  const fileSizeKB = Math.round(fs.statSync(outputPath).size / 1024);
  console.log('\n' + '═'.repeat(60));
  console.log(`  ✅ Embeddings written to: src/data/kb-embeddings.json`);
  console.log(`  📦 File size: ${fileSizeKB} KB`);
  console.log(`  🔢 Chunks embedded: ${results.length}`);
  console.log(`  🔢 Embedding dimensions: ${results[0].embedding.length}`);
  console.log('═'.repeat(60) + '\n');
}

main().catch((err) => {
  console.error('\n❌ Pre-computation failed:', err);
  process.exit(1);
});
