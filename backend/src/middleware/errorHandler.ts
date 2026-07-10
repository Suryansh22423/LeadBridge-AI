import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large."
        : `Upload error: ${err.message}`;
    return res.status(400).json({ error: message });
  }

  if (err instanceof Error) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Internal server error." });
  }

  console.error("Unknown error:", err);
  return res.status(500).json({ error: "Internal server error." });
}
