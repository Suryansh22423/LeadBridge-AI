"use client";

import { useState } from "react";
import clsx from "clsx";
import { ImportResult } from "@/types/crm";
import { CRM_FIELD_ORDER } from "@/types/crm";
import { LedgerTable } from "./LedgerTable";
import { ManifestStat, StampBadge } from "./StampBadge";

export function ResultView({ result, onStartOver }: { result: ImportResult; onStartOver: () => void }) {
  const [tab, setTab] = useState<"imported" | "skipped">("imported");

  function downloadJson() {
    const blob = new Blob([JSON.stringify(result.imported, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "groweasy-crm-import.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ManifestStat label="Total rows" value={result.totalRows} />
        <ManifestStat label="Imported" value={result.totalImported} tone="success" />
        <ManifestStat label="Skipped" value={result.totalSkipped} tone="error" />
        <ManifestStat
          label="Batches"
          value={`${result.batches.succeeded}/${result.batches.total}`}
        />
      </div>

      {result.batches.failed > 0 && (
        <p className="mb-4 rounded-md bg-stamp-redBg px-3 py-2 text-sm text-stamp-red dark:bg-stamp-red/10">
          {result.batches.failed} batch{result.batches.failed === 1 ? "" : "es"} failed after
          retries — those rows were marked as skipped instead of silently dropped.
        </p>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-rule bg-surface p-1 dark:border-dark-rule dark:bg-dark-surface">
          <TabButton active={tab === "imported"} onClick={() => setTab("imported")}>
            Imported ({result.totalImported})
          </TabButton>
          <TabButton active={tab === "skipped"} onClick={() => setTab("skipped")}>
            Skipped ({result.totalSkipped})
          </TabButton>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadJson}
            className="rounded-md border border-rule px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-rule/30 dark:border-dark-rule dark:text-dark-ink dark:hover:bg-dark-rule/40"
          >
            Download JSON
          </button>
          <button
            onClick={onStartOver}
            className="rounded-md bg-rust px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-rust-dark"
          >
            Import another CSV
          </button>
        </div>
      </div>

      {tab === "imported" ? (
        <LedgerTable
          columns={["status", ...CRM_FIELD_ORDER]}
          rows={result.imported.map((r) => [
            <StampBadge key="s" kind="imported" />,
            ...CRM_FIELD_ORDER.map((f) => r[f] || <span className="text-muted">—</span>),
          ])}
          emptyLabel="Nothing was imported."
        />
      ) : (
        <LedgerTable
          columns={["reason", "raw row"]}
          rows={result.skipped.map((s) => [
            <span key="r" className="flex items-center gap-2">
              <StampBadge kind="skipped" />
              <span>{s.reason}</span>
            </span>,
            <span key="raw" className="text-muted">
              {JSON.stringify(s.raw)}
            </span>,
          ])}
          emptyLabel="Nothing was skipped — every row had an email or phone number."
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-ink text-paper dark:bg-dark-rule dark:text-dark-ink"
          : "text-muted hover:text-ink dark:hover:text-dark-ink"
      )}
    >
      {children}
    </button>
  );
}
