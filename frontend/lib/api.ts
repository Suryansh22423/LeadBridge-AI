import { ImportResult } from "@/types/crm";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export class ApiError extends Error {}

/**
 * Sends the CSV to the backend and listens to real-time status updates via SSE.
 */
export async function importCsv(
  file: File,
  onProgress?: (percent: number, completed: number, total: number) => void
): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/import`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await safeJson(res);
    throw new ApiError(body?.error || `Import failed with status ${res.status}.`);
  }

  const payload = await res.json();
  const taskId = payload?.taskId;

  if (!taskId) {
    throw new ApiError("Failed to initialize import: Task ID was not returned.");
  }

  // Connect to SSE stream to track background task progress
  return new Promise<ImportResult>((resolve, reject) => {
    const eventSource = new EventSource(`${API_BASE_URL}/api/import/progress/${taskId}`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "progress") {
          onProgress?.(payload.percent || 0, payload.completedBatches || 0, payload.totalBatches || 0);
        } else if (payload.type === "complete") {
          eventSource.close();
          resolve(payload.result);
        } else if (payload.type === "error") {
          eventSource.close();
          reject(new ApiError(payload.error || "An error occurred during extraction."));
        }
      } catch (err) {
        eventSource.close();
        reject(new ApiError("Failed to parse progress stream data."));
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      reject(new ApiError("Lost connection to the extraction stream server."));
    };
  });
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
