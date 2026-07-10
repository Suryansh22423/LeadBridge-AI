import { GoogleGenAI } from "@google/genai";
import {
  CrmRecord,
  CRM_STATUS_VALUES,
  DATA_SOURCE_VALUES,
  RawCsvRow,
  SkippedRecord,
} from "../types/crm";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to backend/.env before running an import."
      );
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const SYSTEM_PROMPT = `You are a data-mapping engine for GrowEasy CRM's CSV lead importer.

You will receive a JSON array of raw CSV rows. Each row's keys are whatever column
headers the source file happened to use (they vary wildly: Facebook Lead Ads exports,
Google Ads exports, Excel dumps, real-estate CRM exports, sales reports, or hand-made
spreadsheets). Your job is to intelligently map each row's available fields into the
canonical GrowEasy CRM schema below, using semantic understanding of column names and
values, not exact string matching.

CANONICAL CRM FIELDS
- created_at: lead creation date/time. Must be a string parseable by JavaScript's
  \`new Date(created_at)\`. Prefer ISO-like "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DD" format.
  If no date is present, leave it "".
- name: the lead's full name.
- email: the lead's primary email address.
- country_code: phone country code, formatted like "+91". Infer from the phone number
  or context when possible; if genuinely unknown, leave it "".
- mobile_without_country_code: the phone number digits only, with the country code
  stripped off.
- company: company/organization name.
- city, state, country: location fields.
- lead_owner: the salesperson/agent/owner assigned to the lead, if present.
- crm_status: MUST be exactly one of ${JSON.stringify(CRM_STATUS_VALUES)}, or "" if
  nothing in the row confidently maps to one of these. Use your judgement on synonyms,
  e.g. "closed won" / "converted" -> SALE_DONE, "not interested" / "junk" -> BAD_LEAD,
  "no answer" / "unreachable" -> DID_NOT_CONNECT, "interested" / "follow up" ->
  GOOD_LEAD_FOLLOW_UP.
- crm_note: free-text notes. Use this field for: remarks, follow-up notes, additional
  comments, ANY extra phone numbers beyond the first one, ANY extra email addresses
  beyond the first one, and any other useful information from the row that does not
  fit into another field. If several such things apply, combine them into one string
  separated by " | ".
- data_source: MUST be exactly one of ${JSON.stringify(DATA_SOURCE_VALUES)}, or "" if
  nothing in the row confidently matches. Do not guess loosely - only set this if the
  row gives a real signal (e.g. a campaign/project/source column naming one of these).
- possession_time: property possession time/date, if this is a real-estate lead.
- description: any additional descriptive text about the lead or property interest
  that isn't better placed in crm_note.

RULES YOU MUST FOLLOW
1. Only use the four allowed crm_status values above, or "". Never invent a new status.
2. Only use the five allowed data_source values above, or "". If none match
   confidently, leave it "".
3. created_at must remain valid for \`new Date(created_at)\` in JavaScript.
4. If a row has multiple emails, use the first as "email" and append the rest into
   crm_note. If a row has multiple phone numbers, use the first as
   "mobile_without_country_code" and append the rest into crm_note.
5. Keep every record as a single logical row - never introduce raw newlines inside a
   field. If a field needs a line break, escape it as "\\n".
6. SKIP a row (skip: true) if and only if it has neither a usable email NOR a usable
   phone number. Give a short, specific skip_reason in that case (e.g. "no email or
   phone number present").
7. Never fabricate data. If a field truly cannot be determined from the row, leave it
   as an empty string "" rather than guessing.
8. Match columns semantically: e.g. "Full Name", "Lead Name", "Contact Name" all map
   to name; "Phone", "Mobile", "Contact Number", "WhatsApp Number" all map to phone
   fields; "Enquiry", "Message", "Remarks", "Comments" often map to crm_note or
   description depending on content.`;

const SCHEMA_DEFINITION = {
  type: "OBJECT",
  properties: {
    results: {
      type: "ARRAY",
      description: "One entry per input row, in the same order as the input batch.",
      items: {
        type: "OBJECT",
        properties: {
          row_index: {
            type: "INTEGER",
            description: "0-based index of this row within the current batch.",
          },
          skip: {
            type: "BOOLEAN",
            description: "true if this row has neither a usable email nor phone number.",
          },
          skip_reason: {
            type: "STRING",
            description: "Required and specific when skip is true.",
          },
          record: {
            type: "OBJECT",
            description: "Required when skip is false. The mapped CRM record.",
            properties: {
              created_at: { type: "STRING" },
              name: { type: "STRING" },
              email: { type: "STRING" },
              country_code: { type: "STRING" },
              mobile_without_country_code: { type: "STRING" },
              company: { type: "STRING" },
              city: { type: "STRING" },
              state: { type: "STRING" },
              country: { type: "STRING" },
              lead_owner: { type: "STRING" },
              crm_status: {
                type: "STRING",
                enum: [...CRM_STATUS_VALUES],
                description: "Optional. Set only if a value confidently maps. Do not include this field if there is no match."
              },
              crm_note: { type: "STRING" },
              data_source: {
                type: "STRING",
                enum: [...DATA_SOURCE_VALUES],
                description: "Optional. Set only if a value confidently maps. Do not include this field if there is no match."
              },
              possession_time: { type: "STRING" },
              description: { type: "STRING" },
            },
            required: [
              "created_at",
              "name",
              "email",
              "country_code",
              "mobile_without_country_code",
              "company",
              "city",
              "state",
              "country",
              "lead_owner",
              "crm_note",
              "possession_time",
              "description",
            ],
          },
        },
        required: ["row_index", "skip"],
      },
    },
  },
  required: ["results"],
};

export interface IndexedCrmRecord {
  rowIndex: number;
  record: CrmRecord;
}

export interface BatchExtractionOutcome {
  imported: IndexedCrmRecord[];
  skipped: SkippedRecord[];
  succeeded: boolean;
  retried: boolean;
}

const MAX_RETRIES = 2;

/**
 * Runs a single batch of raw CSV rows through Gemini and returns mapped CRM
 * records + skipped rows. Retries with backoff on transient failures or
 * malformed JSON output.
 */
export async function extractBatch(
  rows: RawCsvRow[],
  batchOffset: number
): Promise<BatchExtractionOutcome> {
  let lastError: unknown = null;
  let retried = false;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      retried = true;
      await sleep(400 * 2 ** (attempt - 1));
    }

    try {
      const response = await getAiClient().models.generateContent({
        model: MODEL,
        contents: `Map the following ${rows.length} raw CSV rows (0-indexed) into GrowEasy CRM records:\n\n${JSON.stringify(
          rows.map((r, i) => ({ row_index: i, ...r }))
        )}`,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: SCHEMA_DEFINITION as any,
        },
      });

      const responseText = response.text;
      if (!responseText) throw new Error("Model did not return any text response.");

      const parsed = JSON.parse(responseText) as { results: any[] };
      if (!Array.isArray(parsed.results)) {
        throw new Error("Malformed JSON: missing results array.");
      }

      const imported: IndexedCrmRecord[] = [];
      const skipped: SkippedRecord[] = [];

      for (const item of parsed.results) {
        const rowIndex = batchOffset + (item.row_index ?? 0);
        const raw = rows[item.row_index] ?? {};

        if (item.skip) {
          skipped.push({
            rowIndex,
            reason: item.skip_reason || "Skipped by AI: no email or phone number.",
            raw,
          });
        } else if (item.record) {
          imported.push({ rowIndex, record: normalizeRecord(item.record) });
        } else {
          skipped.push({
            rowIndex,
            reason: "Model returned neither a record nor a skip reason.",
            raw,
          });
        }
      }

      return { imported, skipped, succeeded: true, retried };
    } catch (err) {
      lastError = err;
    }
  }

  console.error("Batch extraction failed after retries:", lastError);
  // Fall back to skipping the whole batch rather than losing the request silently.
  return {
    imported: [],
    skipped: rows.map((raw, i) => ({
      rowIndex: batchOffset + i,
      reason: `AI extraction failed after ${MAX_RETRIES + 1} attempts: ${
        lastError instanceof Error ? lastError.message : "unknown error"
      }`,
      raw,
    })),
    succeeded: false,
    retried,
  };
}

function normalizeRecord(record: any): CrmRecord {
  const status = CRM_STATUS_VALUES.includes(record.crm_status)
    ? record.crm_status
    : "";
  const source = DATA_SOURCE_VALUES.includes(record.data_source)
    ? record.data_source
    : "";

  const clean = (v: unknown) => (typeof v === "string" ? v.replace(/\r?\n/g, "\\n") : "");

  return {
    created_at: clean(record.created_at),
    name: clean(record.name),
    email: clean(record.email),
    country_code: clean(record.country_code),
    mobile_without_country_code: clean(record.mobile_without_country_code),
    company: clean(record.company),
    city: clean(record.city),
    state: clean(record.state),
    country: clean(record.country),
    lead_owner: clean(record.lead_owner),
    crm_status: status,
    crm_note: clean(record.crm_note),
    data_source: source,
    possession_time: clean(record.possession_time),
    description: clean(record.description),
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
