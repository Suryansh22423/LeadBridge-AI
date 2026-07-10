"use client";

import { useState } from "react";

interface CallLog {
  number: string;
  duration: string;
  date: string;
  status: "Completed" | "Missed" | "No Answer";
}

export function TeleCallingView() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState("");
  const [logs, setLogs] = useState<CallLog[]>([
    { number: "+91 9876543210", duration: "2m 14s", date: "Today, 4:32 PM", status: "Completed" },
    { number: "+91 9123456780", duration: "—", date: "Today, 11:20 AM", status: "No Answer" },
    { number: "+91 9123456781", duration: "—", date: "Yesterday, 3:15 PM", status: "Missed" },
  ]);

  const handleKeyPress = (num: string) => {
    setPhoneNumber((prev) => prev + num);
  };

  const handleClear = () => {
    setPhoneNumber("");
  };

  const handleDial = () => {
    if (!phoneNumber) return;
    setIsCalling(true);
    setCallStatus("Simulating dial...");
    
    setTimeout(() => {
      setCallStatus("Connected · 0:01");
    }, 1500);
  };

  const handleHangUp = () => {
    setIsCalling(false);
    setCallStatus("");
    
    // Add call log entry
    if (phoneNumber) {
      setLogs([
        {
          number: phoneNumber,
          duration: "0m 12s",
          date: "Just Now",
          status: "Completed",
        },
        ...logs,
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Tele Calling Dialer</h1>
        <p className="mt-1 text-sm text-muted">
          Make browser-based follow-up calls directly to your CRM leads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {/* Phone Keypad */}
        <div className="rounded-lg border border-rule bg-surface p-6 dark:border-dark-rule dark:bg-dark-surface space-y-4 max-w-sm mx-auto w-full">
          <div className="rounded border border-rule bg-paper p-3 text-center dark:border-dark-rule dark:bg-dark-bg">
            {isCalling ? (
              <div className="text-xs text-rust font-bold animate-pulse">{callStatus}</div>
            ) : (
              <div className="h-4" />
            )}
            <input
              type="text"
              readOnly
              placeholder="Dial a number..."
              value={phoneNumber}
              className="w-full text-center text-xl font-bold font-mono bg-transparent border-0 focus:outline-none dark:text-dark-ink"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((key) => (
              <button
                key={key}
                disabled={isCalling}
                onClick={() => handleKeyPress(key)}
                className="flex h-12 items-center justify-center rounded-lg border border-rule hover:bg-rule/25 active:bg-rule/40 font-bold font-mono dark:border-dark-rule transition disabled:opacity-40"
              >
                {key}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleClear}
              disabled={isCalling}
              className="flex-1 rounded-md border border-rule py-2 text-xs font-semibold hover:bg-rule/10 dark:border-dark-rule transition disabled:opacity-40"
            >
              Clear
            </button>
            {isCalling ? (
              <button
                onClick={handleHangUp}
                className="flex-1 rounded-md bg-stamp-red py-2 text-xs font-bold text-white hover:bg-red-700 transition"
              >
                Hang Up
              </button>
            ) : (
              <button
                onClick={handleDial}
                disabled={!phoneNumber}
                className="flex-1 rounded-md bg-rust py-2 text-xs font-bold text-white hover:bg-rust-dark transition disabled:opacity-50"
              >
                Dial Call
              </button>
            )}
          </div>
        </div>

        {/* Call Logs */}
        <div className="rounded-lg border border-rule bg-surface p-5 dark:border-dark-rule dark:bg-dark-surface space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted">Call History</h3>
          <div className="divide-y divide-rule dark:divide-dark-rule overflow-y-auto max-h-[300px] pr-1">
            {logs.map((log, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 text-xs">
                <div>
                  <p className="font-semibold font-mono">{log.number}</p>
                  <p className="text-[10px] text-muted">{log.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{log.duration}</p>
                  <span
                    className={`text-[10px] font-bold ${
                      log.status === "Completed"
                        ? "text-green-600"
                        : log.status === "Missed"
                        ? "text-red-500"
                        : "text-yellow-600"
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
