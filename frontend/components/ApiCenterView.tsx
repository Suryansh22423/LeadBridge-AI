"use client";

import { useState } from "react";

export function ApiCenterView() {
  const [apiKey, setApiKey] = useState("ge_live_8f3c1a2d5e6f7b8a9c0d1e2f3a4b5c6d");
  const [copied, setCopied] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets = {
    curl: `curl -X POST http://localhost:4000/api/import \\
  -H "Authorization: Bearer ${apiKey}" \\
  -F "file=@/path/to/leads.csv"`,
    node: `const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('file', fs.createReadStream('/path/to/leads.csv'));

axios.post('http://localhost:4000/api/import', form, {
  headers: {
    ...form.getHeaders(),
    'Authorization': 'Bearer ${apiKey}'
  }
})
.then(res => console.log('Import triggered:', res.data.taskId))
.catch(err => console.error(err));`,
    python: `import requests

url = 'http://localhost:4000/api/import'
headers = { 'Authorization': 'Bearer ${apiKey}' }
files = { 'file': open('/path/to/leads.csv', 'rb') }

response = requests.post(url, headers=headers, files=files)
print('Import Task:', response.json())`,
  };

  const [activeLang, setActiveLang] = useState<"curl" | "node" | "python">("curl");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">API Center</h1>
        <p className="mt-1 text-sm text-muted">
          Integrate the lead importer programmatically into your web forms and external applications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credentials */}
        <div className="rounded-lg border border-rule bg-surface p-5 dark:border-dark-rule dark:bg-dark-surface space-y-4 max-w-sm w-full">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted">Developer Credentials</h3>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted uppercase">API Endpoint Base URL</label>
            <div className="rounded bg-paper p-2 font-mono text-xs font-semibold dark:bg-dark-bg border border-rule dark:border-dark-rule">
              http://localhost:4000/api
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted uppercase">Production API Token</label>
            <div className="relative flex items-center">
              <input
                type="password"
                readOnly
                value={apiKey}
                className="w-full rounded bg-paper p-2 pr-10 font-mono text-xs font-semibold dark:bg-dark-bg border border-rule dark:border-dark-rule focus:outline-none"
              />
              <button
                onClick={handleCopyKey}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-rust hover:underline"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Code Snippets */}
        <div className="lg:col-span-2 rounded-lg border border-rule bg-surface p-5 dark:border-dark-rule dark:bg-dark-surface space-y-4">
          <div className="flex items-center justify-between border-b border-rule dark:border-dark-rule pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted">Integration Snippets</h3>
            <div className="flex gap-2">
              {(["curl", "node", "python"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-2 py-1 text-[10px] font-bold uppercase rounded transition ${
                    activeLang === lang ? "bg-rust text-white" : "text-muted hover:bg-rule/15"
                  }`}
                >
                  {lang === "node" ? "Node.js" : lang === "python" ? "Python" : "cURL"}
                </button>
              ))}
            </div>
          </div>

          <pre className="rounded bg-paper p-4 font-mono text-xs overflow-x-auto dark:bg-dark-bg text-ink dark:text-dark-ink border border-rule dark:border-dark-rule leading-relaxed">
            {codeSnippets[activeLang]}
          </pre>
        </div>
      </div>
    </div>
  );
}
