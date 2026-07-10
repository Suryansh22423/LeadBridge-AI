"use client";

import { useState } from "react";

export function WhatsAppView() {
  const [isConnected, setIsConnected] = useState(false);

  const handleLink = () => {
    setIsConnected(!isConnected);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">WhatsApp Account</h1>
        <p className="mt-1 text-sm text-muted">
          Connect your WhatsApp Business API to trigger instant notifications when new leads are registered.
        </p>
      </div>

      <div className="rounded-lg border border-rule bg-surface p-6 dark:border-dark-rule dark:bg-dark-surface max-w-md text-center space-y-4">
        {isConnected ? (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/20">
              <span className="text-3xl">📱</span>
            </div>
            <div>
              <h3 className="font-bold text-sm">WhatsApp Linked Successfully</h3>
              <p className="text-xs text-muted mt-1">Number: +91 98765 00011</p>
            </div>
            <button
              onClick={handleLink}
              className="rounded-md border border-stamp-red/30 bg-stamp-redBg/30 px-4 py-1.5 text-xs font-semibold text-stamp-red hover:bg-stamp-redBg/60 dark:bg-stamp-red/10 dark:hover:bg-stamp-red/20 transition"
            >
              Disconnect WhatsApp
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-36 w-36 items-center justify-center bg-paper p-2 rounded-md border border-rule dark:border-dark-rule dark:bg-dark-bg">
              {/* Mock QR Code using CSS/Unicode */}
              <div className="text-xl font-mono text-center leading-none text-ink select-none dark:text-dark-ink">
                ▞▚▞▚▞▚<br />
                ▚▞▚▞▚▞<br />
                ▞▚▞▚▞▚<br />
                ▚▞▚▞▚▞<br />
                ▞▚▞▚▞▚<br />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm">Scan QR Code to Link WhatsApp</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Open WhatsApp on your phone, tap Linked Devices, and point your camera at this QR code.
              </p>
            </div>
            <button
              onClick={handleLink}
              className="w-full rounded-md bg-rust px-4 py-2 text-xs font-bold text-white hover:bg-rust-dark transition"
            >
              Simulate Scan Complete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
