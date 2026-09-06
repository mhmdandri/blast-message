import React from "react";
import {
  X,
  RefreshCw,
  Smartphone,
  QrCode,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function QrModal({
  isOpen,
  onClose,
  qrCode,
  isLoading,
  onRefreshQr,
  status,
  sessionId,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-3 border border-indigo-500/20">
            <QrCode className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">
            Scan QR Code WhatsApp
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Sesi ID:{" "}
            <span className="font-mono text-indigo-400">{sessionId}</span>
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-900/80 rounded-2xl border border-slate-800 min-h-65 relative">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
              <span className="text-xs font-medium">
                Mengambil QR Code dari WAHA...
              </span>
            </div>
          ) : qrCode ? (
            <div className="relative group">
              <div className="bg-white p-3 rounded-xl shadow-lg border-2 border-indigo-500/30">
                <img
                  src={qrCode}
                  alt="WhatsApp Auth QR Code"
                  className="w-56 h-56 object-contain"
                />
              </div>
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent rounded-xl transition-all pointer-events-none"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-amber-400 text-center p-4">
              <p className="text-sm font-semibold">
                QR Code belum siap atau sedang dimuat
              </p>
              <button
                onClick={onRefreshQr}
                className="px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Coba Muat Ulang</span>
              </button>
            </div>
          )}

          {/* Polling Indicator */}
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Mengecek status setiap 3 detik...</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-5 space-y-2 text-xs text-slate-300 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
          <p className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>Petunjuk Menghubungkan:</span>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
            <li>Buka WhatsApp di HP Anda.</li>
            <li>
              Ketuk <strong className="text-slate-200">Menu (⋮)</strong> atau{" "}
              <strong className="text-slate-200">Pengaturan</strong> &gt;{" "}
              <strong className="text-slate-200">Perangkat Tertaut</strong>.
            </li>
            <li>
              Ketuk{" "}
              <strong className="text-slate-200">Tautkan Perangkat</strong> lalu
              arahkan kamera ke kode QR di atas.
            </li>
          </ol>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={onRefreshQr}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh QR</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
