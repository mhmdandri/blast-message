import {
  QrCode,
  Smartphone,
  CheckCircle,
  ShieldCheck,
  Zap,
  LogOut,
  RefreshCw,
} from "lucide-react";

export default function SessionCard({
  sessionId,
  status,
  onInitSession,
  onOpenQr,
  onRestart,
  onLogout,
  isInitializing,
  isLoggingOut,
  isRestarting,
}) {
  const isConnected = status === "WORKING";
  const isPendingScan = status === "SCAN_QR_CODE";
  const isFailed = status === "FAILED" || status === "STOPPED";

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-xl border border-slate-800">
      {/* Subtle Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative z-10">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Session Management
            </span>
            {sessionId && (
              <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
                ID: {sessionId}
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
            {isConnected
              ? "WhatsApp Siap Digunakan"
              : isPendingScan
                ? "Sesi Dibuat! Harap Scan QR Code"
                : isFailed && sessionId
                  ? "Sesi WhatsApp Terputus (FAILED)"
                  : "Hubungkan WhatsApp Anda"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            {isConnected
              ? "Sesi WhatsApp Anda aktif dan siap mengirimkan pesan undangan secara personal ke daftar tamu."
              : isPendingScan
                ? "Pindai kode QR menggunakan aplikasi WhatsApp di smartphone Anda untuk mengaitkan perangkat."
                : isFailed && sessionId
                  ? 'Status sesi pada server WAHA menunjukkan FAILED. Klik "Restart Sesi" atau buat sesi baru.'
                  : "Klik tombol buat sesi WhatsApp untuk membuat sesi WhatsApp baru dan dapatkan QR Code."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          {!sessionId && (
            <button
              onClick={onInitSession}
              disabled={isInitializing || isLoggingOut || isRestarting}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl gradient-bg hover:opacity-90 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isInitializing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Membuat Sesi...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Buat Sesi WhatsApp</span>
                </>
              )}
            </button>
          )}

          {sessionId && isFailed && (
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={onRestart}
                disabled={isRestarting || isLoggingOut || isInitializing}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isRestarting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Merestart...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Restart Sesi</span>
                  </>
                )}
              </button>
              <button
                onClick={onInitSession}
                disabled={isInitializing || isLoggingOut || isRestarting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {isInitializing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Membuat...</span>
                  </>
                ) : (
                  <span>Sesi Baru</span>
                )}
              </button>
              <button
                onClick={onLogout}
                disabled={isLoggingOut || isInitializing || isRestarting}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoggingOut ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          {isPendingScan && (
            <button
              onClick={onOpenQr}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer animate-bounce"
            >
              <QrCode className="w-4 h-4" />
              <span>Tampilkan QR Code</span>
            </button>
          )}

          {isConnected && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
              <div className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Terhubung &amp; Aktif</span>
              </div>

              <button
                onClick={onLogout}
                disabled={isLoggingOut || isInitializing || isRestarting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoggingOut ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                    <span>Memutuskan...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Putuskan</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
