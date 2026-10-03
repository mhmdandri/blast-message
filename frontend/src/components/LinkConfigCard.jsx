import React from 'react';
import { Link2, ExternalLink, Sparkles } from 'lucide-react';
import { generateGuestLink } from '../utils/helpers';

export default function LinkConfigCard({ linkFormat, setLinkFormat }) {
  const sampleName = 'Budi Santoso';
  const samplePhone = '08123456789';
  const sampleGeneratedLink = generateGuestLink(linkFormat, sampleName, samplePhone);

  const presets = [
    {
      label: 'Direct Nama (+)',
      format: 'https://andricica.mohaproject.tech/{nama_encoded}',
      example: 'https://andricica.mohaproject.tech/Budi+Santoso',
    },
    {
      label: 'Direct Slug',
      format: 'https://andricica.mohaproject.tech/{slug}',
      example: 'https://andricica.mohaproject.tech/budi-santoso',
    },
    {
      label: 'Query Parameter',
      format: 'https://andricica.mohaproject.tech/?to={nama_encoded}',
      example: 'https://andricica.mohaproject.tech/?to=Budi+Santoso',
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100">Konfigurasi Format Link Undangan Digital</h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Variabel <code className="text-indigo-400 font-mono">&#123;link&#125;</code> di pesan akan menyesuaikan nama tamu</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Metadata Preview Aktif</span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="text-xs text-slate-400 font-medium w-full sm:w-auto">Format Cepat:</span>
        {presets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setLinkFormat(preset.format)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] sm:text-xs font-mono transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span>Format URL / Domain Undangan Anda:</span>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-normal">
            Gunakan: <code className="text-indigo-400">&#123;nama_encoded&#125;</code>, <code className="text-indigo-400">&#123;nama&#125;</code>, atau <code className="text-indigo-400">&#123;slug&#125;</code>
          </span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={linkFormat}
            onChange={(e) => setLinkFormat(e.target.value)}
            placeholder="https://andricica.mohaproject.tech/{nama_encoded}"
            className="w-full px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs sm:text-sm font-mono focus:border-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Live Generated Link Box */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2.5">
        <div className="truncate min-w-0">
          <span className="text-slate-400 block text-[10px] sm:text-[11px] font-medium mb-0.5">
            Hasil Generasi Link untuk Contoh Tamu ({sampleName}):
          </span>
          <span className="font-mono text-emerald-400 font-semibold truncate block text-xs">
            {sampleGeneratedLink || <span className="italic text-slate-600">URL format belum diisi...</span>}
          </span>
        </div>

        {sampleGeneratedLink && (
          <a
            href={sampleGeneratedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1 shrink-0 transition-colors self-start sm:self-auto"
          >
            <span>Tes Buka</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
