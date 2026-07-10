import { ReactNode, useState, useRef, useEffect, UIEvent } from "react";

interface Props {
  columns: string[];
  rows: ReactNode[][];
  maxHeight?: string;
  emptyLabel?: string;
}

/**
 * A dense, spreadsheet-like table: sticky header, independent horizontal and
 * vertical scroll, monospace data cells. Uses virtual list rendering to support
 * large files with thousands of rows without performance lag.
 */
export function LedgerTable({ columns, rows, maxHeight = "60vh", emptyLabel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);

      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-rule bg-surface px-6 py-12 text-center text-sm text-muted dark:border-dark-rule dark:bg-dark-surface">
        {emptyLabel || "No rows to show."}
      </div>
    );
  }

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const rowHeight = 33; // Average height of row in px

  // Calculate rendering indices
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 5);
  const endIndex = Math.min(rows.length, Math.floor((scrollTop + containerHeight) / rowHeight) + 5);

  const visibleRows = rows.slice(startIndex, endIndex);
  const paddingTop = startIndex * rowHeight;
  const paddingBottom = (rows.length - endIndex) * rowHeight;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="overflow-auto rounded-lg border border-rule dark:border-dark-rule"
      style={{ maxHeight }}
    >
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 bg-ink text-paper dark:bg-dark-surface dark:text-dark-ink">
          <tr>
            <th className="whitespace-nowrap px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-wide text-paper/60 dark:text-dark-ink/50">
              #
            </th>
            {columns.map((col) => (
              <th
                key={col}
                className="whitespace-nowrap px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-wide"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr style={{ height: paddingTop }} aria-hidden="true">
              <td colSpan={columns.length + 1} style={{ height: paddingTop, padding: 0 }} />
            </tr>
          )}
          {visibleRows.map((row, i) => {
            const actualIndex = startIndex + i;
            return (
              <tr
                key={actualIndex}
                className="border-b border-rule last:border-0 odd:bg-surface even:bg-paper hover:bg-rust-light/30 dark:border-dark-rule dark:odd:bg-dark-surface dark:even:bg-dark-bg dark:hover:bg-rust/10"
                style={{ height: rowHeight }}
              >
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-muted">
                  {actualIndex + 1}
                </td>
                {row.map((cell, j) => (
                  <td key={j} className="whitespace-nowrap px-3 py-2 font-mono text-xs font-medium">
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr style={{ height: paddingBottom }} aria-hidden="true">
              <td colSpan={columns.length + 1} style={{ height: paddingBottom, padding: 0 }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
