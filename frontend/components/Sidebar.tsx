"use client";

import clsx from "clsx";

export type ActiveTab =
  | "dashboard"
  | "generate-leads"
  | "manage-leads"
  | "engage-leads"
  | "team-members"
  | "lead-sources"
  | "ad-accounts"
  | "whatsapp"
  | "tele-calling"
  | "crm-fields"
  | "api-center";

interface SidebarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export function Sidebar({ activeTab, onChangeTab }: SidebarProps) {
  const mainItems = [
    { id: "dashboard", name: "Dashboard", icon: DashboardIcon },
    { id: "generate-leads", name: "Generate Leads", icon: RocketIcon },
    { id: "manage-leads", name: "Manage Leads", icon: FolderIcon },
    { id: "engage-leads", name: "Engage Leads", icon: ChatIcon },
  ] as const;

  const controlItems = [
    { id: "team-members", name: "Team Members", icon: UsersIcon },
    { id: "lead-sources", name: "Lead Sources", icon: UploadCloudIcon },
    { id: "ad-accounts", name: "Ad Accounts", icon: CreditCardIcon },
    { id: "whatsapp", name: "WhatsApp Account", icon: MessageCircleIcon },
    { id: "tele-calling", name: "Tele Calling", icon: PhoneCallIcon },
    { id: "crm-fields", name: "CRM Fields", icon: ListIcon },
    { id: "api-center", name: "API Center", icon: TerminalIcon },
  ] as const;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-rule bg-paper p-4 text-ink transition-colors dark:border-dark-rule dark:bg-dark-bg dark:text-dark-ink">
      {/* Brand logo & Profile info */}
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rust text-white font-bold">
          GE
        </div>
        <div>
          <span className="font-display text-sm font-semibold tracking-tight">GrowEasy</span>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-lg border border-rule bg-surface p-2.5 dark:border-dark-rule dark:bg-dark-surface">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rust-light text-xs font-semibold text-rust dark:bg-rust/20">
            VT
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">VK Test</span>
            <span className="text-[10px] text-muted font-medium">OWNER</span>
          </div>
        </div>
        <ChevronUpDownIcon />
      </div>

      {/* Nav menus */}
      <nav className="flex-1 overflow-y-auto space-y-5 pr-1">
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted/80">Main</p>
          <ul className="mt-2 space-y-1">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onChangeTab(item.id)}
                    className={clsx(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-rust-light/55 text-rust font-semibold dark:bg-rust/15"
                        : "text-muted hover:bg-rule/30 hover:text-ink dark:hover:bg-dark-rule/20 dark:hover:text-dark-ink"
                    )}
                  >
                    <Icon className={clsx("h-4 w-4", isActive ? "text-rust" : "text-muted")} />
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted/80">Control Center</p>
          <ul className="mt-2 space-y-1">
            {controlItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onChangeTab(item.id)}
                    className={clsx(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-rust-light/55 text-rust font-semibold dark:bg-rust/15"
                        : "text-muted hover:bg-rule/30 hover:text-ink dark:hover:bg-dark-rule/20 dark:hover:text-dark-ink"
                    )}
                  >
                    <Icon className={clsx("h-4 w-4", isActive ? "text-rust" : "text-muted")} />
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Business Center at the bottom */}
      <div className="mt-auto pt-4 border-t border-rule dark:border-dark-rule">
        <button
          onClick={() => {}}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-muted hover:bg-rule/30 hover:text-ink dark:hover:bg-dark-rule/20 dark:hover:text-dark-ink"
        >
          <BusinessCenterIcon className="h-4 w-4 text-muted" />
          Business Center
        </button>
      </div>
    </aside>
  );
}

// Icons
function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function UploadCloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function MessageCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
  );
}

function PhoneCallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function BusinessCenterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ChevronUpDownIcon() {
  return (
    <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
    </svg>
  );
}
