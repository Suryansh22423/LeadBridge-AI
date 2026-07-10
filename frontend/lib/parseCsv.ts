import Papa from "papaparse";
import { RawCsvRow } from "@/types/crm";

export interface ClientParsedCsv {
  headers: string[];
  rows: RawCsvRow[];
}

/**
 * Parses a CSV file entirely in the browser, purely for the preview table.
 * No AI processing happens here - per spec, the backend is only called after
 * the user confirms the import.
 */
export function parseCsvClientSide(file: File): Promise<ClientParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawCsvRow>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        const headers = result.meta.fields ?? [];
        const rows = (result.data ?? []).filter((row) =>
          Object.values(row).some((v) => v && String(v).trim().length > 0)
        );
        if (rows.length === 0) {
          reject(new Error("This CSV doesn't contain any usable data rows."));
          return;
        }
        resolve({ headers, rows });
      },
      error: (err) => reject(err),
    });
  });
}
