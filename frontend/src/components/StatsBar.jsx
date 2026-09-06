import React from 'react';
import { Smartphone, Users, Link2, FileText, CheckCircle2, QrCode, AlertCircle } from 'lucide-react';

export default function StatsBar({ sessionStatus, guestCount, linkFormat, templateLength }) {
  const getStatusInfo = () => {
    switch (sessionStatus) {
      case 'WORKING':
        return { label: 'Terhubung (WORKING)', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: CheckCircle2 };
      case 'SCAN_QR_CODE':
        return { label: 'Menunggu Scan QR', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: QrCode };
      case 'FAILED':
        return { label: 'Terputus (FAILED)', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: AlertCircle };
      default:
        return { label: 'Belum Terhubung', color: 'text-slate-400', bg: 'bg-slate-900', border: 'border-slate-800', icon: AlertCircle };
    }
  };

  const statusObj = getStatusInfo();
  const StatusIcon = statusObj.icon;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* Stat 1: Session Status */}
      <div className="glass-card rounded-2xl p-3 sm:p-4 border border-slate-800 flex items-center gap-2.5 sm:gap-3.5 shadow-md hover:border-slate-700 transition-all">
        <div className={`p-2.5 sm:p-3 rounded-xl ${statusObj.bg} ${statusObj.color} border ${statusObj.border} shrink-0`}>
          <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="truncate min-w-0">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Status WA</span>
          <span className={`text-xs sm:text-sm font-bold ${statusObj.color} truncate block`}>
            {statusObj.label}
          </span>
        </div>
      </div>

      {/* Stat 2: Total Guests */}
      <div className="glass-card rounded-2xl p-3 sm:p-4 border border-slate-800 flex items-center gap-2.5 sm:gap-3.5 shadow-md hover:border-slate-700 transition-all">
        <div className="p-2.5 sm:p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="truncate min-w-0">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Total Tamu</span>
          <span className="text-xs sm:text-sm font-bold text-slate-100 block">
            {guestCount} <span className="text-[10px] sm:text-xs text-slate-400 font-normal">Tamu</span>
          </span>
        </div>
      </div>

      {/* Stat 3: Link Format Status */}
      <div className="glass-card rounded-2xl p-3 sm:p-4 border border-slate-800 flex items-center gap-2.5 sm:gap-3.5 shadow-md hover:border-slate-700 transition-all">
        <div className="p-2.5 sm:p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
          <Link2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="truncate min-w-0">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Link Undangan</span>
          <span className="text-xs font-mono text-emerald-400 font-semibold truncate block">
            {linkFormat ? 'Aktif ({link})' : 'Belum Dikonfigurasi'}
          </span>
        </div>
      </div>

      {/* Stat 4: Template Length */}
      <div className="glass-card rounded-2xl p-3 sm:p-4 border border-slate-800 flex items-center gap-2.5 sm:gap-3.5 shadow-md hover:border-slate-700 transition-all">
        <div className="p-2.5 sm:p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="truncate min-w-0">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block uppercase tracking-wider">Template Pesan</span>
          <span className="text-xs sm:text-sm font-bold text-slate-200 block">
            {templateLength} <span className="text-[10px] sm:text-xs text-slate-400 font-normal">Karakter</span>
          </span>
        </div>
      </div>
    </div>
  );
}
