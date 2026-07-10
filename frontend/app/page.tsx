"use client";

import { useCallback, useState, useEffect } from "react";
import { Sidebar, ActiveTab } from "@/components/Sidebar";
import { ManageLeads } from "@/components/ManageLeads";
import { CsvDropzone } from "@/components/CsvDropzone";
import { LedgerTable } from "@/components/LedgerTable";
import { ImportProgress } from "@/components/ImportProgress";
import { ResultView } from "@/components/ResultView";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { parseCsvClientSide } from "@/lib/parseCsv";
import { importCsv, ApiError } from "@/lib/api";
import { ImportResult, RawCsvRow, CrmRecord } from "@/types/crm";

// Page Views
import { DashboardView } from "@/components/DashboardView";
import { GenerateLeadsView } from "@/components/GenerateLeadsView";
import { EngageLeadsView } from "@/components/EngageLeadsView";
import { TeamMembersView } from "@/components/TeamMembersView";
import { AdAccountsView } from "@/components/AdAccountsView";
import { WhatsAppView } from "@/components/WhatsAppView";
import { TeleCallingView } from "@/components/TeleCallingView";
import { CrmFieldsView } from "@/components/CrmFieldsView";
import { ApiCenterView } from "@/components/ApiCenterView";

const PREVIEW_ROW_LIMIT = 50;

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("lead-sources");

  // Importer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<"upload" | "preview" | "importing" | "result">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<RawCsvRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Real-time SSE progress states
  const [importPercent, setImportPercent] = useState(0);
  const [completedBatches, setCompletedBatches] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);

  // Leads list state (persisted)
  const [importedLeads, setImportedLeads] = useState<CrmRecord[]>([]);

  // Load imported leads from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("groweasy_imported_leads");
    if (saved) {
      try {
        setImportedLeads(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved leads:", e);
      }
    }
  }, []);

  const handleFileSelected = useCallback(async (selected: File) => {
    setError(null);

    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a .csv file.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("File is too large (max 10MB).");
      return;
    }

    try {
      const { headers, rows } = await parseCsvClientSide(selected);
      setFile(selected);
      setHeaders(headers);
      setRows(rows);
      setRowCount(rows.length);
      setImportStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that CSV file.");
    }
  }, []);

  async function handleConfirm() {
    if (!file) return;
    setImportStep("importing");
    setImportPercent(0);
    setCompletedBatches(0);
    setTotalBatches(0);
    setIsConfirming(true);
    setError(null);
    try {
      const res = await importCsv(file, (pct, done, total) => {
        setImportPercent(pct);
        setCompletedBatches(done);
        setTotalBatches(total);
      });
      setResult(res);
      setImportStep("result");

      // Save newly imported leads to the local CRM leads list
      const updatedLeads = [...res.imported, ...importedLeads];
      setImportedLeads(updatedLeads);
      localStorage.setItem("groweasy_imported_leads", JSON.stringify(updatedLeads));

      // Close the modal to show the manifest on the dashboard
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong during import.");
      setImportStep("preview");
    } finally {
      setIsConfirming(false);
    }
  }

  function resetImporter() {
    setImportStep("upload");
    setFile(null);
    setHeaders([]);
    setRows([]);
    setRowCount(0);
    setError(null);
    setImportPercent(0);
    setCompletedBatches(0);
    setTotalBatches(0);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    // Don't reset if we are showing results or importing
    if (importStep === "upload" || importStep === "preview") {
      resetImporter();
    }
  }

  function handleOpenModal() {
    resetImporter();
    setIsModalOpen(true);
  }

  function clearAllSavedLeads() {
    if (window.confirm("Are you sure you want to clear all leads?")) {
      setImportedLeads([]);
      localStorage.removeItem("groweasy_imported_leads");
    }
  }

  function downloadTemplate() {
    const csvHeaders = [
      "created_at",
      "name",
      "email",
      "country_code",
      "mobile_without_country_code",
      "company",
      "city",
      "state",
      "country",
      "lead_owner",
      "crm_status",
      "crm_note",
      "data_source",
      "possession_time",
      "description"
    ].join(",");
    const csvRows = [
      '"2026-07-09 10:00:00","John Doe","john.doe@example.com","+91","9876543210","GrowEasy","Mumbai","Maharashtra","India","Vikram","GOOD_LEAD_FOLLOW_UP","Client wants callback","leads_on_demand","",""',
      '"2026-07-09 11:30:00","Sarah Johnson","sarah.j@example.com","+91","9876543211","Tech Solutions","Bangalore","Karnataka","India","Anita","SALE_DONE","Deal closed","eden_park","",""',
    ].join("\n");

    const csvContent = `${csvHeaders}\n${csvRows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "groweasy_leads_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleLeadsGenerated = (newLeads: CrmRecord[]) => {
    const updatedLeads = [...newLeads, ...importedLeads];
    setImportedLeads(updatedLeads);
    localStorage.setItem("groweasy_imported_leads", JSON.stringify(updatedLeads));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface dark:bg-dark-bg text-ink dark:text-dark-ink font-body transition-colors">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Main Panel */}
      <main className="flex-1 overflow-y-auto bg-paper dark:bg-dark-bg p-6 md:p-10">

        {/* Top Header */}
        <header className="mb-8 flex items-center justify-between border-b border-rule dark:border-dark-rule pb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-rust">GrowEasy CRM</span>
            <h2 className="text-xl font-bold tracking-tight mt-0.5">
              {activeTab === "lead-sources" && "Lead Sources"}
              {activeTab === "manage-leads" && "Manage Leads"}
              {activeTab === "dashboard" && "Performance Dashboard"}
              {activeTab !== "lead-sources" && activeTab !== "manage-leads" && activeTab !== "dashboard" && activeTab.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
            </h2>
          </div>
          <DarkModeToggle />
        </header>

        {/* Dynamic Panel Routing */}
        {activeTab === "dashboard" && <DashboardView leads={importedLeads} />}

        {activeTab === "generate-leads" && (
          <GenerateLeadsView onLeadsGenerated={handleLeadsGenerated} />
        )}

        {activeTab === "manage-leads" && (
          <div className="space-y-4">
            {importedLeads.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={clearAllSavedLeads}
                  className="rounded-md border border-stamp-red/30 bg-stamp-redBg/30 px-3 py-1 text-xs font-semibold text-stamp-red hover:bg-stamp-redBg/60 dark:bg-stamp-red/10 dark:hover:bg-stamp-red/20"
                >
                  Clear Leads List
                </button>
              </div>
            )}
            <ManageLeads
              leads={importedLeads}
              onRefresh={() => {
                const saved = localStorage.getItem("groweasy_imported_leads");
                if (saved) setImportedLeads(JSON.parse(saved));
              }}
            />
          </div>
        )}

        {activeTab === "engage-leads" && <EngageLeadsView />}

        {activeTab === "team-members" && <TeamMembersView />}

        {activeTab === "ad-accounts" && <AdAccountsView />}

        {activeTab === "whatsapp" && <WhatsAppView />}

        {activeTab === "tele-calling" && <TeleCallingView />}

        {activeTab === "crm-fields" && <CrmFieldsView />}

        {activeTab === "api-center" && <ApiCenterView />}

        {activeTab === "lead-sources" && (
          <div className="space-y-8">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Lead Channels</h1>
              <p className="mt-1 text-sm text-muted">
                Connect, manage, and control all your lead channels from one dashboard.
              </p>
            </div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* CSV Importer Card */}
              <div
                onClick={handleOpenModal}
                className="flex cursor-pointer flex-col justify-between rounded-lg border border-rule bg-surface p-5 hover:border-rust hover:shadow-sm dark:border-dark-rule dark:bg-dark-surface transition-all"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rust-light text-rust dark:bg-rust/20 mb-4">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-base font-bold">Import Leads via CSV</h3>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">
                    Upload a CSV file to bulk import leads into your system. AI maps raw formats instantly.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-semibold text-rust">
                  <span>Import leads</span>
                  <span className="text-lg">→</span>
                </div>
              </div>

              {/* Google Ads Card (Mocked Link to Ad Accounts) */}
              <div 
                onClick={() => setActiveTab("ad-accounts")}
                className="flex cursor-pointer flex-col justify-between rounded-lg border border-rule bg-surface p-5 hover:border-rust hover:shadow-sm dark:border-dark-rule dark:bg-dark-surface transition-all"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rule/50 text-muted dark:bg-dark-rule mb-4">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-muted">Google Ads</h3>
                    <span className="rounded bg-rule/40 px-1.5 py-0.5 text-[9px] font-bold text-muted dark:bg-dark-rule">Configure</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">
                    Sync lead forms directly from your Google Ads search campaigns.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-semibold text-rust">
                  <span>Link accounts</span>
                  <span className="text-lg">→</span>
                </div>
              </div>

              {/* Facebook Ads Card (Mocked Link to Ad Accounts) */}
              <div 
                onClick={() => setActiveTab("ad-accounts")}
                className="flex cursor-pointer flex-col justify-between rounded-lg border border-rule bg-surface p-5 hover:border-rust hover:shadow-sm dark:border-dark-rule dark:bg-dark-surface transition-all"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rule/50 text-muted dark:bg-dark-rule mb-4">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-muted">Facebook Ads</h3>
                    <span className="rounded bg-rule/40 px-1.5 py-0.5 text-[9px] font-bold text-muted dark:bg-dark-rule">Configure</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">
                    Import leads generated from Facebook and Instagram lead generation ads.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-semibold text-rust">
                  <span>Link accounts</span>
                  <span className="text-lg">→</span>
                </div>
              </div>
            </div>

            {/* Manifest results shown on Lead Sources Page once completed */}
            {result && (
              <section className="mt-8 border-t border-rule dark:border-dark-rule pt-8">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-lg font-bold">CRM Import Manifest</h2>
                    <p className="text-xs text-muted">
                      Review results from your last import: {result.totalImported} imported, {result.totalSkipped} skipped.
                    </p>
                  </div>
                  <button
                    onClick={() => { setResult(null); }}
                    className="text-xs text-muted hover:text-rust font-semibold"
                  >
                    Clear Manifest
                  </button>
                </div>
                <ResultView result={result} onStartOver={handleOpenModal} />
              </section>
            )}
          </div>
        )}
      </main>

      {/* CSV Import Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div className="relative w-full max-w-2xl rounded-xl border border-rule bg-surface p-6 shadow-2xl dark:border-dark-rule dark:bg-dark-surface max-h-[90vh] flex flex-col">

            {/* Modal Close */}
            <button
              onClick={handleCloseModal}
              disabled={isConfirming}
              className="absolute top-4 right-4 text-muted hover:text-ink dark:hover:text-dark-ink transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold">Import Leads via CSV</h2>
              <p className="text-xs text-muted">Upload a CSV file to bulk import leads into your system.</p>
            </div>

            {/* Modal Body / Steps */}
            <div className="flex-1 overflow-y-auto py-2">

              {/* Error Alert */}
              {error && (
                <div className="mb-4 rounded-md bg-stamp-redBg px-3 py-2 text-xs text-stamp-red dark:bg-stamp-red/10 border border-stamp-red/20">
                  {error}
                </div>
              )}

              {/* Step 1: Upload Dropzone */}
              {importStep === "upload" && (
                <div className="space-y-4">
                  <CsvDropzone onFileSelected={handleFileSelected} />

                  <div className="rounded-lg bg-paper p-3 text-xs text-muted dark:bg-dark-bg/60 space-y-2">
                    <p className="font-semibold text-ink dark:text-dark-ink">Supported file: .csv (max 10MB)</p>
                    <p className="leading-relaxed">
                      <span className="font-medium text-ink dark:text-dark-ink">Required schema fields:</span> created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description.
                    </p>
                    <p className="text-[10px] text-muted italic">
                      AI maps any column headers and layout structures semantically into this schema.
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-rule dark:border-dark-rule pt-4 mt-6">
                    <button
                      onClick={downloadTemplate}
                      className="inline-flex items-center gap-1.5 rounded-md border border-rule px-3 py-1.5 text-xs font-semibold text-ink hover:bg-rule/20 dark:border-dark-rule dark:text-dark-ink dark:hover:bg-dark-rule/50 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4a3 3 0 00-3-3m3 3l-3 3m3-3H9" />
                      </svg>
                      Download Sample CSV Template
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCloseModal}
                        className="rounded-md border border-rule px-4 py-1.5 text-xs font-semibold hover:bg-rule/10 dark:border-dark-rule"
                      >
                        Cancel
                      </button>
                      <button
                        disabled
                        className="rounded-md bg-rust/60 px-4 py-1.5 text-xs font-semibold text-white cursor-not-allowed"
                      >
                        Upload File
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: In-Modal CSV Preview */}
              {importStep === "preview" && (
                <div className="space-y-4 flex flex-col h-full">
                  <div className="flex items-center gap-2 rounded-lg border border-rule bg-paper p-3 dark:border-dark-rule dark:bg-dark-bg/60">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rust-light text-rust dark:bg-rust/20">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-xs truncate">{file?.name}</p>
                      <p className="text-[10px] text-muted">
                        {(file!.size / 1024).toFixed(1)} KB · {rowCount} rows · {headers.length} columns detected
                      </p>
                    </div>
                    <button
                      onClick={resetImporter}
                      className="text-xs text-rust hover:underline font-semibold"
                    >
                      Change File
                    </button>
                  </div>

                  <div className="flex-1 overflow-hidden min-h-[220px]">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Raw File Preview (First {PREVIEW_ROW_LIMIT} rows)</p>
                    <LedgerTable
                      columns={headers}
                      maxHeight="250px"
                      rows={rows
                        .slice(0, PREVIEW_ROW_LIMIT)
                        .map((row) => headers.map((h) => row[h] || <span className="text-muted">—</span>))}
                    />
                  </div>

                  <div className="flex justify-end gap-2 border-t border-rule dark:border-dark-rule pt-4">
                    <button
                      onClick={handleCloseModal}
                      disabled={isConfirming}
                      className="rounded-md border border-rule px-4 py-1.5 text-xs font-semibold hover:bg-rule/10 dark:border-dark-rule"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={isConfirming}
                      className="rounded-md bg-rust px-5 py-1.5 text-xs font-bold text-white hover:bg-rust-dark transition-colors"
                    >
                      {isConfirming ? "Importing..." : "Upload File"}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Mapping Progress */}
              {importStep === "importing" && (
                <div className="py-6">
                  <ImportProgress
                    rowCount={rowCount}
                    percent={importPercent}
                    completedBatches={completedBatches}
                    totalBatches={totalBatches}
                  />
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
