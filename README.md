# 🚀 WhatsApp Blast Message & Digital Invitation System

Aplikasi web modern untuk pengiriman pesan massal (_broadcast/blast_) WhatsApp yang dirancang khusus untuk undangan digital pernikahan, acara, notifikasi, dan pesan personalisasi. Sistem ini dilengkapi fitur personalisasi nama otomatis, kode undangan unik (`{code}`), generasi tautan undangan dinamis, kartu pratinjau metadata (_Open Graph Link Preview_), simulasi tampilan WhatsApp di HP, serta perlindungan jeda acak (_smart delay_) untuk meminimalisir risiko pemblokiran nomor.

---

## 📑 Daftar Isi

- [Arsitektur & Teknologi](#-arsitektur--teknologi)
- [Panduan Deploy Docker di VPS (Rekomendasi Utama)](#-panduan-deploy-docker-di-vps-rekomendasi-utama)
- [Penjelasan Environment Variables (.env)](#-penjelasan-environment-variables-env)
- [Panduan Setup Manual (Tanpa Docker)](#-panduan-setup-manual-tanpa-docker)
- [Panduan Penggunaan Fitur](#-panduan-penggunaan-fitur)
- [Panduan Khusus: Menampilkan Metadata Preview Link Undangan](#-panduan-khusus-menampilkan-metadata-preview-link-undangan)
- [Struktur Folder Project](#-struktur-folder-project)
- [Daftar Endpoint API Backend](#-daftar-endpoint-api-backend)

---

## 🏗 Arsitektur & Teknologi

Sistem terdiri dari kontainer Docker yang terhubung pada jaringan `moha_network`:

1. **Frontend (`blast-frontend`)**: Web UI React 19 + Vite yang di-serve via **Nginx** (port 5173). Nginx secara otomatis mem-proxy request `/api/` ke backend container (port 8082) sehingga bebas dari isu CORS.
2. **Backend (`blast-backend`)**: REST API performa tinggi berbasis **Go (Golang Gin)** (port 8082). Mengelola background goroutine worker pengiriman massal dengan delay acak aman dan terhubung ke server WAHA yang ada.

```
┌────────────────────────────────────────────────────────┐
│                   VPS Host (Docker)                    │
│                                                        │
│  ┌─────────────────────────┐                           │
│  │     blast-frontend      │ (Port 5173)               │
│  │   (React + Nginx Proxy) │ ──┐                       │
│  └─────────────────────────┘   │                       │
│                                │ Internal Proxy (/api) │
│                                ▼                       │
│  ┌─────────────────────────┐                           │
│  │      blast-backend      │ (Port 8082)               │
│  │    (Golang Gin API)     │ ──┐                       │
│  └─────────────────────────┘   │                       │
│                                │ Target WAHA Server    │
│                                ▼                       │
│                    [ Server WAHA Terpasang ]           │
│                 (https://waha.weddingofandricica.me)   │
└────────────────────────────────────────────────────────┘
```

---

## 🐳 Panduan Deploy Docker di VPS (Rekomendasi Utama)

Semua konfigurasi Docker (`docker-compose.yml`, `Dockerfile` Backend, `Dockerfile` Frontend, dan Nginx) sudah siap pakai.

### 1. Menjalankan Kontainer

Buka terminal di folder project `blast-message`, lalu jalankan:

```bash
docker-compose up -d --build
```

### 2. Memeriksa Status Kontainer

```bash
docker ps
```
Pastikan kontainer berstatus **Up**:
* `blast-frontend` $\rightarrow$ `0.0.0.0:5173`
* `blast-backend` $\rightarrow$ `0.0.0.0:8082`

### 3. Mengakses Aplikasi

* **Web UI Dashboard:** Buka browser di `http://IP_VPS:5173` atau `http://localhost:5173`.
* **API Backend:** `http://IP_VPS:8082/api`

### 4. Perintah Berguna Lainnya

```bash
# Melihat log realtime
docker-compose logs -f

# Melihat log khusus backend
docker logs -f blast-backend

# Restart kontainer
docker-compose restart

# Mematikan kontainer
docker-compose down
```

---

## 🔑 Penjelasan Environment Variables (.env)

File `.env` di root direktori mengatur port dan alamat server WAHA:

```env
FRONTEND_PORT=5173
BACKEND_PORT=8082
WAHA_BASE_URL=https://waha.weddingofandricica.me
WAHA_API_KEY=Lollipop5.0qwerty244
```

| Variabel | Deskripsi | Default |
| :--- | :--- | :--- |
| **`FRONTEND_PORT`** | Port akses Web UI di browser | `5173` |
| **`BACKEND_PORT`** | Port API Golang | `8082` |
| **`WAHA_BASE_URL`** | URL target server WAHA yang ada | `https://waha.weddingofandricica.me` |
| **`WAHA_API_KEY`** | Token keamanan WAHA | `Lollipop5.0qwerty244` |

---

## 🛠 Panduan Setup Manual (Tanpa Docker)

Jika ingin menjalankan aplikasi secara langsung di terminal lokal (development):

### 1. Setup Backend (Golang)

1. Masuk ke direktori `backend`:
   ```bash
   cd backend
   go mod download
   go run main.go
   ```
   Backend akan berjalan di `http://localhost:8082`.

### 2. Setup Frontend (React + Vite)

1. Masuk ke direktori `frontend`:
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```
   Frontend akan berjalan di `http://localhost:5173` dan otomatis mem-proxy request `/api` ke `http://localhost:8082`.

---

## 📱 Panduan Penggunaan Fitur

### 1. Hubungkan WhatsApp (Scan QR)

1. Di kartu **Status WhatsApp**, klik tombol **"Hubungkan WhatsApp"** atau **"Scan QR Code"**.
2. Modal QR Code akan muncul otomatis me-refresh kode QR dari server WAHA.
3. Buka WhatsApp di HP: **Menu Titik Tiga / Pengaturan > Perangkat Tertaut > Tautkan Perangkat**, lalu arahkan kamera ke layar.
4. Setelah terhubung, status akan berubah menjadi **"WORKING" (Online)**.

### 2. Konfigurasi Format Link Undangan

Di kartu **Konfigurasi Format Link Undangan Digital**, tentukan format URL website undangan Anda:

- **Format Direct Nama + Code**: `https://weddingofandricica.me/{nama_encoded}?code={code}` _(Contoh: `https://weddingofandricica.me/Wulan%20%26%20Partner?code=01197`)_
- **Format Direct Slug + Code**: `https://weddingofandricica.me/{slug}?code={code}` _(Contoh: `.../wulan-partner?code=01197`)_
- **Format Query Parameter**: `https://weddingofandricica.me/?to={nama_encoded}&code={code}` _(Contoh: `.../?to=Wulan%20%26%20Partner&code=01197`)_
- Klik tombol **"Tes Buka"** untuk memvalidasi apakah tautan undangan terbuka dengan benar di browser.

### 3. Input Daftar Tamu

Daftar tamu dapat dimasukkan dengan 2 cara:

1. **Upload File Excel (`.xlsx`, `.xls`, `.csv`)**:
   - Klik **"Unduh Template Excel"** untuk mengunduh template tabel dengan 3 kolom: `Nama Tamu`, `Nomor Telepon`, dan `Code`.
   - Kolom yang didukung otomatis:
     - `Nama Tamu` : Nama tamu/undangan
     - `Nomor Telepon` : Nomor HP WhatsApp (otomatis dikonversi ke format 62xxx)
     - `Code` : Kode unik undangan tamu (contoh: `01197`, angka 0 di depan tetap terjaga sebagai string)
2. **Ketik / Paste Teks Manual via Tabel**:
   - Tersedia form tambah tamu langsung dengan field Nama, Nomor HP, dan Code.
   - Format jika paste: `Nama, Nomor, Code` (contoh: `Wulan & Partner, 08123456789, 01197`).

### 4. Template Pesan & Variabel Dinamis

Kustomisasi pesan menggunakan tag variabel:

- `{nama}` : Nama lengkap tamu (contoh: `Wulan & Partner`)
- `{code}` atau `{kode}` : Kode unik tamu dari kolom Excel (contoh: `01197`)
- `{link}` : Tautan website undangan yang sudah digenerate khusus untuk tamu tersebut
- `{nomor}`: Nomor WhatsApp tamu
- `{slug}` : Nama format URL-friendly (contoh: `wulan-partner`)
- `{nama_encoded}` : Nama berformat URL encoded `%20` (contoh: `Wulan%20%26%20Partner`)

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

4. **Hindari Spasi Mentah di URL**:
   Gunakan `{nama_encoded}` (`?to=Wulan%20%26%20Partner`) atau `{slug}` (`/tamu/wulan-partner`).

---

## 📁 Struktur Folder Project

```text
blast-message/
├── README.md                      # Dokumentasi komprehensif project ini
├── docker-compose.yml             # Konfigurasi orkestrasi kontainer Docker (Backend & Frontend)
├── .env                           # File konfigurasi environment root
├── .env.example                   # Contoh template file .env root
├── backend/                       # Server Backend (Golang Gin - Port 8082)
│   ├── Dockerfile                 # Multi-stage build Go binary & runtime Alpine
│   ├── .dockerignore
│   ├── main.go                    # Entry point aplikasi backend
│   ├── go.mod                     # Go module dependencies
│   ├── client/waha.go             # Klien HTTP ke WAHA API
│   ├── config/config.go           # Loader konfigurasi .env
│   ├── handlers/                  # Handler API sesi & broadcast
│   ├── models/types.go            # Struct data model
│   └── services/broadcast_worker.go # Worker background & parsing variabel {code}
└── frontend/                      # Client Web UI (React + Vite + Tailwind - Port 5173)
    ├── Dockerfile                 # Multi-stage build Node & Nginx
    ├── nginx.conf                 # Nginx config & reverse-proxy ke backend:8082
    ├── .dockerignore
    ├── package.json               # Dependensi frontend
    ├── vite.config.js             # Konfigurasi build Vite & proxy dev
    └── src/
        ├── App.jsx                # Komponen root & state management
        ├── components/            # UI components (Template, GuestList, Tracker, dll)
        └── utils/helpers.js       # Parser Excel (dengan kolom Code) & normalisasi
```
