import { describe, it, expect, vi } from "vitest";
import { createTask, getTask, subscribeClient, unsubscribeClient } from "./taskManager";
import { Response } from "express";

describe("TaskManager", () => {
  it("creates and registers new import tasks", () => {
    const task = createTask(100);
    expect(task.id).toBeDefined();
    expect(task.totalRows).toBe(100);
    expect(task.status).toBe("pending");

    const retrieved = getTask(task.id);
    expect(retrieved).toEqual(task);
  });

  it("subscribes and unsubscribes SSE clients", () => {
    const task = createTask(50);
    const mockRes = {
      write: vi.fn(),
      end: vi.fn(),
    } as unknown as Response;

    const subscribed = subscribeClient(task.id, mockRes);
    expect(subscribed).toBe(true);
    expect(task.clients).toContain(mockRes);

    unsubscribeClient(task.id, mockRes);
    expect(task.clients).not.toContain(mockRes);
  });
});
