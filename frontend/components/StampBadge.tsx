import clsx from "clsx";

export function StampBadge({ kind, label }: { kind: "imported" | "skipped"; label?: string }) {
  const isImported = kind === "imported";
  return (
    <span
      className={clsx(
        "inline-flex select-none items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
        isImported
          ? "border-stamp-green/40 bg-stamp-greenBg text-stamp-green dark:bg-stamp-green/10"
          : "border-stamp-red/40 bg-stamp-redBg text-stamp-red dark:bg-stamp-red/10"
      )}
      style={{ transform: "rotate(-1.5deg)" }}
    >
      {label || (isImported ? "Imported" : "Skipped")}
    </span>
  );
}

export function ManifestStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "success" | "error";
}) {
  return (
    <div className="rounded-lg border border-rule bg-surface px-4 py-3 dark:border-dark-rule dark:bg-dark-surface">
      <p className="font-mono text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p
        className={clsx(
          "mt-1 font-display text-2xl font-medium tabular-nums",
          tone === "success" && "text-stamp-green",
          tone === "error" && "text-stamp-red",
          tone === "default" && "text-ink dark:text-dark-ink"
        )}
      >
        {value}
      </p>
    </div>
  );
}
