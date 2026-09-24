# AISTEL

**Awareness Initiative for Sustainable Environment & Living**: platform pemesanan layanan
kebersihan dan perawatan lingkungan. User memesan layanan, lalu Admin menerima/menolak dan
memperbarui status pesanan.

- Kebutuhan produk: [PRD_AISTEL.md](PRD_AISTEL.md)
- Dokumentasi backend (arsitektur, route, kontrak data untuk FE): [docs/BACKEND_ROADMAP.md](docs/BACKEND_ROADMAP.md)
- Panduan mengelola database & akun: [docs/PANDUAN_DATABASE.md](docs/PANDUAN_DATABASE.md)
- Design system (warna, font, komponen, animasi): [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)

---

## Stack

| Bagian | Teknologi |
| --- | --- |
| Backend | PHP 8.2+ / Laravel 11, arsitektur modular di `app/Modules/` |
| Frontend | React 18 + TypeScript lewat **Inertia.js** (satu aplikasi dengan Laravel, bukan REST API terpisah) |
| Auth | Laravel Breeze (session), role `user` / `admin` |
| Database | MySQL 8 (Laragon) |
| Styling | Tailwind CSS v3 |
| Test & format | Pest, Laravel Pint |

---

## Menjalankan project

### 1. Prasyarat

Cara termudah di Windows: install **[Laragon](https://laragon.org/)**, yang sudah berisi PHP, MySQL,
Composer, Node.js, dan HeidiSQL.

| Kebutuhan | Versi | Cek dengan |
| --- | --- | --- |
| PHP | ≥ 8.2 (ekstensi `pdo_mysql`, `pdo_sqlite`) | `php -v` |
| Composer | ≥ 2 | `composer -V` |
| Node.js | ≥ 18 | `node -v` |
| MySQL | 8.x | Laragon → **Start All** |

> Jika `php` tidak dikenali di terminal, pakai terminal Laragon (tombol **Terminal**) atau
> jalankan `run-local.bat`, yang otomatis memakai PHP dari Laragon.

### 2. Clone & install

```bash
git clone https://github.com/R1ngG3r1/AISTELL.git
cd AISTELL
composer install
npm install
```

Sudah pernah clone? Cukup:

```bash
git pull
composer install     # jika composer.lock berubah
npm install          # jika package-lock.json berubah
```

### 3. File `.env`

```bash
cp .env.example .env        # Windows CMD: copy .env.example .env
php artisan key:generate
```

Default `.env.example` sudah memakai MySQL Laragon:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aistell_db
DB_USERNAME=root
DB_PASSWORD=
```

> **Sudah punya `.env` lama?** `.env` tidak ikut ter-pull. Pastikan isinya `DB_CONNECTION=mysql`
> seperti di atas (versi lama memakai `pgsql`).

### 4. Buat database & isi data

Buat database kosong bernama **`aistell_db`**: Laragon → **Database** (HeidiSQL) → klik kanan
koneksi → *Create new → Database*. Bisa juga lewat terminal:

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS aistell_db"
```

Lalu buat tabel + data demo:

```bash
php artisan migrate --seed
```

> **Pull dari versi lama dan muncul error saat migrate?** Reset database lokal:
> `php artisan migrate:fresh --seed`. Perintah ini **menghapus semua data lokal**; jangan dipakai di server.

### 5. Jalankan

```bash
# Windows: klik dua kali run-local.bat, ATAU buka 2 terminal:
php artisan serve     # terminal 1 → backend
npm run dev           # terminal 2 → frontend (Vite)
```

Buka **http://localhost:8000**.

### 6. Akun demo

Semua password: **`password`**

| Email | Role | Keterangan |
| --- | --- | --- |
| `admin@aistel.test` | admin | Dashboard Admin, Kelola Pesanan, Kelola Layanan |
| `user@aistel.test` | user | Sudah punya contoh pesanan di setiap status |
| `user2@aistel.test` | user | Untuk mengetes bahwa user tidak bisa melihat pesanan user lain |

Akun baru hasil **Register** otomatis menjadi `user`. Untuk menambah admin, lihat
[docs/PANDUAN_DATABASE.md](docs/PANDUAN_DATABASE.md).

---

## Alur yang bisa dicoba

1. Login sebagai `user@aistel.test` → **Pesan Layanan** → pilih layanan → isi form → Kirim.
2. Pesanan muncul di **Pesanan Saya** dengan status *Menunggu*.
3. Logout → login `admin@aistel.test` → **Kelola Pesanan** → buka pesanan → *Terima* → *Tandai Selesai*.
4. Login kembali sebagai user → status pesanan menjadi *Selesai*.

---

## Struktur project

```
app/
├── Console/Commands/     perintah aistel:* (kelola akun dari terminal)
├── Http/Middleware/      EnsureUserHasRole (role:admin / role:user)
├── Models/User.php
└── Modules/              satu folder per fitur
    ├── Dashboard/        /dashboard, /admin/dashboard
    ├── Service/          layanan: lihat + CRUD admin
    ├── Order/            pesanan: user & admin, status, policy
    └── User/             daftar pengguna (admin)
database/
├── migrations/  factories/  seeders/
resources/js/
├── Components/  Layouts/  lib/  types/
└── Pages/                halaman React (Admin/, Orders/, Services/, Auth/, Profile/, …)
tests/Feature/            test Pest
docs/                     dokumentasi backend & database
```

Setiap modul di `app/Modules/<Nama>/` berisi `Controllers/`, `Models/`, `Services/`, `Requests/`,
`Routes/web.php`, dan `Database/Migrations/`. Route dan migrasinya dimuat otomatis oleh
`app/Providers/ModuleServiceProvider.php`.

---

## Perintah yang sering dipakai

| Perintah | Kegunaan |
| --- | --- |
| `php artisan route:list --except-vendor` | Melihat semua URL/route |
| `php artisan migrate` | Menjalankan migrasi baru setelah pull |
| `php artisan db:seed` | Mengisi/memulihkan akun demo & layanan (aman diulang) |
| `php artisan migrate:fresh --seed` | Reset total database lokal |
| `php artisan aistel:users` | Daftar akun |
| `php artisan aistel:create-admin` | Menambah admin |
| `php artisan test` | Menjalankan semua test |
| `vendor/bin/pint` | Merapikan kode PHP |
| `npm run build` | Build asset production |

---

## Troubleshooting

| Masalah | Solusi |
| --- | --- |
| `SQLSTATE[HY000] [2002]` / *Connection refused* | MySQL belum jalan → Laragon **Start All** |
| `Unknown database 'aistell_db'` | Buat database dulu (langkah 4) |
| `could not find driver (pgsql)` | `.env` masih versi lama → ubah `DB_CONNECTION=mysql` |
| `Table 'services' already exists` / kolom `role` tidak ada | `php artisan migrate:fresh --seed` |
| Halaman putih / `Vite manifest not found` | `npm run dev` belum jalan (atau `npm run build`) |
| `No application encryption key` | `php artisan key:generate` |
| Perubahan `.env` tidak terbaca | `php artisan config:clear` |
| Lupa password akun | `php artisan aistel:reset-password email@contoh.com` |

---

## Pembagian kerja & alur Git

- **Backend**: modul di `app/Modules/`. Controller memanggil `Inertia::render('Folder/Halaman', $props)`.
- **Frontend**: halaman di `resources/js/Pages/`. Daftar halaman, props, dan halaman mana yang
  masih perlu didesain ulang ada di [docs/BACKEND_ROADMAP.md](docs/BACKEND_ROADMAP.md#daftar-halaman-untuk-fe).
  Panggil URL dengan `route('nama.route')` (Ziggy).
- **Git**: jangan commit langsung ke `main`. Buat branch `<Divisi>-<Nama>-<Fitur>` (mis.
  `FE-Reuben-LandingPage`), lalu buka Pull Request. Sebelum PR, pastikan `php artisan test` lolos.
