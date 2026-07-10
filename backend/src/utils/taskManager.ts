import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { ImportResult, RawCsvRow } from "../types/crm";
import { processRowsInBatches } from "./batchProcessor";

export interface ImportTask {
  id: string;
  totalRows: number;
  completedBatches: number;
  totalBatches: number;
  status: "pending" | "processing" | "completed" | "failed";
  result: ImportResult | null;
  error: string | null;
  clients: Response[];
}

const tasks = new Map<string, ImportTask>();

export function createTask(totalRows: number): ImportTask {
  const id = uuidv4();
  const task: ImportTask = {
    id,
    totalRows,
    completedBatches: 0,
    totalBatches: 0,
    status: "pending",
    result: null,
    error: null,
    clients: [],
  };
  tasks.set(id, task);
  return task;
}

export function getTask(id: string): ImportTask | undefined {
  return tasks.get(id);
}

export function subscribeClient(id: string, res: Response): boolean {
  const task = tasks.get(id);
  if (!task) return false;
  task.clients.push(res);
  return true;
}

export function unsubscribeClient(id: string, res: Response) {
  const task = tasks.get(id);
  if (!task) return;
  task.clients = task.clients.filter((c) => c !== res);
}

export function startBackgroundTask(id: string, rows: RawCsvRow[]) {
  const task = tasks.get(id);
  if (!task) return;

  task.status = "processing";

  // Trigger batch processing
  processRowsInBatches(rows, (done, total) => {
    task.completedBatches = done;
    task.totalBatches = total;

    const percent = Math.round((done / total) * 100);
    const progressData = JSON.stringify({
      type: "progress",
      completedBatches: done,
      totalBatches: total,
      percent,
    });

    task.clients.forEach((client) => {
      client.write(`data: ${progressData}\n\n`);
    });
  })
    .then((result) => {
      task.status = "completed";
      task.result = result;

      const completeData = JSON.stringify({
        type: "complete",
        result,
      });

      task.clients.forEach((client) => {
        client.write(`data: ${completeData}\n\n`);
        client.end();
      });
      task.clients = [];
    })
    .catch((err) => {
      task.status = "failed";
      task.error = err instanceof Error ? err.message : "Import failed.";

      const errorData = JSON.stringify({
        type: "error",
        error: task.error,
      });

      task.clients.forEach((client) => {
        client.write(`data: ${errorData}\n\n`);
        client.end();
      });
      task.clients = [];
    });
}
