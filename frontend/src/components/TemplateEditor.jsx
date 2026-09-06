import React, { useState } from "react";
import { MessageSquare, Tag, Eye, Copy, Check, Smartphone, Smile } from "lucide-react";
import { generateGuestLink, slugify } from "../utils/helpers";
import PhonePreviewModal from "./PhonePreviewModal";

export default function TemplateEditor({ template, setTemplate, linkFormat }) {
  const [copied, setCopied] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const insertText = (text) => {
    setTemplate((prev) => prev + ` ${text} `);
  };

  const sampleEmojis = ["💌", "💍", "💒", "✨", "🎉", "🗓️", "⏰", "📍", "🙏"];

  // Preview with sample data
  const sampleName = "Budi Santoso";
  const samplePhone = "08123456789";
  const sampleLink = generateGuestLink(linkFormat, sampleName, samplePhone);

  const previewText = template
    .replace(/\{nama\}/gi, sampleName)
    .replace(/\{name\}/gi, sampleName)
    .replace(/\{nomor\}/gi, samplePhone)
    .replace(/\{phone\}/gi, samplePhone)
    .replace(/\{slug\}/gi, slugify(sampleName))
    .replace(/\{link\}/gi, sampleLink)
    .replace(/\{url\}/gi, sampleLink);

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(previewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              Template Pesan Undangan
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Gunakan placeholder variabel untuk personalisasi otomatis
            </p>
          </div>
        </div>

        {/* Mobile Phone Mockup Trigger */}
        <button
          type="button"
          onClick={() => setIsPhoneModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm w-full sm:w-auto"
        >
          <Smartphone className="w-4 h-4" />
          <span>Pratinjau di HP</span>
        </button>
      </div>

      {/* Quick Emoji Bar */}
      <div className="flex items-center gap-1.5 mb-3 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 overflow-x-auto">
        <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 font-medium mr-1">
          <Smile className="w-3.5 h-3.5 text-amber-400" /> Emojis:
        </span>
        {sampleEmojis.map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => insertText(emoji)}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Variable Insert Tags */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium w-full sm:w-auto">
          <Tag className="w-3.5 h-3.5 text-indigo-400" /> Variable Tag:
        </span>
        <button
          type="button"
          onClick={() => insertText("{nama}")}
          className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-semibold transition-all cursor-pointer hover:scale-105"
        >
          &#123;nama&#125;
        </button>
        <button
          type="button"
          onClick={() => insertText("{link}")}
          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold transition-all cursor-pointer hover:scale-105"
        >
          &#123;link&#125;
        </button>
        <button
          type="button"
          onClick={() => insertText("{nomor}")}
          className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-semibold transition-all cursor-pointer hover:scale-105"
        >
          &#123;nomor&#125;
        </button>
        <button
          type="button"
          onClick={() => insertText("{slug}")}
          className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-semibold transition-all cursor-pointer hover:scale-105"
        >
          &#123;slug&#125;
        </button>
      </div>

      {/* Textarea Editor */}
      <div className="relative mb-4 flex-1">
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder="Halo {nama}, Kami mengundang Anda untuk menghadiri acara kami. Silakan buka tautan undangan berikut: {link}"
          rows={6}
          className="w-full h-full min-h-36 sm:min-h-44 p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-xs sm:text-sm placeholder-slate-500 resize-none outline-none font-sans leading-relaxed"
        />
        <div className="absolute bottom-3 right-3 text-[10px] sm:text-[11px] text-slate-500 font-mono bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
          {template.length} karakter
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="bg-slate-950/60 rounded-xl p-3.5 sm:p-4 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 flex items-center gap-1.5 truncate">
            <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Pratinjau ({sampleName})</span>
          </span>

          <button
            type="button"
            onClick={handleCopyPreview}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>

        {/* WhatsApp Message Bubble Simulation */}
        <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm text-slate-200 max-w-full shadow-inner relative">
          <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
            {previewText || (
              <span className="italic text-slate-500">
                Ketik pesan di atas untuk melihat preview...
              </span>
            )}
          </p>
          <div className="text-[10px] text-emerald-400/70 text-right mt-1 font-mono">
            12:00 ✓✓
          </div>
        </div>
      </div>

      {/* Phone Preview Modal Dialog */}
      <PhonePreviewModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        template={template}
        linkFormat={linkFormat}
        guestName={sampleName}
        guestPhone={samplePhone}
      />
    </div>
  );
}
