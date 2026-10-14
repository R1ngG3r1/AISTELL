# Panduan Deploy AISTEL

Panduan ini berlaku untuk hosting mana pun yang menyediakan **PHP 8.2+**, **MySQL/MariaDB**, dan **SSH**
(VPS, hosting dengan SSH, atau PaaS). Pilihan hosting dan alasannya ada di bagian akhir.

## 1. Kebutuhan server

| Kebutuhan | Keterangan |
| --- | --- |
| PHP 8.2+ | Ekstensi: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `fileinfo`, `gd` (foto profil) |
| MySQL 8 / MariaDB 10.4+ | `max_allowed_packet` minimal 8 MB (lampiran helpdesk disimpan di database, maks. 2 MB per file) |
| Composer 2 | Untuk `composer install` |
| Node 18+ | Hanya untuk `npm run build`. Boleh di laptop, lalu `public/build` diunggah |
| HTTPS | Wajib (cookie sesi aman). Gratis lewat Let's Encrypt / Cloudflare |
| Document root | Harus menunjuk ke folder **`public/`**, bukan ke root project |

Tidak dibutuhkan: Redis, queue worker, atau cron. Sesi, cache, dan queue memakai database / `sync`.

## 2. Langkah deploy

```bash
git clone <repo> aistel && cd aistel          # atau unggah file project
composer install --no-dev --optimize-autoloader

cp .env.production.example .env               # isi semua nilai bertanda GANTI
php artisan key:generate                      # pertama kali saja

npm ci && npm run build                       # atau build di laptop lalu unggah public/build

php artisan migrate --force
php artisan db:seed --class=AdminSeeder --force     # membuat admin dari ADMIN_EMAIL/ADMIN_PASSWORD
php artisan db:seed --class=ServiceSeeder --force   # layanan awal (opsional)

php artisan config:cache && php artisan route:cache && php artisan view:cache
```

Jangan jalankan `php artisan db:seed` biasa atau `migrate:fresh` di production (akun demo & hapus data).

Izin tulis untuk web server pada folder `storage/` dan `bootstrap/cache/`
(`chmod -R 775 storage bootstrap/cache`). Foto profil disimpan di `storage/app/private/`.

## 3. Daftar periksa sebelum online

- [ ] `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://…`, `APP_KEY` baru
- [ ] `ADMIN_PASSWORD` kuat; ganti lagi setelah login pertama
- [ ] SMTP terisi (tanpa ini fitur *Lupa password* tidak mengirim email). Opsi gratis: Brevo (±300 email/hari) atau Gmail + App Password
- [ ] File `public/hot` **tidak ikut** terunggah (sisa `npm run dev`; jika ada, halaman putih)
- [ ] `public/build/` ada (hasil `npm run build`)
- [ ] Akun demo (`user@aistel.test`, dst.) tidak ada di database production
- [ ] Backup database terjadwal (lihat [PANDUAN_DATABASE.md](PANDUAN_DATABASE.md))
- [ ] Buka `/up` → harus menampilkan status sehat

## 4. Catatan khusus aplikasi ini

- **Foto profil memakai disk lokal** (`storage/app/private`). Di PaaS/container yang filesystem-nya
  dihapus setiap deploy (Render, Koyeb, Railway tanpa volume), foto akan hilang. Di VPS / hosting biasa aman.
- **Helpdesk & dashboard memakai polling** (chat tiap ±5 detik, data dashboard tiap 20 detik).
  Hosting murah dengan batas proses / CPU ketat bisa terasa berat jika pengguna bersamaan banyak.
- **Pembayaran masih dummy** (tidak ada uang sungguhan). Ganti `PaymentService` dengan payment gateway
  sebelum dipakai untuk transaksi nyata.
- **Peta** memakai tile OpenStreetMap publik: cukup untuk skala kecil. Untuk trafik besar pakai penyedia tile sendiri.
- Di belakang proxy (PaaS / Cloudflare) isi `TRUSTED_PROXIES=*`.

## 5. Memperbarui versi (deploy ulang)

```bash
git pull
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan optimize:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache
```

## 6. Pilihan hosting

Harga dan kuota gratis berubah sering; cek halaman resmi masing-masing sebelum mendaftar.

| Opsi | Biaya | Cocok untuk | Catatan |
| --- | --- | --- | --- |
| **VPS Oracle Cloud "Always Free"** | Gratis (perlu kartu untuk verifikasi) | Demo/produksi kecil yang harus selalu aktif | Full kontrol & disk permanen (foto profil aman). Harus setup Nginx + PHP-FPM + MariaDB + SSL sendiri |
| **Hosting Indonesia dengan SSH** (Niagahoster, Hostinger, Rumahweb, dll.) | Kisaran belasan–puluhan ribu Rp/bulan | Paling praktis untuk tugas/proyek kecil | Pastikan paket punya **SSH, Composer, PHP 8.2+**; cPanel, SSL gratis, MySQL siap pakai. Cek harga perpanjangan |
| **Render (Docker) + MySQL gratis** (TiDB Cloud / Aiven) | Gratis | Presentasi / demo sementara | Tidur setelah ±15 menit idle (bangun 30–50 dtk), foto profil hilang tiap deploy, DB gratis punya batas |
| **VPS berbayar** (Hostinger/DigitalOcean/dll.) | Mulai ±Rp100 ribuan/bulan | Jika butuh stabil & kontrol penuh | Pelajar bisa cek GitHub Student Developer Pack |
