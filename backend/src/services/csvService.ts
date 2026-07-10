import Papa from "papaparse";
import { RawCsvRow } from "../types/crm";

export interface ParsedCsv {
  rows: RawCsvRow[];
  headers: string[];
}

/**
 * Parses a CSV buffer into an array of raw row objects, keyed by whatever
 * headers the source file actually used. We deliberately do NOT assume any
 * fixed column names here - that mapping problem is handed off to the AI
 * extraction step.
 */
export function parseCsvBuffer(buffer: Buffer): ParsedCsv {
  const text = buffer.toString("utf-8");

  const result = Papa.parse<RawCsvRow>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
    transform: (value) => (typeof value === "string" ? value.trim() : value),
  });

  if (result.errors?.length) {
    const fatal = result.errors.filter((e) => e.type !== "FieldMismatch");
    if (fatal.length) {
      throw new Error(
        `CSV parse error: ${fatal[0].message} (row ${fatal[0].row ?? "?"})`
      );
    }
  }

  const headers = result.meta.fields ?? [];
  const rows = (result.data ?? []).filter((row) =>
    Object.values(row).some((v) => v && String(v).trim().length > 0)
  );

  if (rows.length === 0) {
    throw new Error("CSV file contains no usable data rows.");
  }

  return { rows, headers };
}
