import React, { useState, useRef } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  FileSpreadsheet,
  UploadCloud,
  Download,
  Table,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";
import {
  normalizePhoneDisplay,
  parseExcelFile,
  downloadExcelTemplate,
} from "../utils/helpers";

export default function GuestListInput({ guests, setGuests }) {
  const [activeTab, setActiveTab] = useState("excel"); // 'excel' or 'table'
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null); // { count, error }
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);
    try {
      const parsedGuests = await parseExcelFile(file);
      if (parsedGuests.length === 0) {
        setUploadStatus({
          error: "File Excel kosong atau format tidak sesuai.",
        });
        return;
      }

      setGuests(parsedGuests);
      setUploadStatus({
        count: parsedGuests.length,
        error: null,
      });
    } catch (err) {
      console.error("Excel parse error:", err);
      setUploadStatus({
        error: "Gagal membaca file Excel/CSV. Pastikan format file benar.",
      });
    }
  };

  const handleAddSingleGuest = (e) => {
    e.preventDefault();
    if (!newGuestPhone.trim()) return;
    const newGuest = {
      id: `guest-${Date.now()}`,
      name: newGuestName.trim() || `Tamu ${guests.length + 1}`,
      phone: newGuestPhone.trim(),
    };
    setGuests([...guests, newGuest]);
    setNewGuestName("");
    setNewGuestPhone("");
  };

  const handleRemoveGuest = (id) => {
    setGuests(guests.filter((g) => g.id !== id));
  };

  const handleClearAll = () => {
    setGuests([]);
    setUploadedFileName("");
    setUploadStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadSampleData = () => {
    const samples = [
      { id: "g1", name: "Budi Santoso", phone: "08123456789" },
      { id: "g2", name: "Siti Rahma", phone: "08571234567" },
      { id: "g3", name: "Ahmad Dahlan", phone: "08219876543" },
    ];
    setGuests(samples);
  };

  const filteredGuests = guests.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.phone.toLowerCase().includes(q) ||
      (g.link && g.link.toLowerCase().includes(q))
    );
  });

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col h-full shadow-lg">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                Daftar Tamu Undangan
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {guests.length} Tamu
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Upload file Excel (.xlsx) atau input data tamu via tabel
            </p>
          </div>
        </div>

        {/* Tab Switcher (Excel & Table Only) */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("excel")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "excel"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Upload Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("table")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "table"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Tabel Input</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Upload Excel File */}
      {activeTab === "excel" && (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {/* File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-5 sm:p-6 bg-slate-900/40 hover:bg-slate-900/80 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform mb-2 border border-indigo-500/20">
                <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                Pilih atau Seret File Excel Di Sini
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                Mendukung format{" "}
                <span className="text-indigo-400 font-mono font-semibold">
                  .xlsx
                </span>
                ,{" "}
                <span className="text-indigo-400 font-mono font-semibold">
                  .xls
                </span>
                , atau{" "}
                <span className="text-indigo-400 font-mono font-semibold">
                  .csv
                </span>
              </p>
            </div>

            {/* Upload Notification / Feedback */}
            {uploadedFileName && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 truncate">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-mono text-slate-200 truncate">
                    {uploadedFileName}
                  </span>
                </div>
                {uploadStatus?.count && (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {uploadStatus.count} Tamu Diimpor
                  </span>
                )}
                {uploadStatus?.error && (
                  <span className="flex items-center gap-1 text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 self-start sm:self-auto">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {uploadStatus.error}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Row & Download Template */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template Excel</span>
            </button>

            {guests.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan List</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Table Input */}
      {activeTab === "table" && (
        <div className="space-y-3 flex-1 flex flex-col">
          {/* Form Quick Add & Search */}
          <div className="space-y-2">
            <form
              onSubmit={handleAddSingleGuest}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                placeholder="Nama Tamu"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Nomor HP (08xxx)"
                value={newGuestPhone}
                onChange={(e) => setNewGuestPhone(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl gradient-bg text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer hover:opacity-90 shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </form>

            <div className="flex items-center justify-between gap-2">
              {guests.length > 0 ? (
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nama atau nomor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 text-xs outline-none focus:border-indigo-500 font-sans"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={loadSampleData}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Isi Contoh Data Tamu</span>
                </button>
              )}

              {guests.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-medium shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-x-auto overflow-y-auto max-h-55 rounded-xl border border-slate-800 bg-slate-900/40">
            {filteredGuests.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                {searchQuery
                  ? "Tidak ada tamu yang cocok dengan pencarian."
                  : "Belum ada tamu terdaftar. Tambahkan via form di atas atau tab Upload Excel."}
              </div>
            ) : (
              <table className="w-full text-left text-xs min-w-85">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Nama</th>
                    <th className="py-2.5 px-3">Nomor Telepon</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredGuests.map((guest, idx) => (
                    <tr
                      key={guest.id || idx}
                      className="hover:bg-slate-800/40 text-slate-300"
                    >
                      <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium text-slate-200 whitespace-nowrap">
                        {guest.name}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-400 whitespace-nowrap">
                        {guest.phone}{" "}
                        <span className="text-slate-600">
                          ({normalizePhoneDisplay(guest.phone)})
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveGuest(guest.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
