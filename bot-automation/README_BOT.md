# Admin Bot untuk IndraScans

Bot ini memungkinkan Anda mengupload manhwa langsung dari Telegram tanpa perlu login ke web developer.

## Instalasi

1. Pastikan Python sudah terinstall.
2. Install dependencies:

    ```bash
    pip install -r requirements.txt
    ```

## Menjalankan Bot

1. Jalankan server Next.js Anda (`npm run dev`) di terminal lain.
2. Jalankan bot:

    ```bash
    python admin_bot.py
    ```

3. Buka Telegram dan chat dengan bot Anda.
4. Ketik `/start` untuk memunculkan menu.

## Fitur

- **Import Manhwa**: Kirim URL manhwa-raw, bot akan otomatis scrape, detect chapter, dan upload ke database.
- **Check Status**: Cek apakah server lokal berjalan.

## Troubleshooting

- Jika bot gagal connect, pastikan `API_BASE_URL` di `admin_bot.py` sesuai port Next.js (default <http://localhost:3000/api>).
- Jika import gagal "Auth Error", pastikan akun developer ada atau RLS Supabase diizinkan untuk insert.
