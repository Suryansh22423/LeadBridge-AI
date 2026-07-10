import "dotenv/config";
import express from "express";
import cors from "cors";
import importRoutes from "./routes/importRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = Number(process.env.PORT || 4000);

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(",");

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "groweasy-csv-importer-backend" });
});

app.use("/api", importRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`GrowEasy CSV importer backend listening on port ${PORT}`);
});
