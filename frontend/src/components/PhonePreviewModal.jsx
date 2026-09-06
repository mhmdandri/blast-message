import React from "react";
import {
  X,
  Smartphone,
  CheckCheck,
  ExternalLink,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { generateGuestLink, slugify } from "../utils/helpers";

export default function PhonePreviewModal({
  isOpen,
  onClose,
  template,
  linkFormat,
  guestName = "Budi Santoso",
  guestPhone = "08123456789",
}) {
  if (!isOpen) return null;

  const generatedLink = generateGuestLink(linkFormat, guestName, guestPhone);
  const formattedMessage = template
    .replace(/\{nama\}/gi, guestName)
    .replace(/\{name\}/gi, guestName)
    .replace(/\{nomor\}/gi, guestPhone)
    .replace(/\{phone\}/gi, guestPhone)
    .replace(/\{slug\}/gi, slugify(guestName))
    .replace(/\{link\}/gi, generatedLink)
    .replace(/\{url\}/gi, generatedLink);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm flex flex-col items-center">
        {/* Top Floating Controls */}
        <div className="w-full flex items-center justify-between mb-3 text-white px-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold">Simulasi WhatsApp Mobile</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Phone Mockup Body */}
        <div className="w-full bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-700 relative overflow-hidden shadow-emerald-500/10">
          {/* Phone Notch */}
          <div className="w-32 h-4 bg-slate-950 rounded-b-xl mx-auto mb-2 flex items-center justify-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
            <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
          </div>

          {/* Screen Container */}
          <div className="w-full h-130 rounded-[28px] overflow-hidden flex flex-col whatsapp-chat-bg border border-slate-800">
            {/* WhatsApp App Header */}
            <div className="bg-[#1f2c34] px-3 py-2.5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shadow">
                    {guestName.charAt(0)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#1f2c34]"></span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-100 leading-tight">
                    {guestName}
                  </h4>
                  <p className="text-[10px] text-emerald-400 font-medium">
                    Online (Terhubung)
                  </p>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full font-mono">
                {guestPhone}
              </div>
            </div>

            {/* Encrypted Notice Banner */}
            <div className="p-2 text-center">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#182229] text-[10px] text-[#8696a0] border border-[#222d34]">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                Pesan ini terenkripsi secara end-to-end.
              </span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="flex justify-end">
                <div className="whatsapp-bubble-out max-w-[85%] p-3 text-xs shadow-md relative group">
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-100 text-[12px] font-sans">
                    {formattedMessage}
                  </p>

                  {/* Link Preview Simulation Card */}
                  {generatedLink && (
                    <div className="mt-2 p-2 rounded-lg bg-[#0a332c] border border-[#0f473e] text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-emerald-300 font-semibold">
                        <span className="truncate">Undangan Digital RSVP</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-300 truncate font-mono">
                        {generatedLink}
                      </p>
                    </div>
                  )}

                  {/* Read Timestamp */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-emerald-200/70 font-mono">
                    <span>12:05</span>
                    <CheckCheck className="w-3 h-3 text-sky-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Dummy Input Bar Footer */}
            <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2 border-t border-slate-800 shrink-0">
              <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[11px] text-slate-400">
                Ketik pesan...
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">
                🎤
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-3">
          Tampilan di atas adalah contoh simulasi persis saat undangan diterima
          di aplikasi WhatsApp tamu.
        </p>
      </div>
    </div>
  );
}
