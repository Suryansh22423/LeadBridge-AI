"use client";

interface ProgressProps {
  rowCount: number;
  percent: number;
  completedBatches: number;
  totalBatches: number;
}

export function ImportProgress({
  rowCount,
  percent,
  completedBatches,
  totalBatches,
}: ProgressProps) {
  const estimatedBatches = totalBatches || Math.ceil(rowCount / 15);

  return (
    <div className="rounded-lg border border-rule bg-surface p-8 text-center dark:border-dark-rule dark:bg-dark-surface">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-rule border-t-rust dark:border-dark-rule" />
      <p className="font-display text-lg font-medium">Mapping {rowCount} rows into CRM format…</p>
      <p className="mt-1 text-sm text-muted">
        Processed {completedBatches} of {estimatedBatches} batch{estimatedBatches === 1 ? "" : "es"}{" "}
        ({percent}%) using Gemini.
      </p>
      <div className="mx-auto mt-5 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-rule dark:bg-dark-rule">
        <div
          className="h-full rounded-full bg-rust transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
