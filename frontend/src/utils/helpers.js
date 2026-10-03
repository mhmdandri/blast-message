import * as XLSX from "xlsx";

/**
 * Cleans phone numbers to standard format (e.g. 08123456789 -> 628123456789)
 */
export function normalizePhoneDisplay(phone) {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  } else if (!digits.startsWith("62") && digits.length > 0) {
    digits = "62" + digits;
  }
  return digits;
}

/**
 * Parses CSV/Raw text into array of { name, phone }
 * Supports formats:
 * - "Budi, 08123456789"
 * - "Budi;08123456789"
 * - "08123456789" (name defaults to Tamu)
 */
export function parseGuestText(rawText) {
  if (!rawText || !rawText.trim()) return [];
  const lines = rawText.split("\n");
  const guests = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check for delimiter comma or semicolon or tab
    const parts = trimmed.split(/[,;\t]+/);
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const phone = parts[1].trim();
      if (phone) {
        guests.push({
          id: `guest-${index}-${Date.now()}`,
          name: name || `Tamu ${index + 1}`,
          phone: phone,
        });
      }
    } else if (parts.length === 1) {
      // Could be just number or "Name Phone"
      const tokens = trimmed.split(/\s+/);
      if (tokens.length >= 2 && /\d/.test(tokens[tokens.length - 1])) {
        const phone = tokens[tokens.length - 1];
        const name = tokens.slice(0, tokens.length - 1).join(" ");
        guests.push({
          id: `guest-${index}-${Date.now()}`,
          name: name,
          phone: phone,
        });
      } else {
        guests.push({
          id: `guest-${index}-${Date.now()}`,
          name: `Tamu ${index + 1}`,
          phone: trimmed,
        });
      }
    }
  });

  return guests;
}

/**
 * Converts a string to URL-friendly slug (e.g. "Budi Santoso" -> "budi-santoso")
 */
export function slugify(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-");
}

/**
 * Generates dynamic invitation link for a guest based on format template
 * Format examples:
 * - "https://undangan.com/?to={nama_encoded}" -> "https://undangan.com/?to=Budi+Santoso"
 * - "https://undangan.com/tamu/{slug}" -> "https://undangan.com/tamu/budi-santoso"
 */
export function generateGuestLink(linkFormat, name, phone) {
  if (!linkFormat) return "";
  let link = linkFormat;
  const nameSlug = slugify(name);
  const nameEncoded = encodeURIComponent(name || "").replace(/%20/g, "+");
  const nameRaw = name || "";

  link = link.replace(/\{nama_encoded\}/gi, nameEncoded);
  link = link.replace(/\{slug\}/gi, nameSlug);
  link = link.replace(/\{nama\}/gi, nameRaw);
  link = link.replace(/\{name\}/gi, nameRaw);
  link = link.replace(/\{nomor\}/gi, phone || "");
  link = link.replace(/\{phone\}/gi, phone || "");
  return link;
}

/**
 * Parses uploaded Excel (.xlsx, .xls, .csv) file into array of { id, name, phone, link }
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });

        if (!jsonRows || jsonRows.length === 0) {
          resolve([]);
          return;
        }

        // Find header row and column indexes
        let nameColIdx = -1;
        let phoneColIdx = -1;
        let linkColIdx = -1;
        let startRowIdx = 0;

        const firstRow = jsonRows[0] || [];

        // Check if first row contains string headers
        firstRow.forEach((cell, idx) => {
          const str = String(cell).toLowerCase().trim();
          if (/nama|name|tamu|guest|penerima/i.test(str)) {
            nameColIdx = idx;
          }
          if (
            /hp|phone|telepon|telp|wa|whatsapp|nomor|number|mobile/i.test(str)
          ) {
            phoneColIdx = idx;
          }
          if (/link|url|tautan|link_undangan|link\s+undangan/i.test(str)) {
            linkColIdx = idx;
          }
        });

        // If headers were detected, start reading from row 1
        if (nameColIdx !== -1 || phoneColIdx !== -1 || linkColIdx !== -1) {
          startRowIdx = 1;
          if (nameColIdx === -1) nameColIdx = 0;
          if (phoneColIdx === -1) phoneColIdx = 1;
        } else {
          // Fallback: column 0 is Name, column 1 is Phone
          nameColIdx = 0;
          phoneColIdx = jsonRows[0].length > 1 ? 1 : 0;
        }

        const guests = [];
        for (let i = startRowIdx; i < jsonRows.length; i++) {
          const row = jsonRows[i];
          if (!row || row.length === 0) continue;

          let rawName = String(row[nameColIdx] || "").trim();
          let rawPhone = String(row[phoneColIdx] || "").trim();
          let customLink =
            linkColIdx !== -1 ? String(row[linkColIdx] || "").trim() : "";

          // If phone was in col 0 and name was empty
          if (!rawPhone && rawName && /\d{5,}/.test(rawName)) {
            rawPhone = rawName;
            rawName = `Tamu ${guests.length + 1}`;
          }

          if (rawPhone) {
            guests.push({
              id: `excel-${i}-${Date.now()}`,
              name: rawName || `Tamu ${guests.length + 1}`,
              phone: rawPhone,
              link: customLink,
            });
          }
        }

        resolve(guests);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Downloads a sample Excel (.xlsx) file template
 */
export function downloadExcelTemplate() {
  const templateData = [
    {
      "Nama Tamu": "Budi Santoso",
      "Nomor Telepon": "08123456789",
    },
    {
      "Nama Tamu": "Siti Rahma",
      "Nomor Telepon": "08571234567",
    },
    {
      "Nama Tamu": "Ahmad Dahlan",
      "Nomor Telepon": "08219876543",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Tamu");

  // Set column widths
  worksheet["!cols"] = [{ wch: 25 }, { wch: 20 }];

  XLSX.writeFile(workbook, "Template_Daftar_Tamu_Undangan.xlsx");
}

/**
 * Formats time for log display
 */
export function formatLogTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
