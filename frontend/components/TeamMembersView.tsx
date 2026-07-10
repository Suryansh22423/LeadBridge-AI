"use client";

import { useState } from "react";

interface Member {
  name: string;
  role: string;
  status: "active" | "inactive";
  leads: number;
}

export function TeamMembersView() {
  const [members, setMembers] = useState<Member[]>([
    { name: "VK Test", role: "Owner / Admin", status: "active", leads: 42 },
    { name: "Vikram Singh", role: "Sales Exec", status: "active", leads: 18 },
    { name: "Anita Rao", role: "Lead Agent", status: "active", leads: 25 },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Sales Exec");

  const handleAdd = () => {
    if (!name) return;
    setMembers([...members, { name, role, status: "active", leads: 0 }]);
    setName("");
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="mt-1 text-sm text-muted">
            Manage agents, monitor assignments, and track sales performance.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-md bg-rust px-4 py-1.5 text-xs font-bold text-white hover:bg-rust-dark transition-colors"
        >
          Add Agent
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-rule bg-surface dark:border-dark-rule dark:bg-dark-surface">
        <table className="w-full min-w-max table-auto text-left text-sm">
          <thead>
            <tr className="border-b border-rule bg-ink/5 dark:border-dark-rule dark:bg-dark-bg/60">
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Name</th>
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Role</th>
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Status</th>
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Active Leads</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule dark:divide-dark-rule">
            {members.map((member, i) => (
              <tr key={i} className="hover:bg-rust-light/10 dark:hover:bg-rust/5 transition-colors">
                <td className="px-4 py-3 font-medium">{member.name}</td>
                <td className="px-4 py-3 text-muted text-xs">{member.role}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {member.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs font-bold">{member.leads}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="relative w-full max-w-sm rounded-xl border border-rule bg-surface p-6 shadow-2xl dark:border-dark-rule dark:bg-dark-surface">
            <h3 className="font-bold text-sm mb-4">Add Team Member</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-muted font-bold">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter staff name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-rule bg-paper p-2 text-xs focus:outline-none dark:border-dark-rule dark:bg-dark-bg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted font-bold">Role Title</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-rule bg-paper p-2 text-xs focus:outline-none dark:border-dark-rule dark:bg-dark-bg"
                >
                  <option value="Sales Exec">Sales Exec</option>
                  <option value="Lead Agent">Lead Agent</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-rule px-4 py-1.5 text-xs font-semibold hover:bg-rule/10 dark:border-dark-rule"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="rounded-md bg-rust px-4 py-1.5 text-xs font-bold text-white hover:bg-rust-dark transition-colors"
                >
                  Add Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
