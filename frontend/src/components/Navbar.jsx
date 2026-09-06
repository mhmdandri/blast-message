import React from "react";
import {
  Send,
  QrCode,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Smartphone,
} from "lucide-react";

export default function Navbar({
  sessionId,
  status,
  onRefresh,
  onLogout,
  isInitializing,
  isLoggingOut,
}) {
  const getStatusBadge = () => {
    switch (status) {
      case "WORKING":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>WhatsApp Terhubung</span>
          </div>
        );
      case "SCAN_QR_CODE":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <QrCode className="w-3.5 h-3.5 animate-pulse" />
            <span>Menunggu Scan QR</span>
          </div>
        );
      case "STARTING":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Memulai Sesi...</span>
          </div>
        );
      case "FAILED":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Sesi Terputus (FAILED)</span>
          </div>
        );
      case "STOPPED":
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Belum Terhubung</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 glass-card border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg shadow-indigo-500/10 p-1.5 shrink-0">
            <img
              src="/favicon.ico"
              alt="Favicon Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-bold gradient-text leading-tight">
              Broadcast message
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400">
              @mohaproject
            </p>
          </div>
        </div>

        {/* Right Section: Status & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="shrink-0">{getStatusBadge()}</div>

          {sessionId && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 text-xs font-mono">
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>{sessionId}</span>
            </div>
          )}

          {sessionId && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onRefresh}
                disabled={isInitializing || isLoggingOut}
                title="Refresh Status"
                className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isInitializing ? "animate-spin" : ""}`}
                />
              </button>

              <button
                onClick={onLogout}
                disabled={isLoggingOut || isInitializing}
                title="Keluar / Putuskan Sesi"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoggingOut ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span className="hidden sm:inline">Memutuskan...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Putuskan</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
