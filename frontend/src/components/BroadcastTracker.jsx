import React, { useState } from 'react';
import { Send, CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck, RefreshCw, BarChart2, Download, Filter } from 'lucide-react';
import { formatLogTime } from '../utils/helpers';

export default function BroadcastTracker({
  broadcastProgress,
  isSending,
  onStartBroadcast,
  canSend,
  sessionStatus,
  guestCount,
}) {
  const [logFilter, setLogFilter] = useState('ALL'); // 'ALL', 'SUCCESS', 'FAILED', 'PENDING'

  const total = broadcastProgress?.total || 0;
  const sent = broadcastProgress?.sent || 0;
  const failed = broadcastProgress?.failed || 0;
  const processed = sent + failed;
  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
  const rawLogs = broadcastProgress?.logs || [];

  const filteredLogs = rawLogs.filter((log) => {
    if (logFilter === 'SUCCESS') return log.status === 'SUCCESS';
    if (logFilter === 'FAILED') return log.status === 'FAILED';
    if (logFilter === 'PENDING') return log.status === 'PENDING';
    return true;
  });

  const handleExportLogCsv = () => {
    if (rawLogs.length === 0) return;
    let csvContent = 'data:text/csv;charset=utf-8,Nama Tamu,Nomor Telepon,Status,Waktu Kirim,Catatan Error\n';
    rawLogs.forEach((l) => {
      const row = `"${l.guestName}","${l.phone}","${l.status}","${l.sentAt || ''}","${l.error || ''}"`;
      csvContent += row + '\n';
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Broadcast_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl space-y-4 sm:space-y-6">
      
      {/* Top Banner & Trigger Button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>Pengiriman Undangan (Broadcast)</span>
            </h3>
            {broadcastProgress?.status && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  broadcastProgress.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : broadcastProgress.status === 'IN_PROGRESS'
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {broadcastProgress.status === 'COMPLETED'
                  ? 'Selesai'
                  : broadcastProgress.status === 'IN_PROGRESS'
                  ? 'Sedang Mengirim...'
                  : broadcastProgress.status}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Mitigasi Anti-Spam: Jeda acak <strong>4–8 detik</strong> per pesan</span>
          </p>
        </div>

        {/* Start Broadcast Button */}
        <button
          onClick={onStartBroadcast}
          disabled={!canSend || isSending || broadcastProgress?.status === 'IN_PROGRESS'}
          className={`w-full md:w-auto flex items-center justify-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-xl transition-all cursor-pointer ${
            canSend && !isSending && broadcastProgress?.status !== 'IN_PROGRESS'
              ? 'whatsapp-green-bg hover:opacity-90 shadow-emerald-500/20 hover:scale-[1.02]'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          {isSending || broadcastProgress?.status === 'IN_PROGRESS' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Mengirim Pesan... ({processed}/{total})</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Kirim Undangan ({guestCount} Tamu)</span>
            </>
          )}
        </button>
      </div>

      {/* Warning if WhatsApp not connected */}
      {sessionStatus !== 'WORKING' && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Harap hubungkan sesi WhatsApp terlebih dahulu sebelum dapat menginisiasi pengiriman broadcast.</span>
        </div>
      )}

      {/* Progress Bar & Counter Cards */}
      {broadcastProgress && (
        <div className="space-y-4 pt-2">
          {/* Main Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Progres Pengiriman</span>
              <span>{percentage}% ({processed}/{total})</span>
            </div>
            <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 shadow-inner">
              <div
                className="h-full gradient-bg rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Metric Stat Counters */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">Total Tamu</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-100">{total}</span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center">
              <span className="text-[10px] sm:text-[11px] text-emerald-400 block font-medium">Berhasil Kirim</span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-400">{sent}</span>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-center">
              <span className="text-[10px] sm:text-[11px] text-rose-400 block font-medium">Gagal Send</span>
              <span className="text-base sm:text-lg font-extrabold text-rose-400">{failed}</span>
            </div>
          </div>

          {/* Activity Log Feed Header & Controls */}
          <div className="space-y-2 pt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">
                Log Aktivitas Pengiriman Detail
              </h4>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                {/* Log Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px] sm:text-[11px]">
                  <button
                    onClick={() => setLogFilter('ALL')}
                    className={`px-2 py-0.5 rounded ${logFilter === 'ALL' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'}`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setLogFilter('SUCCESS')}
                    className={`px-2 py-0.5 rounded ${logFilter === 'SUCCESS' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'}`}
                  >
                    Sukses
                  </button>
                  <button
                    onClick={() => setLogFilter('FAILED')}
                    className={`px-2 py-0.5 rounded ${logFilter === 'FAILED' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400'}`}
                  >
                    Gagal
                  </button>
                </div>

                {/* Export Report CSV */}
                <button
                  onClick={handleExportLogCsv}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Log Stream Container */}
            <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 p-2 divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Belum ada data log pengiriman.</p>
              ) : (
                filteredLogs.map((log, idx) => (
                  <div key={idx} className="py-2 px-2 flex items-center justify-between text-xs hover:bg-slate-800/30 rounded-lg transition-colors gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      {log.status === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {log.status === 'FAILED' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                      {log.status === 'PENDING' && <Clock className="w-4 h-4 text-amber-400 animate-spin shrink-0" />}

                      <div className="truncate">
                        <span className="font-semibold text-slate-200 truncate block sm:inline">{log.guestName}</span>
                        <span className="text-slate-500 text-[10px] sm:text-[11px] sm:ml-2 font-mono truncate block sm:inline">({log.phone})</span>
                        {log.error && <p className="text-[10px] text-rose-400 mt-0.5 truncate">{log.error}</p>}
                      </div>
                    </div>

                    <div className="text-right font-mono text-[10px] text-slate-500 shrink-0">
                      {log.sentAt ? formatLogTime(log.sentAt) : 'Pending...'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
