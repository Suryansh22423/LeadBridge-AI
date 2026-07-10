import { RawCsvRow, ImportResult, CrmRecord } from "../types/crm";
import { extractBatch, IndexedCrmRecord } from "../services/aiExtractionService";

const BATCH_SIZE = Number(process.env.AI_BATCH_SIZE || 15);
const CONCURRENCY = Number(process.env.AI_BATCH_CONCURRENCY || 3);

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Splits rows into batches, sends each through the AI extraction service with
 * bounded concurrency, and aggregates the results into a single ImportResult.
 * A single failed batch degrades to "skipped" rows rather than failing the
 * whole import.
 */
export async function processRowsInBatches(
  rows: RawCsvRow[],
  onProgress?: (done: number, total: number) => void
): Promise<ImportResult> {
  const batches = chunk(rows, BATCH_SIZE);
  const indexedImported: IndexedCrmRecord[] = [];
  const result: ImportResult = {
    imported: [],
    skipped: [],
    totalRows: rows.length,
    totalImported: 0,
    totalSkipped: 0,
    batches: { total: batches.length, succeeded: 0, failed: 0, retried: 0 },
  };

  let cursor = 0;
  let completed = 0;

  async function worker() {
    while (cursor < batches.length) {
      const batchIndex = cursor++;
      const batch = batches[batchIndex];
      const offset = batchIndex * BATCH_SIZE;

      const outcome = await extractBatch(batch, offset);

      indexedImported.push(...outcome.imported);
      result.skipped.push(...outcome.skipped);
      if (outcome.succeeded) result.batches.succeeded++;
      else result.batches.failed++;
      if (outcome.retried) result.batches.retried++;

      completed++;
      onProgress?.(completed, batches.length);
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, batches.length) }, worker);
  await Promise.all(workers);

  // Batches complete out of order under concurrency - restore original row order for a predictable UI.
  indexedImported.sort((a, b) => a.rowIndex - b.rowIndex);
  result.skipped.sort((a, b) => a.rowIndex - b.rowIndex);
  result.imported = indexedImported.map((r) => r.record);

  result.totalImported = result.imported.length;
  result.totalSkipped = result.skipped.length;

  return result;
}
