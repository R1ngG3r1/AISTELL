# AISTEL

**Clean Space. Better Living.**

AISTEL (*Awareness Initiative for Sustainable Environment & Living*) adalah aplikasi web untuk memesan
layanan kebersihan dan perawatan lingkungan secara online. Pengguna dapat memilih layanan, menentukan
jadwal dan lokasi, membayar, lalu memantau status pesanannya. Admin mengelola pesanan, layanan, dan
petugas, serta melayani pengguna melalui helpdesk.

## Fitur Utama

**Pengguna**
- Daftar dan login dengan email atau akun Google
- Pemesanan layanan dengan pilihan jadwal dan lokasi di peta
- Pembayaran (simulasi) dan invoice PDF
- Riwayat dan status pesanan, serta rating & ulasan
- Helpdesk (chat dengan admin) dan notifikasi
- Profil dan buku alamat

**Admin**
- Dashboard dan laporan pendapatan/pesanan
- Kelola pesanan, layanan, dan petugas lapangan
- Helpdesk untuk membalas pengguna

Layanan yang tersedia: Kebersihan Hunian, Perawatan Tanaman, Pengelolaan Sampah, dan Sanitasi Lingkungan.

## Teknologi

- **Backend:** Laravel 11 (PHP 8.3)
- **Frontend:** React 18 + TypeScript dengan Inertia.js
- **Tampilan:** Tailwind CSS
- **Database:** MySQL
- **Peta:** Leaflet (OpenStreetMap)

## Instalasi

**Kebutuhan:** PHP 8.3+, Composer, Node.js 18+, dan MySQL.

```bash
git clone https://github.com/R1ngG3r1/AISTELL.git
cd AISTELL

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Buat database kosong bernama `aistell_db`, sesuaikan pengaturan database di file `.env` bila perlu,
lalu jalankan:

```bash
php artisan migrate --seed
composer dev
```

Aplikasi dapat dibuka di **http://localhost:8000**.

### Akun Demo

| Peran | Email | Password |
| --- | --- | --- |
| Admin | `admin@aistel.test` | `password` |
| User | `user@aistel.test` | `password` |

## Testing

```bash
php artisan test
npm test
```

## Deploy

Panduan deploy ke server tersedia di [docs/DEPLOY.md](docs/DEPLOY.md). Gunakan
`.env.production.example` sebagai acuan konfigurasi production.

## Tim

Dikembangkan oleh tim AISTEL.
