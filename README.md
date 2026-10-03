# 🚀 WhatsApp Blast Message & Digital Invitation System

Aplikasi web modern untuk pengiriman pesan massal (_broadcast/blast_) WhatsApp yang dirancang khusus untuk undangan digital pernikahan, acara, notifikasi, dan pesan personalisasi. Sistem ini dilengkapi fitur personalisasi nama otomatis, generasi tautan undangan dinamis, kartu pratinjau metadata (_Open Graph Link Preview_), simulasi tampilan WhatsApp di HP, serta perlindungan jeda acak (_smart delay_) untuk meminimalisir risiko pemblokiran nomor.

---

## 📑 Daftar Isi

- [Arsitektur & Teknologi](#-arsitektur--teknologi)
- [Penjelasan Environment Variables (.env)](#-penjelasan-environment-variables-env)
- [Prasyarat Sistem (Prerequisites)](#-prasyarat-sistem-prerequisites)
- [Panduan Setup dari Nol (Step-by-Step)](#-panduan-setup-dari-nol-step-by-step)
  - [1. Setup Backend (Golang)](#1-setup-backend-golang)
  - [2. Setup Frontend (React + Vite)](#2-setup-frontend-react--vite)
- [Panduan Penggunaan Fitur](#-panduan-penggunaan-fitur)
- [Panduan Khusus: Menampilkan Metadata Preview Link Undangan](#-panduan-khusus-menampilkan-metadata-preview-link-undangan)
- [Struktur Folder Project](#-struktur-folder-project)
- [Daftar Endpoint API Backend](#-daftar-endpoint-api-backend)

---

## 🏗 Arsitektur & Teknologi

Sistem terdiri dari 3 komponen utama:

1. **Frontend**: Antarmuka pengguna responsif berbasis **React 19**, **Vite**, **Tailwind CSS**, dan **Lucide Icons**.
2. **Backend**: REST API performa tinggi berbasis **Go (Golang)** menggunakan framework **Gin**. Mengelola antrean worker pengiriman latar belakang (_goroutine worker_) dan state sesi WhatsApp.
3. **WAHA (WhatsApp HTTP API)**: Engine server WhatsApp (_Core WEBJS / Chromium_) yang menangani protokol WhatsApp Web, autentikasi sesi QR, dan pengiriman pesan.

```
┌───────────────────────┐         HTTP / JSON          ┌───────────────────────┐
│                       │ ───────────────────────────> │                       │
│  Frontend (React UI)  │                              │ Backend (Golang Gin)  │
│  http://localhost:5173│ <─────────────────────────── │ http://localhost:8080 │
└───────────────────────┘     Progress Polling / QR    └───────────┬───────────┘
                                                                   │
                                                WAHA REST API Call │ (POST /api/sendText)
                                                                   ▼
                                                       ┌───────────────────────┐
                                                       │      WAHA Server      │
                                                       │ (WhatsApp HTTP API)   │
                                                       └───────────┬───────────┘
                                                                   │
                                                       WhatsApp Web│ Protocol
                                                                   ▼
                                                       ┌───────────────────────┐
                                                       │   Penerima WhatsApp   │
                                                       │   (Tamu Undangan)     │
                                                       └───────────────────────┘
```

---

## 🔑 Penjelasan Environment Variables (.env)

Sistem ini memiliki **dua tempat file `.env`**: satu di folder `backend/` dan satu di folder `frontend/`.

### 1. Backend: `backend/.env`

File ini mengatur koneksi backend Go ke server engine WAHA dan port server backend lokal.

Contoh isi file `backend/.env`:

```env
WAHA_BASE_URL=link_server_waha
WAHA_API_KEY=secret_api_key
PORT=8080
```

| Variabel            | Keterangan & Kemana Arahnya                                                                                                                                                                                                                                          | Contoh Nilai                                                 |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| **`WAHA_BASE_URL`** | **URL server WAHA (WhatsApp HTTP API)** yang sedang berjalan. Backend Go akan menembak endpoint seperti `/api/sessions`, `/api/sendText`, dan `/auth/qr` ke URL ini. Jika Anda menjalankan WAHA di VPS/domain sendiri atau Docker lokal, arahkan ke alamat tersebut. | `https://waha.mohaproject.tech` atau `http://localhost:3000` |
| **`WAHA_API_KEY`**  | **Kunci rahasia (API Key / Token)** untuk mengamankan akses ke WAHA. Backend Go akan menyisipkan nilai ini ke header HTTP `X-Api-Key`. Nilai ini harus sama dengan konfigurasi `WAHA_API_KEY` di server WAHA Anda.                                                   | `Lollipop5.0qwerty244`                                       |
| **`PORT`**          | **Port lokal** tempat server backend Golang Gin berjalan di komputer/server Anda.                                                                                                                                                                                    | `8080`                                                       |

---

### 2. Frontend: `frontend/.env` _(Opsional, default fallback otomatis)_

File ini mengatur kemana frontend React harus menembak API backend Golang.

Contoh isi file `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

| Variabel                | Keterangan & Kemana Arahnya                                                                                                                                                                                                                                     | Contoh Nilai                                                            |
| :---------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **`VITE_API_BASE_URL`** | **URL API Base Backend Golang**. Mengarahkan panggilan Axios frontend ke router backend Gin. Jika tidak diisi, frontend otomatis default ke `http://localhost:8080/api`. Jika di-deploy ke production (misal Vercel / VPS), ubah ke domain backend publik Anda. | `http://localhost:8080/api` atau `https://api-blast.domainanda.com/api` |

---

## 💻 Prasyarat Sistem (Prerequisites)

Sebelum menjalankan aplikasi, pastikan perangkat Anda telah terinstall:

- **Go**: Minimal versi 1.20+ ([Download Go](https://go.dev/dl/))
- **Node.js**: Minimal versi 18+ ([Download Node.js](https://nodejs.org/))
- **Package Manager**: `pnpm` (direkomendasikan) atau `npm`
- **Instance Server WAHA**: Server WAHA yang aktif dan dapat diakses (self-hosted via Docker atau cloud).

---

## 🛠 Panduan Setup dari Nol (Step-by-Step)

### 1. Setup Backend (Golang)

1. Buka terminal dan masuk ke direktori `backend`:

   ```bash
   cd backend
   ```

2. Buat file `.env` dari template:

   ```bash
   # Di Windows PowerShell:
   Copy-Item .env.example .env

   # Atau di Linux / Mac:
   cp .env.example .env
   ```

3. Sesuaikan isi file `backend/.env` dengan URL dan API Key WAHA Anda:

   ```env
   WAHA_BASE_URL=https://waha.mohaproject.tech
   WAHA_API_KEY=Lollipop5.0qwerty244
   PORT=8080
   ```

4. Unduh dependency Go:

   ```bash
   go mod download
   ```

5. Jalankan backend:
   ```bash
   go run main.go
   ```
   _Jika berhasil, Anda akan melihat log:_
   ```text
   Starting WAHA Broadcast Backend Server...
   Listening on http://localhost:8080
   ```

---

### 2. Setup Frontend (React + Vite)

1. Buka terminal baru dan masuk ke direktori `frontend`:

   ```bash
   cd frontend
   ```

2. Buat file `.env` (opsional):

   ```bash
   # Di Windows PowerShell:
   Copy-Item .env.example .env

   # Atau di Linux / Mac:
   cp .env.example .env
   ```

3. Install semua package dependency:

   ```bash
   pnpm install
   # atau jika menggunakan npm:
   npm install
   ```

4. Jalankan server development:

   ```bash
   pnpm dev
   # atau:
   npm run dev
   ```

5. Buka browser dan akses URL lokal yang tampil:
   ```text
   http://localhost:5173
   ```

---

## 📱 Panduan Penggunaan Fitur

### 1. Hubungkan WhatsApp (Scan QR)

1. Di kartu **Status WhatsApp**, klik tombol **"Hubungkan WhatsApp"** atau **"Scan QR Code"**.
2. Modal QR Code akan muncul otomatis me-refresh kode QR dari server WAHA.
3. Buka WhatsApp di smartphone Anda: **Menu Titik Tiga / Pengaturan > Perangkat Tertaut > Tautkan Perangkat**, lalu arahkan kamera ke layar.
4. Setelah terhubung, status akan berubah menjadi **"WORKING" (Online)**.

### 2. Konfigurasi Format Link Undangan

Di kartu **Konfigurasi Format Link Undangan Digital**, tentukan format URL website undangan Anda:

- **Format Parameter**: `https://undangan-anda.com/?to={nama_encoded}` _(Contoh: `.../?to=Budi+Santoso`)_
- **Format Path / Slug**: `https://undangan-anda.com/tamu/{slug}` _(Contoh: `.../tamu/budi-santoso`)_
- Klik tombol **"Tes Buka"** untuk memvalidasi apakah tautan undangan terbuka dengan benar di browser.

### 3. Input Daftar Tamu

Daftar tamu dapat dimasukkan dengan 2 cara:

1. **Upload File Excel (`.xlsx`, `.xls`, `.csv`)**:
   - Klik **"Download Contoh Format"** untuk mengunduh template tabel.
   - Kolom yang didukung otomatis: `Nama Tamu`, `Nomor Telepon` (otomatis dikonversi ke format 62xxx), dan `Link Undangan` (opsional kustom).
2. **Ketik / Paste Teks Manual**:
   - Format: `Nama, Nomor` (contoh: `Budi Santoso, 08123456789`).

### 4. Template Pesan & Variabel Dinamis

Kustomisasi pesan menggunakan tag variabel:

- `{nama}` : Nama lengkap tamu (contoh: `Budi Santoso`)
- `{link}` : Tautan website undangan yang sudah digenerate khusus untuk tamu tersebut
- `{nomor}`: Nomor WhatsApp tamu
- `{slug}` : Nama format URL-friendly (contoh: `budi-santoso`)
- `{nama_encoded}` : Nama berformat URL query `+` (contoh: `Budi+Santoso`)

Tersedia tombol **"Pratinjau di HP"** untuk melihat simulasi visual tampilan chat WhatsApp sebelum pesan disebarkan.

### 5. Mulai Broadcast

1. Pastikan status WhatsApp **WORKING**.
2. Klik tombol **"Mulai Broadcast"**.
3. Sistem akan menjalankan background worker pengiriman dengan:
   - Delay acak aman (**4 - 8 detik**) antar pesan.
   - Indikator progres realtime (_Progress Bar_, jumlah terkirim, gagal, dan status log per tamu).

---

## 🖼 Panduan Khusus: Menampilkan Metadata Preview Link Undangan

Agar link undangan menampilkan **kartu metadata (judul, deskripsi ringkas, dan gambar thumbnail)** di WhatsApp saat broadcast terkirim, pastikan syarat berikut terpenuhi:

1. **Pengaturan API (Sudah Aktif di Sistem)**:
   Backend sistem ini secara otomatis mengirimkan parameter `"linkPreview": true` ke WAHA saat memanggil `/api/sendText`.

2. **Website Undangan Harus Live (HTTP 200)**:
   Tautan undangan tidak boleh 404, tidak boleh di `localhost`, dan tidak boleh terhalang proteksi login/Cloudflare Turnstile captcha yang memblokir crawler.

3. **Wajib Memasang Tag Open Graph (OG Meta) di `<head>` Website Undangan**:
   Pastikan file HTML website undangan Anda memiliki meta tag Open Graph berikut:

   ```html
   <head>
     <!-- Judul Acara / Undangan -->
     <meta property="og:title" content="The Wedding of Romeo & Juliet" />

     <!-- Deskripsi Singkat -->
     <meta
       property="og:description"
       content="Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i ke resepsi pernikahan kami."
     />

     <!-- Gambar Thumbnail (Wajib URL Publik Lengkap https://) -->
     <meta
       property="og:image"
       content="https://undangan-anda.com/assets/og-wedding.jpg"
     />
     <meta property="og:image:width" content="1200" />
     <meta property="og:image:height" content="630" />

     <meta property="og:url" content="https://undangan-anda.com" />
     <meta property="og:type" content="website" />
   </head>
   ```

   > **Tips Gambar `og:image`:**
   >
   > - **Resolusi Rekomendasi:** 1200 × 630 px (Rasio 1.91:1) atau 600 × 315 px.
   > - **Ukuran File:** Di bawah 300 KB format `.jpg` atau `.png`.
   > - **URL:** Wajib menggunakan protokol `https://` absolut.

4. **Hindari Spasi Mentah di URL**:
   Jangan gunakan spasi kosong di tengah URL (misal `?to=Budi Santoso`), karena WhatsApp memotong tautan pada spasi pertama. Gunakan `{nama_encoded}` (`?to=Budi+Santoso`) atau `{slug}` (`/tamu/budi-santoso`).

5. **Kebijakan Anti-Spam WhatsApp di Sisi Tamu**:
   Jika nomor pengirim belum disimpan di buku kontak penerima (_unknown contact_), aplikasi WhatsApp di HP penerima kadang secara bawaan menyembunyikan gambar kartu preview hingga penerima berinteraksi atau menyimpan kontak.

---

## 📁 Struktur Folder Project

```text
blast-message/
├── README.md                      # Dokumentasi komprehensif project ini
├── backend/                       # Server Backend (Golang Gin)
│   ├── .env                       # Konfigurasi environment backend (WAHA URL & Key)
│   ├── .env.example               # Contoh template file .env backend
│   ├── main.go                    # Entry point aplikasi backend
│   ├── go.mod                     # Go module dependencies
│   ├── client/
│   │   └── waha.go                # Klien HTTP terintegrasi ke WAHA API
│   ├── config/
│   │   └── config.go              # Parser & loader file environment (.env)
│   ├── handlers/
│   │   ├── session.go             # Handler inisialisasi sesi, QR, & logout
│   │   └── broadcast.go           # Handler memulai broadcast & cek progres
│   ├── models/
│   │   └── types.go               # Struct data model (Request, Log, Progress, WAHA Payload)
│   ├── router/
│   │   └── router.go              # Registrasi rute API Gin & middleware CORS
│   └── services/
│       └── broadcast_worker.go    # Background worker, rate limiting, delay, & parsing variabel
└── frontend/                      # Client Web UI (React + Vite + Tailwind)
    ├── .env.example               # Contoh template .env frontend (API URL)
    ├── package.json               # Dependensi frontend & script runner
    ├── vite.config.js             # Konfigurasi build Vite & port 5173
    └── src/
        ├── App.jsx                # Komponen root aplikasi & state management utama
        ├── api/
        │   └── axiosClient.js     # Axios instance terarah ke backend Go
        ├── components/
        │   ├── Navbar.jsx         # Header navigasi & branding aplikasi
        │   ├── SessionCard.jsx    # Status sesi WhatsApp, koneksi, & tombol logout
        │   ├── QrModal.jsx        # Dialog modal scanner QR Code WhatsApp
        │   ├── LinkConfigCard.jsx # Pengaturan format tautan undangan dinamis
        │   ├── GuestListInput.jsx # Manajemen daftar tamu (Excel upload / teks manual)
        │   ├── TemplateEditor.jsx # Editor template pesan, emoji picker, & tag variabel
        │   ├── PhonePreviewModal.jsx # Mockup simulasi tampilan WhatsApp di HP
        │   ├── StatsBar.jsx       # Statistik ringkasan tamu & estimasi waktu kirim
        │   └── BroadcastTracker.jsx # Realtime progress bar & log pengiriman per tamu
        └── utils/
            └── helpers.js         # Parser file Excel, normalisasi nomor HP, slugifier
```

---

## 📡 Daftar Endpoint API Backend

Base URL lokal: `http://localhost:8080/api`

| Method | Endpoint                         | Deskripsi                                                                             |
| :----- | :------------------------------- | :------------------------------------------------------------------------------------ |
| `POST` | `/sessions/init`                 | Menginisialisasi sesi baru di WAHA atau mengambil sesi yang tersimpan.                |
| `GET`  | `/sessions/:id/qr`               | Mengambil gambar QR Code / data URI base64 untuk login WhatsApp.                      |
| `GET`  | `/sessions/:id/status`           | Mengecek status sesi terkini (`WORKING`, `SCAN_QR_CODE`, `STOPPED`).                  |
| `POST` | `/sessions/:id/restart`          | Me-restart sesi yang terputus atau gagal.                                             |
| `POST` | `/sessions/:id/logout`           | Melakukan logout dan membersihkan sesi di server WAHA.                                |
| `POST` | `/messages/broadcast`            | Memulai pengiriman broadcast massal latar belakang (_background worker_).             |
| `GET`  | `/messages/broadcast/:id/status` | Mengambil status progres pengiriman broadcast realtime beserta log rincian tiap tamu. |

---

## 💡 Troubleshooting Umum

- **QR Code tidak muncul / timeout**:
  Periksa apakah `WAHA_BASE_URL` di `backend/.env` dapat diakses dari browser/curl, dan pastikan `WAHA_API_KEY` telah sesuai.
- **Port 8080 sudah digunakan (_bind address already in use_)**:
  Ganti `PORT=8081` di `backend/.env` dan sesuaikan `VITE_API_BASE_URL=http://localhost:8081/api` di frontend.
- **Pesan gagal terkirim (Status FAILED)**:
  Cek pesan error di log pengiriman. Jika muncul _Session status is not as expected_, pastikan status koneksi WhatsApp Anda masih berstatus **WORKING** dan tidak logout dari HP.
