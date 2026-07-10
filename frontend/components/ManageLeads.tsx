"use client";

import { useState, useMemo } from "react";
import { CrmRecord } from "@/types/crm";

interface ManageLeadsProps {
  leads: CrmRecord[];
  onRefresh?: () => void;
}

// Initial mock leads to populate the screen if no CSV has been imported yet
const INITIAL_MOCK_LEADS: CrmRecord[] = [
  {
    name: "punnnf g",
    email: "kjgkhv2@gcghc.com",
    mobile_without_country_code: "917894561177",
    country_code: "+91",
    created_at: "2026-06-23 14:37:00",
    company: "—",
    city: "",
    state: "",
    country: "",
    lead_owner: "",
    crm_status: "SALE_DONE",
    crm_note: "",
    data_source: "leads_on_demand",
    possession_time: "",
    description: "",
  },
  {
    name: "kjlkvkh",
    email: "jkhbkbn@hjf.hfv",
    mobile_without_country_code: "911212121415",
    country_code: "+91",
    created_at: "2026-06-23 12:23:00",
    company: "fhtf",
    city: "",
    state: "",
    country: "",
    lead_owner: "",
    crm_status: "",
    crm_note: "",
    data_source: "",
    possession_time: "",
    description: "",
  },
  {
    name: "kugkkh",
    email: "ljgbjg@hgdh.hjc",
    mobile_without_country_code: "911212121217",
    country_code: "+91",
    created_at: "2026-06-23 12:17:00",
    company: "fhtf",
    city: "",
    state: "",
    country: "",
    lead_owner: "",
    crm_status: "",
    crm_note: "",
    data_source: "eden_park",
    possession_time: "",
    description: "",
  },
  {
    name: "hjvjv",
    email: "jfgf@fgd.com",
    mobile_without_country_code: "911515151515",
    country_code: "+91",
    created_at: "2026-06-23 12:16:00",
    company: "fhtf",
    city: "",
    state: "",
    country: "",
    lead_owner: "",
    crm_status: "GOOD_LEAD_FOLLOW_UP",
    crm_note: "",
    data_source: "",
    possession_time: "",
    description: "",
  },
  {
    name: "Abhraneel Dhar",
    email: "abhraneeldhar7@growe...",
    mobile_without_country_code: "919051589728",
    country_code: "+91",
    created_at: "2026-06-23 11:01:00",
    company: "groweasy",
    city: "",
    state: "",
    country: "",
    lead_owner: "",
    crm_status: "GOOD_LEAD_FOLLOW_UP",
    crm_note: "",
    data_source: "sarjapur_plots",
    possession_time: "",
    description: "",
  },
  {
    name: "fhjf ghf",
    email: "tjrf.ft@gfj.com",
    mobile_without_country_code: "911414141414",
    country_code: "+91",
    created_at: "2026-06-22 16:49:00",
    company: "thr rh",
    city: "",
    state: "",
    country: "",
    lead_owner: "",
    crm_status: "",
    crm_note: "",
    data_source: "",
    possession_time: "",
    description: "",
  },
  {
    name: "fhf",
    email: "gnhfg@fgjf.com",
    mobile_without_country_code: "911313131313",
    country_code: "+91",
    created_at: "2026-06-22 16:48:00",
    company: "fhtf",
    city: "",
    state: "",
    country: "",
    lead_owner: "",
    crm_status: "",
    crm_note: "",
    data_source: "meridian_tower",
    possession_time: "",
    description: "",
  },
  {
    name: "Abc 1",
    email: "abc1@kryf.com",
    mobile_without_country_code: "911212121212",
    country_code: "+91",
    created_at: "2026-06-22 16:44:00",
    company: "—",
    city: "",
    state: "",
    country: "",
    lead_owner: "",
    crm_status: "",
    crm_note: "",
    data_source: "",
    possession_time: "",
    description: "",
  },
];

export function ManageLeads({ leads, onRefresh }: ManageLeadsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  // Combine mock data with newly imported leads
  const allLeads = useMemo(() => {
    // Avoid duplicate names/emails if same is re-imported
    const seen = new Set<string>();
    const result: CrmRecord[] = [];
    
    // Add imported leads first
    leads.forEach((l) => {
      const key = `${l.email || ""}-${l.mobile_without_country_code || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(l);
      }
    });

    // Add mock leads if they don't duplicate
    INITIAL_MOCK_LEADS.forEach((l) => {
      const key = `${l.email || ""}-${l.mobile_without_country_code || ""}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(l);
      }
    });

    return result;
  }, [leads]);

  // Filter leads based on search query
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return allLeads;
    const query = searchQuery.toLowerCase().trim();
    return allLeads.filter(
      (lead) =>
        (lead.name || "").toLowerCase().includes(query) ||
        (lead.email || "").toLowerCase().includes(query) ||
        (lead.mobile_without_country_code || "").includes(query) ||
        (lead.company || "").toLowerCase().includes(query)
    );
  }, [allLeads, searchQuery]);

  const visibleLeads = filteredLeads.slice(0, visibleCount);

  function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  function renderStatusBadge(status: string) {
    switch (status) {
      case "SALE_DONE":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Sale Done
          </span>
        );
      case "GOOD_LEAD_FOLLOW_UP":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Good Lead
          </span>
        );
      case "DID_NOT_CONNECT":
        return (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
            Did Not Connect
          </span>
        );
      case "BAD_LEAD":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300">
            Bad Lead
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            Not Dialed
          </span>
        );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title block */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Manage Your Leads</h1>
        <p className="mt-1 text-sm text-muted">
          Monitor lead status, assign tasks, and close deals faster.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Enter email or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-rule bg-surface py-1.5 pl-3 pr-10 text-sm focus:border-rust focus:outline-none dark:border-dark-rule dark:bg-dark-surface dark:text-dark-ink"
          />
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-ink dark:hover:text-dark-ink"
            onClick={() => {}}
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        </div>
        
        {/* Search trigger button */}
        <button 
          onClick={() => {}} 
          className="rounded-md bg-rust px-4 py-1.5 text-sm font-medium text-white hover:bg-rust-dark transition-colors"
        >
          Search
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="rounded-md border border-rule bg-surface p-1.5 text-muted hover:bg-rule/30 hover:text-ink dark:border-dark-rule dark:bg-dark-surface dark:hover:bg-dark-rule/40 dark:hover:text-dark-ink"
          title="Refresh List"
        >
          <RefreshIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto rounded-lg border border-rule bg-surface dark:border-dark-rule dark:bg-dark-surface">
        <table className="w-full min-w-max table-auto text-left text-sm">
          <thead>
            <tr className="border-b border-rule bg-ink/5 dark:border-dark-rule dark:bg-dark-bg/60">
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Lead Name</th>
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Email</th>
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Contact</th>
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Date Created</th>
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Company</th>
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Status</th>
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Quality</th>
              <th className="px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule dark:divide-dark-rule">
            {visibleLeads.length > 0 ? (
              visibleLeads.map((lead, i) => (
                <tr
                  key={i}
                  className="hover:bg-rust-light/10 dark:hover:bg-rust/5 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{lead.name || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{lead.email || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {lead.mobile_without_country_code
                      ? `${lead.country_code || ""} ${lead.mobile_without_country_code}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">{formatDate(lead.created_at)}</td>
                  <td className="px-4 py-3 text-xs">{lead.company || "—"}</td>
                  <td className="px-4 py-3">{renderStatusBadge(lead.crm_status)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rule/45 text-xs text-muted dark:bg-dark-rule dark:text-dark-ink/80">
                      —
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="rounded border border-rule px-2.5 py-1 text-xs font-semibold hover:bg-rule/35 dark:border-dark-rule dark:hover:bg-dark-rule/50">
                      More &gt;
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted">
                  No leads found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {filteredLeads.length > visibleCount && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="rounded-md border border-rule bg-surface px-5 py-2 text-sm font-semibold hover:bg-rule/35 transition-colors dark:border-dark-rule dark:bg-dark-surface dark:hover:bg-dark-rule/50"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
    </svg>
  );
}
