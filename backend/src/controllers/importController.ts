import { Request, Response } from "express";
import { parseCsvBuffer } from "../services/csvService";
import {
  createTask,
  startBackgroundTask,
  getTask,
  subscribeClient,
  unsubscribeClient,
} from "../utils/taskManager";

const MAX_ROWS = Number(process.env.MAX_CSV_ROWS || 5000);

export async function previewCsv(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file was uploaded (field name: 'file')." });
    }

    const { rows, headers } = parseCsvBuffer(req.file.buffer);

    if (rows.length > MAX_ROWS) {
      return res.status(413).json({
        error: `CSV has ${rows.length} rows, which exceeds the ${MAX_ROWS}-row limit for a single import.`,
      });
    }

    return res.status(200).json({
      headers,
      rowCount: rows.length,
      preview: rows.slice(0, 50),
    });
  } catch (err) {
    return res.status(400).json({
      error: err instanceof Error ? err.message : "Failed to parse CSV file.",
    });
  }
}

export async function importCsv(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file was uploaded (field name: 'file')." });
    }

    const { rows } = parseCsvBuffer(req.file.buffer);

    if (rows.length > MAX_ROWS) {
      return res.status(413).json({
        error: `CSV has ${rows.length} rows, which exceeds the ${MAX_ROWS}-row limit for a single import.`,
      });
    }

    // Create a new task and initiate processing in the background
    const task = createTask(rows.length);
    startBackgroundTask(task.id, rows);

    return res.status(202).json({ taskId: task.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to initiate CSV import.";
    const status = message.includes("GEMINI_API_KEY") ? 503 : 400;
    return res.status(status).json({ error: message });
  }
}

export function streamImportProgress(req: Request, res: Response) {
  const { taskId } = req.params;
  const task = getTask(taskId);

  if (!task) {
    return res.status(404).json({ error: "Task not found." });
  }

  // Set SSE Headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // If already complete or failed, send immediate final state and close
  if (task.status === "completed") {
    res.write(`data: ${JSON.stringify({ type: "complete", result: task.result })}\n\n`);
    return res.end();
  }

  if (task.status === "failed") {
    res.write(`data: ${JSON.stringify({ type: "error", error: task.error })}\n\n`);
    return res.end();
  }

  // Register client for notifications
  subscribeClient(taskId, res);

  // Send current progress state immediately
  const total = task.totalBatches || 1;
  const percent = Math.round((task.completedBatches / total) * 100);
  res.write(
    `data: ${JSON.stringify({
      type: "progress",
      completedBatches: task.completedBatches,
      totalBatches: task.totalBatches,
      percent,
    })}\n\n`
  );

  // Handle client disconnect
  req.on("close", () => {
    unsubscribeClient(taskId, res);
  });
}
