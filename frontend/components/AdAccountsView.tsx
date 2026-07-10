"use client";

import { useState } from "react";

export function AdAccountsView() {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [fbConnected, setFbConnected] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Ad Accounts</h1>
        <p className="mt-1 text-sm text-muted">
          Integrate and sync lead forms directly from Facebook Lead Ads and Google campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div className="rounded-lg border border-rule bg-surface p-5 dark:border-dark-rule dark:bg-dark-surface flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Google Ads Integration</h3>
            <p className="text-xs text-muted">Auto-capture leads from Search and Performance Max campaigns.</p>
          </div>
          <button
            onClick={() => setGoogleConnected(!googleConnected)}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
              googleConnected
                ? "bg-stamp-greenBg text-stamp-green border border-stamp-green/20"
                : "border border-rule hover:bg-rule/10"
            }`}
          >
            {googleConnected ? "Connected ✓" : "Connect"}
          </button>
        </div>

        <div className="rounded-lg border border-rule bg-surface p-5 dark:border-dark-rule dark:bg-dark-surface flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Facebook Ads Integration</h3>
            <p className="text-xs text-muted">Synchronize leads generated from Facebook & Instagram Instant Forms.</p>
          </div>
          <button
            onClick={() => setFbConnected(!fbConnected)}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
              fbConnected
                ? "bg-stamp-greenBg text-stamp-green border border-stamp-green/20"
                : "border border-rule hover:bg-rule/10"
            }`}
          >
            {fbConnected ? "Connected ✓" : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}
