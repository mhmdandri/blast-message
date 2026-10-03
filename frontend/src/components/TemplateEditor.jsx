import React, { useState, useRef } from "react";
import {
  MessageSquare,
  Tag,
  Eye,
  Copy,
  Check,
  Smartphone,
  Smile,
  Bold,
  Italic,
  Strikethrough,
  RotateCcw,
  Trash2,
  FileText,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { generateGuestLink, slugify } from "../utils/helpers";
import PhonePreviewModal from "./PhonePreviewModal";

export default function TemplateEditor({ template, setTemplate, linkFormat }) {
  const [copied, setCopied] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const textareaRef = useRef(null);

  // Template Presets
  const templatePresets = [
    {
      name: "Resmi / Formal",
      desc: "Bahasa sopan & terstruktur",
      content:
        "Kepada Yth. {nama},\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara Pernikahan kami.\n\nDetail acara dan konfirmasi kehadiran (RSVP) dapat diakses melalui tautan undangan berikut:\n{link}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.\n\nTerima kasih.\nSalam hangat dari kami sekeluarga.",
    },
    {
      name: "Santai & Akrab",
      desc: "Untuk teman/kerabat dekat",
      content:
        "Halo {nama}! ✨💍\n\nKabar bahagia untuk kita semua! Kami mengundang kamu untuk hadir dan merayakan momen bahagia pernikahan kami.\n\nBuka undangan digital lengkapnya di sini ya:\n{link}\n\nJangan lupa konfirmasi kehadiranmu ya. Sampai jumpa di hari H! 🎉🙏",
    },
    {
      name: "Ringkas & Cepat",
      desc: "Singkat & to the point",
      content:
        "Undangan Pernikahan Digital 💌\n\nKepada: {nama}\n\nSilakan buka tautan undangan digital kami di sini:\n{link}\n\nTerima kasih atas doa restu dan kehadirannya! 🙏",
    },
  ];

  // Insert text directly at cursor or replace selection
  const insertAtCursor = (textToInsert) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setTemplate((prev) => prev + textToInsert);
      return;
    }

    const start = textarea.selectionStart ?? template.length;
    const end = textarea.selectionEnd ?? template.length;

    const before = template.substring(0, start);
    const after = template.substring(end);

    const newText = before + textToInsert + after;
    setTemplate(newText);

    // Keep cursor right after the inserted text and retain focus
    const newCursor = start + textToInsert.length;
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursor, newCursor);
      }
    });
  };

  // WhatsApp styling wrapper (*bold*, _italic_, ~strikethrough~)
  const wrapSelection = (wrapper) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;

    if (start !== end) {
      // Wrap selected text
      const selected = template.substring(start, end);
      const wrapped = `${wrapper}${selected}${wrapper}`;
      const newText = template.substring(0, start) + wrapped + template.substring(end);
      setTemplate(newText);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start, start + wrapped.length);
        }
      });
    } else {
      // Insert placeholder
      const placeholder = wrapper === "*" ? "teks tebal" : wrapper === "_" ? "teks miring" : "teks";
      const inserted = `${wrapper}${placeholder}${wrapper}`;
      const newText = template.substring(0, start) + inserted + template.substring(end);
      setTemplate(newText);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + wrapper.length, start + wrapper.length + placeholder.length);
        }
      });
    }
  };

  const sampleEmojis = ["💌", "💍", "💒", "✨", "🎉", "🗓️", "⏰", "📍", "🙏", "❤️", "💐", "🎊"];

  // Variable definitions with info
  const variables = [
    { tag: "{nama}", label: "Nama Tamu", desc: "Contoh: Budi Santoso", color: "indigo" },
    { tag: "{link}", label: "Link Undangan", desc: "Tautan unik per tamu", color: "emerald" },
    { tag: "{nomor}", label: "No. WhatsApp", desc: "08xxx / 628xxx", color: "purple" },
    { tag: "{slug}", label: "Slug Nama", desc: "budi-santoso", color: "blue" },
    { tag: "{nama_encoded}", label: "Nama Query (+)", desc: "Budi+Santoso", color: "sky" },
  ];

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
    .replace(/\{nama_encoded\}/gi, "Budi+Santoso")
    .replace(/\{link\}/gi, sampleLink)
    .replace(/\{url\}/gi, sampleLink);

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(previewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Variable checklist
  const hasNameVar = /\{nama\}|\{name\}|\{slug\}|\{nama_encoded\}/i.test(template);
  const hasLinkVar = /\{link\}|\{url\}/i.test(template);

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col h-full shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              Template Pesan Undangan
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Klik variabel untuk menyisipkan otomatis di posisi kursor teks
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsPhoneModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>Pratinjau di HP</span>
          </button>
        </div>
      </div>

      {/* Preset Templates Quick Selector */}
      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          Template Cepat:
        </span>
        {templatePresets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setTemplate(preset.content)}
            title={preset.desc}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/50 text-slate-300 border border-slate-700/60 text-[11px] font-medium transition-all cursor-pointer hover:text-white"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Formatting & Variable Insertion Toolbar */}
      <div className="space-y-2">
        {/* Variables Row */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium w-full sm:w-auto">
            <Tag className="w-3.5 h-3.5 text-indigo-400" /> Sisipkan Variabel:
          </span>
          {variables.map((v) => {
            const colorClasses = {
              indigo: "bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30",
              emerald: "bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30",
              purple: "bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 border-purple-500/30",
              blue: "bg-blue-500/10 hover:bg-blue-500/25 text-blue-300 border-blue-500/30",
              sky: "bg-sky-500/10 hover:bg-sky-500/25 text-sky-300 border-sky-500/30",
            }[v.color];

            return (
              <button
                key={v.tag}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertAtCursor(v.tag)}
                title={v.desc}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1 shadow-sm ${colorClasses}`}
              >
                <span>{v.tag}</span>
                <span className="text-[10px] opacity-75 font-sans font-normal">({v.label})</span>
              </button>
            );
          })}
        </div>

        {/* WhatsApp Formatting & Emojis Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
          {/* Format Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] text-slate-400 font-medium mr-1 hidden sm:inline">Format:</span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => wrapSelection("*")}
              title="Tebal (*teks*)"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => wrapSelection("_")}
              title="Miring (_teks_)"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs italic transition-colors cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => wrapSelection("~")}
              title="Coret (~teks~)"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs line-through transition-colors cursor-pointer"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Emoji Bar */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            <span className="text-[11px] text-slate-400 flex items-center gap-0.5 shrink-0 font-medium mr-1">
              <Smile className="w-3 h-3 text-amber-400" />
            </span>
            {sampleEmojis.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertAtCursor(emoji)}
                className="px-1.5 py-0.5 rounded-md hover:bg-slate-800 text-sm transition-transform active:scale-90 cursor-pointer shrink-0"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Clear text button */}
          <button
            type="button"
            onClick={() => setTemplate("")}
            title="Bersihkan isi pesan"
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Textarea Editor */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder="Ketik pesan Anda di sini... Gunakan variabel seperti {nama} dan {link} untuk personalisasi otomatis."
          rows={7}
          className="w-full h-full min-h-40 sm:min-h-48 p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-xs sm:text-sm placeholder-slate-500 resize-none outline-none font-sans leading-relaxed"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
            {template.length} karakter
          </div>
        </div>
      </div>

      {/* Validation Checklist Tips */}
      {(!hasNameVar || !hasLinkVar) && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <div className="text-[11px] leading-tight">
            {!hasLinkVar && <span>Saran: Tambahkan variabel <code className="font-mono font-bold text-amber-200">&#123;link&#125;</code> agar tamu dapat membuka undangan mereka. </span>}
            {!hasNameVar && <span>Tambahkan <code className="font-mono font-bold text-amber-200">&#123;nama&#125;</code> untuk menyapa tamu secara personal.</span>}
          </div>
        </div>
      )}

      {/* Live Preview Box */}
      <div className="bg-slate-950/60 rounded-xl p-3.5 sm:p-4 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 flex items-center gap-1.5 truncate">
            <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Simulasi Hasil Pesan ({sampleName})</span>
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
        <div className="bg-[#0b141a] border border-[#202c33] rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-slate-200 max-w-full shadow-inner relative">
          <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm font-sans">
            {previewText || (
              <span className="italic text-slate-500">
                Ketik pesan di atas untuk melihat preview...
              </span>
            )}
          </p>
          <div className="text-[10px] text-slate-400 text-right mt-1.5 font-mono flex items-center justify-end gap-1">
            <span>12:00</span>
            <span className="text-sky-400">✓✓</span>
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
