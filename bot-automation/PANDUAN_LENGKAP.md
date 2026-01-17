# 📚 Panduan Lengkap: API, Setup, dan Cara Kerja

## 🔑 API yang Dibutuhkan (Semua GRATIS!)

### 1. YouTube Data API v3 (WAJIB)

**Untuk apa?** Mencari video di YouTube berdasarkan genre

**Biaya:** GRATIS (10,000 units/day = ~100 pencarian/hari)

**Cara mendapatkan:**

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Login dengan akun Google Anda
3. Klik "Select a project" → "New Project"
4. Beri nama project (contoh: "TikTok Bot")
5. Klik "Create"
6. Di sidebar kiri, pilih "APIs & Services" → "Library"
7. Cari "YouTube Data API v3"
8. Klik "Enable"
9. Pilih "APIs & Services" → "Credentials"
10. Klik "Create Credentials" → "API Key"
11. **Copy API key** yang muncul

**Paste ke:** `bot-automation/config.py` → `YOUTUBE_API_KEY = "paste-api-key-disini"`

---

### 2. Google Gemini API (OPSIONAL)

**Untuk apa?** Analisis viral dan translation (jika tidak pakai googletrans)

**Biaya:** GRATIS tier (60 requests/menit - sangat cukup!)

**Cara mendapatkan:**

1. Buka [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login dengan akun Google Anda
3. Klik "Create API Key"
4. **Copy API key** yang muncul

**Paste ke:** `bot-automation/config.py` → `GEMINI_API_KEY = "paste-api-key-disini"`

**ATAU Skip jika:**
- Set `USE_FREE_TRANSLATION = True` di config.py (pakai googletrans gratis)
- Set `USE_SIMPLE_ANALYSIS = True` (analisis sederhana tanpa AI)

---

### 3. Telegram Bot Token (WAJIB untuk remote control)

**Untuk apa?** Kontrol bot dari HP via Telegram

**Biaya:** 100% GRATIS (unlimited)

**Cara mendapatkan:**

1. Buka Telegram di HP/Desktop
2. Cari `@BotFather`
3. Ketik `/newbot`
4. Ikuti instruksi:
   - Nama bot (contoh: "My TikTok Bot")
   - Username bot (harus unik, contoh: "mytiktokbot_123")
5. **Copy token** yang diberikan (format: `123456:ABC-DEFghiJKLmnoPQRstuVWXyz`)

**Paste ke:** `bot-automation/config.py` → `TELEGRAM_BOT_TOKEN = "paste-token-disini"`

**Cara mendapatkan Chat ID:**

1. Cari bot Anda di Telegram (username yang Anda buat)
2. Klik "Start" atau kirim `/start`
3. Jalankan bot Python (lihat bagian "Cara Menjalankan" di bawah)
4. Chat ID akan muncul di console/terminal
5. Copy dan paste ke `config.py` → `TELEGRAM_CHAT_ID = "paste-chat-id"`

---

## 🚀 Cara Menjalankan Bot

### Setup Pertama Kali

```bash
# 1. Masuk ke folder bot
cd "C:\Users\BISMILLAH NAWAITU\.gemini\antigravity\playground\core-ride\bot-automation"

# 2. Install dependencies (hanya sekali)
pip install -r ../requirements.txt

# 3. Install browser untuk Playwright (hanya sekali)
python -m playwright install chromium

# 4. Edit config.py dan masukkan API keys
# Buka config.py dengan text editor, paste API keys

# 5. (Opsional) Setup login TikTok - simpan session
python main.py --setup-login
# Browser akan terbuka, login ke TikTok, lalu tutup browser
```

### Menjalankan Bot

**Mode 1: Manual (Test 1x saja)**

```bash
python main.py
```

Program akan:
1. Tanya genre (pilih nomor 1-10)
2. Cari video di YouTube
3. Analisis dan pilih yang paling viral
4. Download, translate, proses
5. Upload ke TikTok
6. Selesai (tidak loop)

**Mode 2: Loop Otomatis**

```bash
python main.py --loop
```

Program akan:
1. Jalankan workflow seperti Mode 1
2. Tunggu 1 jam (default)
3. Ulangi lagi
4. Terus berulang sampai Anda hentikan (Ctrl+C)

**Mode 3: Custom Loop**

```bash
# Upload setiap 2 jam, maksimal 5x
python main.py --loop --delay 7200 --max-loops 5

# Upload setiap 30 menit, unlimited
python main.py --loop --delay 1800 --max-loops -1

# Pilih genre tertentu
python main.py --genre gaming --loop
```

**Mode 4: Dengan Telegram Control (RECOMMENDED)**

```bash
# Jalankan bot
python main.py
```

Setelah berjalan, bot akan menampilkan **Menu Tombol** di Telegram (Reply Keyboard):
- 🚀 **Start Automation** - Menyalakan pengulangan otomatis.
- 🛑 **Stop Automation** - Memberhentikan pengulangan.
- 📊 **Check Status** - Melihat kondisi bot saat ini.
- ⏰ **Upload Now** - Memicu satu kali proses upload saat ini juga.
- ⚙️ **Settings** - Melihat konfigurasi.
- ❓ **Help** - Bantuan perintah.

Anda tidak perlu mengetik perintah, cukup klik tombol yang muncul di layar Telegram. (Pastikan `ENABLE_TELEGRAM_BOT = True` di `config.py`)

---

## ⚙️ Cara Kerja Bot (Step-by-Step)

### Alur Lengkap:

```
┌─────────────────────────────────────────────────────┐
│  1. TELEGRAM MENU (jika enabled)                    │
│     User klik tombol di Telegram HP                 │
└─────────────────┬───────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────┐
│  2. SEARCH YOUTUBE                                  │
│     - Pakai YouTube Data API (GRATIS)               │
│     - Cari "{genre} viral trending"                 │
│     - Filter: max 60s, min 100k views               │
│     - Dapat 10 video kandidat                       │
└─────────────────┬───────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────┐
│  3. ANALYZE VIRAL POTENTIAL                         │
│     Untuk setiap video:                             │
│     - Gemini AI analisis (GRATIS tier)              │
│       ATAU analisis sederhana (views/likes ratio)   │
│     - Score 0-100 untuk viral potential             │
│     - Pilih video dengan score tertinggi            │
└─────────────────┬───────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────┐
│  4. DOWNLOAD VIDEO                                  │
│     - Pakai yt-dlp (GRATIS, open source)            │
│     - Download video + subtitle (jika ada)          │
│     - Simpan di: output/videos/                     │
└─────────────────┬───────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────┐
│  5. TRANSLATE TO INDONESIAN                         │
│     - Title: "Amazing Tips" → "Tips Luar Biasa!"    │
│     - Description: Translate ringkasan              │
│     - Caption: Generate caption menarik + emoji     │
│     - Hashtags: #fyp #viral #trending + genre       │
│                                                      │
│     Method (pilih salah satu):                      │
│     A. googletrans (GRATIS, no API) ✅ RECOMMENDED  │
│     B. Gemini API (GRATIS tier)                     │
└─────────────────┬───────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────┐
│  6. GENERATE THUMBNAIL                              │
│     - Pakai PIL/Pillow (GRATIS, lokal di PC)        │
│     - Buat gambar 1080x1920 (portrait)              │
│     - Gradient background biru-ungu                 │
│     - Tulis judul dengan font besar + outline       │
│     - Tambah badge "🔥 VIRAL"                        │
│     - Simpan di: output/thumbnails/                 │
└─────────────────┬───────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────┐
│  7. PROCESS VIDEO                                   │
│     - Pakai MoviePy (GRATIS, open source)           │
│     A. Crop ke portrait (9:16 aspect ratio)         │
│     B. Tambah subtitle Indonesia di bottom          │
│     C. Tambah thumbnail sebagai intro (2 detik)     │
│     - Output: output/videos/[id]_final.mp4          │
└─────────────────┬───────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────┐
│  8. UPLOAD TO TIKTOK                                │
│     - Pakai Playwright (GRATIS browser automation)  │
│     - Buka browser (Chromium)                       │
│     - Load saved session (dari --setup-login)       │
│     - Navigasi ke tiktok.com/upload                 │
│     - Upload video file                             │
│     - Fill caption + hashtags                       │
│     - PAUSE untuk review manual (TOS-safe)          │
│     - User klik "Post" sendiri                      │
└─────────────────┬───────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────┐
│  9. TELEGRAM NOTIFICATION                           │
│     - Kirim ke HP: "✅ Upload berhasil!"            │
│     - Info: Judul, views, virality score            │
│     - Screenshot/preview (opsional)                 │
└─────────────────┬───────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────┐
│  10. WAIT & REPEAT (jika loop mode)                 │
│     - Tunggu delay (default 1 jam)                  │
│     - Atau tunggu klik tombol di Telegram           │
│     - Ulangi dari step 2                            │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Contoh Output di Console

```
🚀 STARTING WORKFLOW: Genre=gaming, Platform=tiktok
================================================================================

📹 STEP 1: Searching for YouTube videos...
✅ Using FREE YouTube Data API
✅ Found 10 videos

🤖 STEP 2: Analyzing viral potential...
⚡ Using Gemini free tier for analysis
   Video 1: "Epic Valorant Clutch" - Score: 87/100
   Video 2: "Funny Fails Compilation" - Score: 65/100
   ...
✅ Selected: Epic Valorant Clutch Moment!
   Virality Score: 87/100
   Reasoning: High engagement rate, trending topic, perfect for TikTok

⬇️ STEP 3: Downloading video...
✅ Downloaded: output/videos/abc123.mp4 (15.2 MB)

🌐 STEP 4: Translating to Indonesian...
🆓 Using FREE googletrans (no API key needed)
✅ Title (ID): Momen Clutch Valorant yang Epik! 🔥
✅ Caption: Gila! Ini clutch paling insane yang pernah ada! 💯
✅ Hashtags: #fyp #viral #gaming #valorant #clutch

🎨 STEP 5: Generating thumbnail...
✅ Thumbnail created: output/thumbnails/abc123_thumbnail.png

🎬 STEP 6: Processing video...
   → Cropping to portrait mode...
   → Adding Indonesian subtitles...
   → Adding thumbnail intro...
✅ Processed video: output/videos/abc123_final.mp4

📤 STEP 7: Uploading to TikTok...
   → Opening browser...
   → Loading saved session...
   → Navigating to upload page...
   → Uploading video file...
   → Filling caption...
   
   ============================================================
   READY TO POST!
   Review the video and caption in the browser.
   Press Enter to continue (video will NOT auto-post)
   ============================================================
   
✅ Upload completed!

📱 STEP 8: Sending Telegram notification...
✅ Notification sent to your Telegram menu

✅ WORKFLOW COMPLETED SUCCESSFULLY!

⏳ Waiting 3600s (1 hour) before next iteration...
   Next run at: 2026-01-17 01:44:46
```

---

## 🔧 Troubleshooting

### Error: "Please set your YouTube API key"
**Solusi:** Edit `config.py`, paste YouTube API key

### Error: googletrans import error
**Solusi:** 
```bash
pip install googletrans==3.1.0a0
```

### Error: Playwright browser not found
**Solusi:**
```bash
python -m playwright install chromium
```

### Upload TikTok selalu gagal
**Solusi:**
1. Re-login: `python main.py --setup-login`
2. Pastikan TikTok session belum expired
3. Coba manual upload sekali untuk test akun

### Bot tidak respond ke Telegram
**Solusi:**
1. Cek token Telegram benar
2. Pastikan sudah `/start` di bot
3. Chat ID sudah diisi di config.py

---

## 💡 Tips Optimization

### Menghemat Quota YouTube API
- Set `VIDEOS_TO_ANALYZE = 5` (default 10)
- Gunakan genre spesifik
- Jangan run terlalu sering

### Menghemat Quota Gemini
- Set `USE_FREE_TRANSLATION = True` (pakai googletrans)
- Set `USE_SIMPLE_ANALYSIS = True` (analisis tanpa AI)

### Upload Lebih Cepat
- Klik tombol **⏰ Upload Now** di Telegram
- Atau atur delay lebih pendek di config.py

---

## ✅ Checklist Setup

- [ ] Install Python 3.8+
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Install Playwright: `python -m playwright install chromium`
- [ ] Dapatkan YouTube API key → paste ke config.py
- [ ] (Opsional) Dapatkan Gemini API key → paste ke config.py
- [ ] Buat Telegram bot (@BotFather) → paste token ke config.py
- [ ] Start Telegram bot → dapatkan chat ID → paste ke config.py
- [ ] Login TikTok: `python main.py --setup-login`
- [ ] Test run: `python main.py`
- [ ] Kontrol dari HP via Telegram menu!

---

## 🎯 Ringkasan API

| API | Wajib? | Biaya | Quota | Fungsi |
|-----|--------|-------|-------|--------|
| YouTube Data API | ✅ Ya | GRATIS | 10k units/day | Cari video |
| Gemini API | ❌ Opsional | GRATIS | 60 req/min | AI analysis & translate |
| Telegram Bot | ✅ Ya | GRATIS | Unlimited | Remote menu control |
| googletrans | ❌ Alternative | GRATIS | Unlimited | Translation (no API) |

**Total Biaya: Rp 0!** 🎉
