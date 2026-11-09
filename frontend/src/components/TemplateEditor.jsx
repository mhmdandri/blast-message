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
} from "lucide-react";
import { generateGuestLink, slugify } from "../utils/helpers";
import PhonePreviewModal from "./PhonePreviewModal";

export default function TemplateEditor({ template, setTemplate, linkFormat, defaultTemplate }) {
  const [copied, setCopied] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const textareaRef = useRef(null);

  // Template Presets
  const templatePresets = [
    {
      name: "Default (Cica & Andri)",
      desc: "Template resmi pernikahan Cica & Andri",
      content:
        defaultTemplate ||
        `Kepada Yth.\n{nama_tamu}\n\nAssalamualaikum Warahmatullahi Wabarakatuh\n\nDengan memohon Rahmat dan Ridho Allah SWT, serta tanpa mengurangi rasa hormat melalui pesan ini kami mengundang Bapak/Ibu/Saudara/I untuk menghadiri acara pernikahan kami :\n\nCica Purwanti, S.Pd, Gr & Muhamad Andriyansyah, S.Kom\n\nBerikut link undangan kami, untuk info lengkap acara bisa kunjungi :\n{link_undangan}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.\n\nTerima kasih banyak atas perhatiannya.\nWassalamualaikum Warahmatullahi Wabarakatuh\n\nSalam hangat dari kami sekeluarga.\nCica & Andri`,
    },
    {
      name: "Santai & Akrab",
      desc: "Untuk teman/kerabat dekat",
      content:
        "Halo {nama_tamu}! ✨💍\n\nKabar bahagia untuk kita semua! Kami mengundang kamu untuk hadir dan merayakan momen bahagia pernikahan kami (Cica & Andri).\n\nBuka undangan digital lengkapnya di sini ya:\n{link_undangan}\n\nJangan lupa konfirmasi kehadiranmu ya. Sampai jumpa di hari H! 🎉🙏",
    },
    {
      name: "Ringkas & Cepat",
      desc: "Singkat & to the point",
      content:
        "Undangan Pernikahan Digital 💌\n\nKepada Yth. {nama_tamu}\n\nSilakan buka tautan undangan digital kami di sini:\n{link_undangan}\n\nTerima kasih atas doa restu dan kehadirannya! 🙏\n- Cica & Andri -",
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
    { tag: "{nama_tamu}", label: "Nama Tamu", desc: "Contoh: Wulan & Partner", color: "indigo" },
    { tag: "{link_undangan}", label: "Link Undangan", desc: "Tautan unik per tamu", color: "emerald" },
    { tag: "{code}", label: "Kode Tamu", desc: "Contoh: 01197", color: "amber" },
    { tag: "{nomor}", label: "No. WhatsApp", desc: "08xxx / 628xxx", color: "purple" },
    { tag: "{nama}", label: "Nama (alias)", desc: "Alias untuk {nama_tamu}", color: "blue" },
    { tag: "{link}", label: "Link (alias)", desc: "Alias untuk {link_undangan}", color: "sky" },
  ];

  // Preview with sample data
  const sampleName = "Wulan & Partner";
  const samplePhone = "08123456789";
  const sampleCode = "01197";
  const sampleLink = generateGuestLink(linkFormat, sampleName, samplePhone, sampleCode);

  const previewText = template
    .replace(/\{nama_tamu\}/gi, sampleName)
    .replace(/\{nama\}/gi, sampleName)
    .replace(/\{name\}/gi, sampleName)
    .replace(/\{nomor\}/gi, samplePhone)
    .replace(/\{phone\}/gi, samplePhone)
    .replace(/\{slug\}/gi, slugify(sampleName))
    .replace(/\{nama_encoded\}/gi, encodeURIComponent(sampleName))
    .replace(/\{code_encoded\}/gi, encodeURIComponent(sampleCode))
    .replace(/\{code\}/gi, sampleCode)
    .replace(/\{kode\}/gi, sampleCode)
    .replace(/\{link_undangan\}/gi, sampleLink)
    .replace(/\{link\}/gi, sampleLink)
    .replace(/\{url\}/gi, sampleLink);

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(previewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Variable checklist
  const hasNameVar = /\{nama_tamu\}|\{nama\}|\{name\}|\{slug\}|\{nama_encoded\}/i.test(template);
  const hasLinkVar = /\{link_undangan\}|\{link\}|\{url\}/i.test(template);

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
              amber: "bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border-amber-500/30",
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

          {/* Reset to default template */}
          <button
            type="button"
            onClick={() => setTemplate(defaultTemplate)}
            title="Kembalikan ke template default pernikahan"
            className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

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
          placeholder="Ketik pesan Anda di sini... Gunakan variabel seperti {nama_tamu}, {link_undangan}, dan {code} untuk personalisasi otomatis."
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
            {!hasLinkVar && <span>Saran: Tambahkan variabel <code className="font-mono font-bold text-amber-200">&#123;link_undangan&#125;</code> agar tamu dapat membuka undangan mereka. </span>}
            {!hasNameVar && <span>Tambahkan <code className="font-mono font-bold text-amber-200">&#123;nama_tamu&#125;</code> untuk menyapa tamu secara personal.</span>}
          </div>
        </div>
      )}

      {/* Live Preview Box */}
      <div className="bg-slate-950/60 rounded-xl p-3.5 sm:p-4 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 flex items-center gap-1.5 truncate">
            <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Simulasi Hasil Pesan ({sampleName} - Code: {sampleCode})</span>
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
        guestCode={sampleCode}
      />
    </div>
  );
}
