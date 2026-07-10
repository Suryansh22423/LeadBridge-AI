"use client";

import { useState } from "react";
import { CRM_FIELD_ORDER } from "@/types/crm";

export function CrmFieldsView() {
  const [fields, setFields] = useState(
    CRM_FIELD_ORDER.map((f) => ({
      name: f,
      required: ["name", "email", "created_at"].includes(f),
      enabled: true,
      description: f === "created_at"
        ? "Timestamp when lead was added"
        : f === "email"
        ? "Primary email address"
        : f === "name"
        ? "Lead name"
        : "Additional CRM system attribute details",
    }))
  );

  const handleToggle = (index: number) => {
    const updated = [...fields];
    if (updated[index].required) return; // Prevent disabling required fields
    updated[index].enabled = !updated[index].enabled;
    setFields(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">CRM Schema Fields</h1>
        <p className="mt-1 text-sm text-muted">
          Define active fields and toggle synchronization parameters.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-rule bg-surface dark:border-dark-rule dark:bg-dark-surface max-w-2xl">
        <table className="w-full min-w-max table-auto text-left text-sm">
          <thead>
            <tr className="border-b border-rule bg-ink/5 dark:border-dark-rule dark:bg-dark-bg/60">
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Field Name</th>
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Description</th>
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Mandatory</th>
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Sync Enabled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule dark:divide-dark-rule text-xs">
            {fields.map((field, i) => (
              <tr key={i} className="hover:bg-rust-light/10 dark:hover:bg-rust/5 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold">{field.name}</td>
                <td className="px-4 py-3 text-muted">{field.description}</td>
                <td className="px-4 py-3">
                  {field.required ? (
                    <span className="rounded bg-rust-light px-1.5 py-0.5 text-[10px] font-bold text-rust dark:bg-rust/15">
                      Yes
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={field.enabled}
                    disabled={field.required}
                    onChange={() => handleToggle(i)}
                    className="h-4 w-4 rounded border-rule text-rust focus:ring-rust dark:border-dark-rule"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
