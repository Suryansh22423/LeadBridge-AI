"use client";

import { CrmRecord } from "@/types/crm";

interface DashboardViewProps {
  leads: CrmRecord[];
}

export function DashboardView({ leads }: DashboardViewProps) {
  const total = leads.length;
  const saleClosed = leads.filter((l) => l.crm_status === "SALE_DONE").length;
  const goodLeads = leads.filter((l) => l.crm_status === "GOOD_LEAD_FOLLOW_UP").length;
  const didNotConnect = leads.filter((l) => l.crm_status === "DID_NOT_CONNECT").length;
  const badLeads = leads.filter((l) => l.crm_status === "BAD_LEAD").length;

  const successRate = total > 0 ? Math.round((saleClosed / total) * 100) : 0;
  const activeFollowups = total > 0 ? Math.round((goodLeads / total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Performance Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Review conversion metrics, lead quality indicators, and pipeline analytics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Leads" value={total} change="+12.3% this week" />
        <StatCard label="Sales Closed" value={saleClosed} tone="success" />
        <StatCard label="Good Leads" value={goodLeads} tone="primary" />
        <StatCard label="Success Rate" value={`${successRate}%`} tone="accent" />
      </div>

      {/* Progress Bars / Pipeline */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-rule bg-surface p-6 dark:border-dark-rule dark:bg-dark-surface">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-4 text-muted">Pipeline Health</h3>
          <div className="space-y-4">
            <PipelineItem label="Sale Done" count={saleClosed} total={total} color="bg-blue-600" />
            <PipelineItem label="Good Lead (Follow up)" count={goodLeads} total={total} color="bg-green-600" />
            <PipelineItem label="Did Not Connect" count={didNotConnect} total={total} color="bg-yellow-600" />
            <PipelineItem label="Bad Lead" count={badLeads} total={total} color="bg-red-600" />
          </div>
        </div>

        <div className="rounded-lg border border-rule bg-surface p-6 dark:border-dark-rule dark:bg-dark-surface">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-4 text-muted">Lead Quality Distribution</h3>
          <div className="flex h-48 items-end gap-3 justify-around pt-6">
            <BarChartItem label="Closed" value={saleClosed} max={total} color="bg-blue-500" />
            <BarChartItem label="Good" value={goodLeads} max={total} color="bg-green-500" />
            <BarChartItem label="No Connect" value={didNotConnect} max={total} color="bg-yellow-500" />
            <BarChartItem label="Bad" value={badLeads} max={total} color="bg-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  tone,
}: {
  label: string;
  value: string | number;
  change?: string;
  tone?: "success" | "primary" | "accent";
}) {
  return (
    <div className="rounded-lg border border-rule bg-surface p-5 dark:border-dark-rule dark:bg-dark-surface">
      <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold mt-2 font-display">{value}</p>
      {change && <p className="text-[10px] text-green-600 mt-1">{change}</p>}
    </div>
  );
}

function PipelineItem({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span>{label}</span>
        <span className="text-muted">
          {count} leads ({percentage}%)
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-rule/30 dark:bg-dark-rule overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function BarChartItem({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-2 h-full justify-end flex-1">
      <span className="text-xs font-semibold font-mono">{value}</span>
      <div className="w-8 rounded-t bg-rule/20 dark:bg-dark-rule flex-1 flex items-end overflow-hidden max-h-[120px]">
        <div className={`w-full ${color} rounded-t transition-all duration-500`} style={{ height: `${percentage}%` }} />
      </div>
      <span className="text-[10px] text-muted font-bold uppercase">{label}</span>
    </div>
  );
}
