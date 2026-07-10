"use client";

import { useCallback, useRef, useState } from "react";
import clsx from "clsx";

interface Props {
  onFileSelected: (file: File) => void;
  error?: string | null;
}

export function CsvDropzone({ onFileSelected, error }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".csv")) {
        onFileSelected(file); // let parent surface a consistent error message
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={clsx(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-16 text-center transition-colors",
          isDragging
            ? "border-rust bg-rust-light/40 dark:bg-rust/10"
            : "border-rule bg-surface hover:border-rust/50 dark:border-dark-rule dark:bg-dark-surface"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rust-light text-rust dark:bg-rust/15">
          <UploadIcon />
        </div>
        <div>
          <p className="font-display text-lg font-medium">Drop a lead CSV here</p>
          <p className="mt-1 text-sm text-muted">
            or click to browse — Facebook, Google Ads, Excel, any layout
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && (
        <p className="mt-3 rounded-md bg-stamp-redBg px-3 py-2 text-sm text-stamp-red dark:bg-stamp-red/10">
          {error}
        </p>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 16V4M12 4L7 9M12 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
