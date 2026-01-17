# Social Media Automation Bot 🤖

## 🆓 100% GRATIS - Tanpa Biaya!

Bot otomasi lengkap untuk mencari video viral di YouTube, mentranslatenya ke Bahasa Indonesia, dan menguploadnya ke TikTok.

**SEMUA FITUR GRATIS:**
- ✅ YouTube Data API: Gratis (10,000 units/day)
- ✅ Gemini AI: Gratis tier (60 req/min)
- ✅ Googletrans: 100% gratis, unlimited
- ✅ Thumbnail generation: PIL (gratis, lokal)
- ✅ Video processing: MoviePy (gratis, open source)
- ✅ Browser automation: Playwright (gratis)

## ✨ Fitur

1. **🔍 Pencarian Video YouTube Otomatis** - Cari video berdasarkan genre yang dipilih
2. **🤖 Analisis Potensi Viral** - AI menganalisis video mana yang paling berpotensi viral (GRATIS dengan Gemini)
3. **🌐 Translate ke Bahasa Indonesia** - Menggunakan googletrans (100% GRATIS, tidak perlu API key!)
4. **🎨 Generate Thumbnail Menarik** - Buat thumbnail eye-catching otomatis dengan PIL (GRATIS, lokal)
5. **🎬 Proses Video** - Tambahkan subtitle Indonesia dan intro thumbnail (GRATIS dengan MoviePy)
6. **📤 Upload Otomatis** - Upload ke TikTok dengan browser automation (GRATIS)
7. **📱 Kontrol Menu Telegram** - Gunakan tombol menu di Telegram untuk kontrol cepat (🚀 Start, 🛑 Stop, 📊 Status, ⏰ Upload Now)
8. **🔄 Mode Loop** - Jalankan berulang secara otomatis

## 📋 Persyaratan - SEMUA GRATIS!

- Python 3.8+ (GRATIS)
- YouTube Data API Key (GRATIS - quota 10k/day)
- Gemini API Key (OPSIONAL - hanya jika tidak pakai googletrans)
- Akun TikTok (GRATIS)

**TIDAK ADA BIAYA BERLANGGANAN ATAU PREMIUM!**

## 🚀 Instalasi

### 1. Install Dependencies (GRATIS)

```bash
cd "C:\Users\BISMILLAH NAWAITU\.gemini\antigravity\playground\core-ride\bot-automation"
pip install -r ../requirements.txt
```

### 2. Install Playwright Browsers (GRATIS)

```bash
python -m playwright install chromium
```

### 3. Setup API Keys

**OPSI 1: Menggunakan Googletrans (100% GRATIS, TANPA API KEY)**

Edit file `config.py`:

```python
USE_FREE_TRANSLATION = True  # Set ke True untuk pakai googletrans GRATIS
```

Dengan setting ini, Anda TIDAK PERLU API key sama sekali untuk translation!

**OPSI 2: Menggunakan API Keys (Gratis Tier)**

Edit file `config.py` dan isi API keys Anda:

```python
YOUTUBE_API_KEY = "your-youtube-api-key-here"
GEMINI_API_KEY = "your-gemini-api-key-here"  # Opsional jika USE_FREE_TRANSLATION=True
```

**Cara mendapatkan API Keys (GRATIS):**
- YouTube API: https://console.cloud.google.com/
  - Quota: 10,000 units/day = ~100 pencarian/hari
  - Biaya: **GRATIS SELAMANYA**
  
- Gemini API (opsional): https://makersuite.google.com/app/apikey
  - Quota: 60 requests/menit
  - Biaya: **GRATIS TIER TERSEDIA**

### 4. Setup Login TikTok (Opsional)

```bash
cd bot-automation
python main.py --setup-login
```

Browser akan terbuka, login ke akun TikTok Anda (GRATIS). Session akan disimpan untuk upload berikutnya.

## 💻 Cara Menggunakan

### Mode Single Run (1x jalanan) - GRATIS

```bash
cd bot-automation
python main.py
```

Program akan:
1. Menanyakan genre video yang diinginkan
2. Mencari video di YouTube (GRATIS dengan YouTube API)
3. Menganalisis dan memilih video terbaik (GRATIS dengan Gemini AI)
4. Download, translate (GRATIS dengan googletrans!), dan proses video
5. Upload ke TikTok (GRATIS dengan Playwright)

### Mode Loop (Berulang) - GRATIS

```bash
python main.py --loop
```

Akan menjalankan workflow secara berulang dengan delay 1 jam (default). **100% GRATIS!**

### Custom Genre

```bash
python main.py --genre gaming
```

Genre tersedia: gaming, comedy, tech, lifestyle, education, music, sports, cooking, travel, finance

### Custom Loop Settings

```bash
python main.py --loop --max-loops 5 --delay 7200
```

- `--max-loops 5`: Maksimal 5 iterasi (-1 untuk unlimited)
- `--delay 7200`: Delay 7200 detik (2 jam) antar iterasi

## 📁 Struktur Project

```
bot-automation/
├── main.py              # Main script
├── config.py            # Konfigurasi (set USE_FREE_TRANSLATION=True untuk gratis total!)
├── youtube_engine.py    # YouTube search & download (GRATIS dengan yt-dlp)
├── analyzer.py          # AI viral analysis (GRATIS dengan Gemini free tier)
├── translator.py        # Translation engine (GRATIS dengan googletrans!)
├── image_gen.py         # Thumbnail generator (GRATIS dengan PIL!)
├── video_processor.py   # Video processing (GRATIS dengan MoviePy!)
├── uploader.py          # Platform uploader (GRATIS dengan Playwright!)
├── output/              # Output folder
│   ├── videos/         # Downloaded videos
│   └── thumbnails/     # Generated thumbnails
└── temp/               # Temporary files
```

## ⚙️ Konfigurasi Penting

Edit `config.py` untuk mengubah:

```python
# RECOMMENDED: Gunakan metode 100% GRATIS
USE_FREE_TRANSLATION = True  # googletrans (tidak perlu API key!)
USE_SIMPLE_ANALYSIS = False  # Set True untuk analisis sederhana tanpa AI
USE_WEB_SCRAPING = False     # Set True untuk scrape YouTube tanpa API

# Settings lain
MAX_VIDEO_DURATION = 60          # Durasi maksimal video (60s untuk TikTok)
MIN_VIRAL_VIEWS = 100000         # Minimal views untuk dianggap viral
VIDEOS_TO_ANALYZE = 10           # Jumlah video yang dianalisis
LOOP_DELAY_SECONDS = 3600        # Delay antar loop (1 jam)
DEFAULT_GENRE = "gaming"         # Genre default
```

## 💰 Breakdown Biaya - SEMUA GRATIS!

| Komponen | Service | Biaya | Quota |
|----------|---------|-------|-------|
| YouTube Search | YouTube Data API | **GRATIS** | 10,000 units/day |
| Translation | googletrans | **GRATIS** | Unlimited |
| AI Analysis | Gemini free tier | **GRATIS** | 60 req/min |
| Thumbnail | PIL (local) | **GRATIS** | Unlimited |
| Video Processing | MoviePy (local) | **GRATIS** | Unlimited |
| Upload | Playwright (local) | **GRATIS** | Unlimited |

**TOTAL BIAYA: Rp 0 (NOL RUPIAH)! 🎉**

## ⚠️ Disclaimer

- **TikTok TOS**: Automation bisa melanggar Terms of Service TikTok. Gunakan dengan risiko Anda sendiri.
- **Copyright**: Pastikan Anda punya hak untuk repost video yang digunakan.
- **API Quotas**: Gratis tidak berarti unlimited - ada quotas harian (tapi sangat besar untuk personal use).

## 🐛 Troubleshooting

### Error googletrans
→ Install ulang: `pip install googletrans==3.1.0a0`

### "Please set your YouTube API key" (tapi mau 100% gratis)
→ Set `USE_WEB_SCRAPING = True` di config.py (masih experimental)

### Video download gagal
→ Cek koneksi internet, atau video mungkin ter-restrict

### Upload TikTok gagal
→ Pastikan sudah login dengan `python main.py --setup-login`

## 🎉 Kesimpulan

Bot ini 100% GRATIS untuk digunakan! Anda tidak perlu membayar:
- ❌ Subscription fees
- ❌ API costs (free tier sangat cukup)
- ❌ Cloud processing
- ❌ Premium features

Semua berjalan lokal di komputer Anda dengan free tier APIs! 🚀
