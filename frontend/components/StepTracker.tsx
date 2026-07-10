import clsx from "clsx";

export type Step = "upload" | "preview" | "importing" | "result";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "preview", label: "Preview" },
  { key: "importing", label: "Confirm" },
  { key: "result", label: "Result" },
];

export function StepTracker({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] transition-colors",
                  isActive && "bg-rust text-white",
                  isDone && "bg-stamp-greenBg text-stamp-green dark:bg-dark-surface",
                  !isActive && !isDone && "bg-rule/60 text-muted dark:bg-dark-rule dark:text-muted"
                )}
              >
                {isDone ? "✓" : i + 1}
              </span>
              <span
                className={clsx(
                  "hidden text-sm sm:inline",
                  isActive ? "font-semibold text-ink dark:text-dark-ink" : "text-muted"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className="h-px w-4 bg-rule dark:bg-dark-rule sm:w-8" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
