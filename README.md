# AISTEL — Clean Space. Better Living.

**AISTEL** (*Awareness Initiative for Sustainable Environment & Living*) adalah aplikasi web untuk
memesan layanan kebersihan dan perawatan lingkungan secara online. Pengguna memilih layanan,
menentukan jadwal dan lokasi, lalu memantau status pesanannya. Admin mengelola pesanan dan melayani
pengguna melalui fitur chat.

## Fitur

**Pengguna**
- Daftar dan login (dengan email atau username), serta lupa password
- Pesan layanan: pilih layanan, tanggal, waktu (WIB/WITA/WIT), dan lokasi di peta
- Pembayaran (simulasi): QRIS, Virtual Account, e-wallet, minimarket, tunai
- Pesanan Saya: lihat detail, pantau status, batalkan pesanan, serta cari dan filter riwayat (status, tanggal)
- Invoice PDF: unduh bukti pembayaran setelah pesanan lunas
- Rating & ulasan: beri bintang 1–5 dan komentar setelah pesanan selesai; rata-rata rating tampil di halaman layanan
- Helpdesk: chat langsung dengan admin
- Notifikasi: lonceng di aplikasi + email saat status pesanan berubah, pembayaran lunas, dan balasan helpdesk
- Profil, foto profil, dan buku alamat

**Admin**
- Dashboard ringkasan pesanan
- Kelola pesanan: terima, tolak, dan selesaikan, serta pantau status pembayaran
- Cari dan filter pesanan: nama/email/telepon/layanan/no. pesanan, status, layanan, rentang tanggal, status bayar
- Kelola layanan: tambah, ubah, dan hapus
- Helpdesk: membalas chat semua pengguna
- Notifikasi: lonceng saat ada pesanan baru, pesanan dibatalkan pelanggan, dan pesan helpdesk baru

**Layanan yang tersedia:** Kebersihan Hunian, Perawatan Tanaman, Pengelolaan Sampah, Sanitasi Lingkungan.

Alur status pesanan: `Menunggu` → `Diproses` → `Selesai` (atau `Ditolak` / `Dibatalkan`).

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Backend | Laravel 11 (PHP 8.2+) |
| Frontend | React 18 + TypeScript, dihubungkan dengan Inertia.js |
| Tampilan | Tailwind CSS |
| Database | MySQL |
| Peta | Leaflet (OpenStreetMap) |

## Menjalankan di Komputer Lokal

**Kebutuhan:** PHP 8.2+, Composer, Node.js 18+, dan MySQL. Di Windows, [Laragon](https://laragon.org/)
sudah mencakup semuanya.

```bash
# 1. Ambil project dan install dependency
git clone https://github.com/R1ngG3r1/AISTELL.git
cd AISTELL
composer install
npm install

# 2. Siapkan konfigurasi
cp .env.example .env          # Windows: copy .env.example .env
php artisan key:generate

# 3. Buat database kosong bernama aistell_db di MySQL, lalu:
php artisan migrate --seed

# 4. Jalankan aplikasi
composer dev
```

Buka **http://localhost:8000**.

Jika username atau password MySQL berbeda, sesuaikan `DB_USERNAME` dan `DB_PASSWORD` di file `.env`.

## Akun Demo

Password semua akun: `password`

| Peran | Email |
| --- | --- |
| Admin | `admin@aistel.test` |
| User | `user@aistel.test` |

## Deploy

1. Salin `.env.example` menjadi `.env`, lalu isi dengan pengaturan server:
   `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL`, dan koneksi database.
2. Jalankan perintah berikut di server:

```bash
composer install --no-dev --optimize-autoloader
npm install && npm run build
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force      # opsional: layanan awal dan akun admin
php artisan optimize
```

3. Arahkan *document root* web server ke folder `public/`.

Catatan: ganti password akun admin bawaan sebelum aplikasi dipakai publik.

## Struktur Singkat

```
app/Modules/      fitur utama (Order, Service, Payment, Helpdesk, Address, Dashboard)
resources/js/     halaman dan komponen React
database/         migrasi dan data awal (seeder)
routes/           definisi URL aplikasi
tests/            test otomatis
```

## Test

```bash
php artisan test
```

## Tim

Dikembangkan oleh tim AISTEL.
