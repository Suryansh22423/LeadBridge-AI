"use client";

import { useState } from "react";

export function EngageLeadsView() {
  const [selectedTemplate, setSelectedTemplate] = useState("welcome");

  const templates = {
    welcome: {
      subject: "Welcome to GrowEasy CRM - Let's get started",
      body: "Hi [Lead Name],\n\nThanks for reaching out! We received your inquiry and would love to schedule a quick call to understand how we can help you.\n\nBest regards,\nVK Test Team",
    },
    callback: {
      subject: "Following up on your callback request",
      body: "Hi [Lead Name],\n\nI tried calling your number earlier but couldn't reach you. Please let me know when you are free for a quick sync.\n\nBest,\nVK Test Team",
    },
  };

  const activeTemplate = templates[selectedTemplate as keyof typeof templates] || templates.welcome;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Engage Leads</h1>
        <p className="mt-1 text-sm text-muted">
          Compose and preview automated email follow-up templates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border border-rule bg-surface p-4 dark:border-dark-rule dark:bg-dark-surface space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted mb-2">Campaign Templates</h3>
          <button
            onClick={() => setSelectedTemplate("welcome")}
            className={`w-full text-left p-3 rounded-md text-xs font-semibold hover:bg-rule/20 ${
              selectedTemplate === "welcome" ? "bg-rust-light/35 text-rust" : ""
            }`}
          >
            👋 Welcome Email
          </button>
          <button
            onClick={() => setSelectedTemplate("callback")}
            className={`w-full text-left p-3 rounded-md text-xs font-semibold hover:bg-rule/20 ${
              selectedTemplate === "callback" ? "bg-rust-light/35 text-rust" : ""
            }`}
          >
            📞 Callback Follow-up
          </button>
        </div>

        <div className="col-span-2 rounded-lg border border-rule bg-surface p-5 dark:border-dark-rule dark:bg-dark-surface space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-muted">Subject Header</label>
            <input
              type="text"
              readOnly
              value={activeTemplate.subject}
              className="w-full rounded-md border border-rule bg-paper p-2 text-xs font-medium focus:outline-none dark:border-dark-rule dark:bg-dark-bg"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-muted">Message Body</label>
            <textarea
              readOnly
              value={activeTemplate.body}
              rows={6}
              className="w-full rounded-md border border-rule bg-paper p-2 text-xs font-mono focus:outline-none dark:border-dark-rule dark:bg-dark-bg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
