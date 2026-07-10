import { Router } from "express";
import { upload } from "../middleware/upload";
import { previewCsv, importCsv, streamImportProgress } from "../controllers/importController";

const router = Router();

// Optional server-side preview/validation
router.post("/preview", upload.single("file"), previewCsv);

// Main entry point: initiates import task and returns taskId
router.post("/import", upload.single("file"), importCsv);

// SSE endpoint to track progress
router.get("/import/progress/:taskId", streamImportProgress);

export default router;
