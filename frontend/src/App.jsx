import React, { useState, useEffect, useRef } from "react";
import axiosClient from "./api/axiosClient";
import Navbar from "./components/Navbar";
import StatsBar from "./components/StatsBar";
import SessionCard from "./components/SessionCard";
import QrModal from "./components/QrModal";
import LinkConfigCard from "./components/LinkConfigCard";
import TemplateEditor from "./components/TemplateEditor";
import GuestListInput from "./components/GuestListInput";
import BroadcastTracker from "./components/BroadcastTracker";
import { generateGuestLink } from "./utils/helpers";
import { Shield, Sparkles } from "lucide-react";

export default function App() {
  // Session State
  const [sessionId, setSessionId] = useState(
    () => localStorage.getItem("waha_session_id") || "",
  );
  const [sessionStatus, setSessionStatus] = useState("STOPPED");
  const [qrCode, setQrCode] = useState("");
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isQrLoading, setIsQrLoading] = useState(false);

  // Link Format State
  const [linkFormat, setLinkFormat] = useState(() => {
    const saved = localStorage.getItem("waha_link_format");
    if (!saved || saved.includes("undangan-blond-alpha.vercel.app")) {
      return "https://andricica.mohaproject.tech/{nama_encoded}";
    }
    return saved;
  });

  useEffect(() => {
    localStorage.setItem("waha_link_format", linkFormat);
  }, [linkFormat]);

  // Broadcast & Guests State
  const [guests, setGuests] = useState([
    { id: "g1", name: "Budi Santoso", phone: "08123456789" },
    { id: "g2", name: "Siti Rahma", phone: "08571234567" },
  ]);
  const [templateMessage, setTemplateMessage] = useState(
    "Halo {nama},\n\nKami mengundang Anda untuk menghadiri acara Pernikahan & Resepsi Digital kami.\nSilakan buka tautan undangan berikut:\n{link}\n\nMohon konfirmasi kehadiran Anda. Terima kasih!",
  );
  const [broadcastId, setBroadcastId] = useState("");
  const [broadcastProgress, setBroadcastProgress] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState(null);

  const statusPollRef = useRef(null);
  const broadcastPollRef = useRef(null);

  // Auto-notification banner timer
  const showToast = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // 1. Initialize New WAHA Session
  const handleInitSession = async () => {
    if (isInitializing || isLoggingOut || isRestarting) return;
    setIsInitializing(true);
    try {
      const resp = await axiosClient.post("/sessions/init");
      const newSessionId = resp.data.sessionId;
      const initialStatus = resp.data.status || "SCAN_QR_CODE";

      setSessionId(newSessionId);
      localStorage.setItem("waha_session_id", newSessionId);
      setSessionStatus(initialStatus);

      showToast(`Sesi baru dibuat: ${newSessionId}`, "success");

      // Fetch QR Code immediately
      fetchQrCode(newSessionId);
      setIsQrModalOpen(true);
    } catch (err) {
      console.error("Failed to init session:", err);
      showToast(
        err.response?.data?.error || "Gagal membuat sesi WhatsApp",
        "error",
      );
    } finally {
      setIsInitializing(false);
    }
  };

  // 2. Fetch QR Code from Backend
  const fetchQrCode = async (idToUse = sessionId) => {
    if (!idToUse) return;
    setIsQrLoading(true);
    try {
      const resp = await axiosClient.get(`/sessions/${idToUse}/qr`);
      setQrCode(resp.data.qr);
    } catch (err) {
      console.error("Failed to fetch QR code:", err);
      setQrCode("");
    } finally {
      setIsQrLoading(false);
    }
  };

  // 3. Check Session Status
  const checkSessionStatus = async () => {
    if (!sessionId) return;
    try {
      const resp = await axiosClient.get(`/sessions/${sessionId}/status`);
      const status = resp.data.status;
      setSessionStatus(status);

      if (status === "WORKING") {
        if (isQrModalOpen) {
          setIsQrModalOpen(false);
          showToast("WhatsApp Berhasil Terhubung!", "success");
        }
        setQrCode("");
      } else if (status === "SCAN_QR_CODE" && !qrCode && !isQrLoading) {
        fetchQrCode();
      }
    } catch (err) {
      console.error("Status check error:", err);
    }
  };

  // Polling for Session Status
  useEffect(() => {
    if (sessionId && sessionStatus !== "WORKING") {
      checkSessionStatus();
      statusPollRef.current = setInterval(checkSessionStatus, 3000);
    } else {
      if (statusPollRef.current) clearInterval(statusPollRef.current);
    }
    return () => {
      if (statusPollRef.current) clearInterval(statusPollRef.current);
    };
  }, [sessionId, sessionStatus]);

  // Initial check on mount if sessionId exists in localStorage
  useEffect(() => {
    if (sessionId) {
      checkSessionStatus();
    }
  }, []);

  // 4. Start Broadcast Process
  const handleStartBroadcast = async () => {
    if (!sessionId || sessionStatus !== "WORKING") {
      showToast("Sesi WhatsApp belum terhubung!", "error");
      return;
    }
    if (guests.length === 0) {
      showToast("Daftar tamu tidak boleh kosong!", "error");
      return;
    }
    if (!templateMessage.trim()) {
      showToast("Template pesan tidak boleh kosong!", "error");
      return;
    }

    setIsSending(true);
    try {
      // Build dynamic guests list with generated links
      const preparedGuests = guests.map((g) => ({
        name: g.name,
        phone: g.phone,
        link: g.link || generateGuestLink(linkFormat, g.name, g.phone),
      }));

      const payload = {
        sessionId: sessionId,
        guests: preparedGuests,
        templateMessage: templateMessage,
        linkPreview: true,
      };

      const resp = await axiosClient.post("/messages/broadcast", payload);
      const bId = resp.data.broadcastId;
      setBroadcastId(bId);
      showToast(`Pengiriman broadcast dimulai (ID: ${bId})`, "success");
    } catch (err) {
      console.error("Broadcast start failed:", err);
      showToast(
        err.response?.data?.error || "Gagal memulai broadcast",
        "error",
      );
      setIsSending(false);
    }
  };

  // 5. Poll Broadcast Progress
  const checkBroadcastProgress = async () => {
    if (!broadcastId) return;
    try {
      const resp = await axiosClient.get(
        `/messages/broadcast/${broadcastId}/status`,
      );
      setBroadcastProgress(resp.data);

      if (resp.data.status === "COMPLETED") {
        setIsSending(false);
        if (broadcastPollRef.current) clearInterval(broadcastPollRef.current);
        showToast("Seluruh pengiriman broadcast selesai!", "success");
      }
    } catch (err) {
      console.error("Failed to poll broadcast progress:", err);
    }
  };

  useEffect(() => {
    if (broadcastId) {
      checkBroadcastProgress();
      broadcastPollRef.current = setInterval(checkBroadcastProgress, 2000);
    }
    return () => {
      if (broadcastPollRef.current) clearInterval(broadcastPollRef.current);
    };
  }, [broadcastId]);

  // 6. Logout and Cleanup Session
  const handleLogout = async () => {
    if (!sessionId || isLoggingOut || isInitializing || isRestarting) return;
    setIsLoggingOut(true);
    try {
      await axiosClient.post(`/sessions/${sessionId}/logout`);
      showToast("Sesi WhatsApp berhasil diputuskan dan dihapus.", "info");
    } catch (err) {
      console.error("Logout failed:", err);
      showToast("Gagal memutuskan sesi dari server.", "error");
    } finally {
      setSessionId("");
      localStorage.removeItem("waha_session_id");
      setSessionStatus("STOPPED");
      setQrCode("");
      setIsQrModalOpen(false);
      setBroadcastProgress(null);
      setBroadcastId("");
      setIsLoggingOut(false);
    }
  };

  // Restart existing failed session
  const handleRestartSession = async () => {
    if (!sessionId || isRestarting || isLoggingOut || isInitializing) return;
    setIsRestarting(true);
    try {
      const resp = await axiosClient.post(`/sessions/${sessionId}/restart`);
      showToast("Restrukturisasi sesi WhatsApp dimulai...", "info");
      setSessionStatus(resp.data.status || "STARTING");
      fetchQrCode(sessionId);
      setIsQrModalOpen(true);
    } catch (err) {
      console.error("Failed to restart session:", err);
      showToast(
        err.response?.data?.error || "Gagal merestart sesi WhatsApp",
        "error",
      );
    } finally {
      setIsRestarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Popup */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 text-xs font-semibold animate-bounce ${
            notification.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/40"
              : notification.type === "error"
                ? "bg-rose-950/90 text-rose-300 border-rose-500/40"
                : "bg-indigo-950/90 text-indigo-300 border-indigo-500/40"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        sessionId={sessionId}
        status={sessionStatus}
        onRefresh={checkSessionStatus}
        onLogout={handleLogout}
        isInitializing={isInitializing}
        isLoggingOut={isLoggingOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats Metric Overview */}
        <StatsBar
          sessionStatus={sessionStatus}
          guestCount={guests.length}
          linkFormat={linkFormat}
          templateLength={templateMessage.length}
        />

        {/* Session Card Banner */}
        <SessionCard
          sessionId={sessionId}
          status={sessionStatus}
          onInitSession={handleInitSession}
          onOpenQr={() => setIsQrModalOpen(true)}
          onRestart={handleRestartSession}
          onLogout={handleLogout}
          isInitializing={isInitializing}
          isLoggingOut={isLoggingOut}
          isRestarting={isRestarting}
        />

        {/* Dynamic Link Format Card */}
        <LinkConfigCard linkFormat={linkFormat} setLinkFormat={setLinkFormat} />

        {/* Workspace Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Column: Message Template Editor */}
          <TemplateEditor
            template={templateMessage}
            setTemplate={setTemplateMessage}
            linkFormat={linkFormat}
          />

          {/* Right Column: Guest List Manager */}
          <GuestListInput guests={guests} setGuests={setGuests} />
        </div>

        {/* Full-width Bottom: Broadcast Tracker */}
        <BroadcastTracker
          broadcastProgress={broadcastProgress}
          isSending={isSending}
          onStartBroadcast={handleStartBroadcast}
          canSend={sessionStatus === "WORKING" && guests.length > 0}
          sessionStatus={sessionStatus}
          guestCount={guests.length}
        />
      </main>

      {/* QR Code Modal Dialog */}
      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        qrCode={qrCode}
        isLoading={isQrLoading}
        onRefreshQr={() => fetchQrCode()}
        status={sessionStatus}
        sessionId={sessionId}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 glass-card mt-12">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-400">
            WhatsApp Broadcast Undangan Digital
          </span>
        </div>
        <p>Powered by @mohaproject</p>
      </footer>
    </div>
  );
}
