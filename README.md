# AISTEL — Clean Space. Better Living.

**AISTEL** (*Awareness Initiative for Sustainable Environment & Living*) adalah aplikasi web pemesanan
layanan kebersihan dan perawatan lingkungan. Pengguna memesan layanan (bersih rumah, potong rumput,
angkut sampah, dll.), admin menerima/menolak pesanan dan memperbarui statusnya, dan pengguna dapat
memantau statusnya secara realtime.

| Area | Fitur |
| --- | --- |
| Publik | Landing page, daftar akun, login (email **atau** username), lupa password |
| User | Dashboard, pesan layanan, Pesanan Saya (detail, batalkan), profil + foto profil + buku alamat (peta OpenStreetMap) |
| Admin | Dashboard ringkasan, Kelola Pesanan (terima / tolak / selesai), Kelola Layanan, daftar Pengguna |

---

## Daftar isi

1. [Teknologi](#1-teknologi)
2. [Yang perlu di-install](#2-yang-perlu-di-install)
3. [Instalasi pertama kali (setelah clone)](#3-instalasi-pertama-kali-setelah-clone)
4. [Menjalankan aplikasi](#4-menjalankan-aplikasi)
5. [Akun demo](#5-akun-demo)
6. [Setelah `git pull` (wajib dibaca)](#6-setelah-git-pull-wajib-dibaca)
7. [Database](#7-database)
8. [Struktur project](#8-struktur-project)
9. [Perintah yang sering dipakai](#9-perintah-yang-sering-dipakai)
10. [Test otomatis](#10-test-otomatis)
11. [Mengirim email (lupa password)](#11-mengirim-email-lupa-password)
12. [Masalah yang sering muncul](#12-masalah-yang-sering-muncul)
13. [Alur kerja Git tim](#13-alur-kerja-git-tim)
14. [Dokumentasi lain](#14-dokumentasi-lain)

---

## 1. Teknologi

| Bagian | Teknologi |
| --- | --- |
| Backend | Laravel 11 (PHP 8.2+), arsitektur *modular monolith* (`app/Modules/*`) |
| Frontend | React 18 + TypeScript, dijembatani **Inertia.js** (bukan REST API terpisah) |
| Styling | Tailwind CSS 3, Font Awesome |
| Database | MySQL 8 (default). SQLite bisa dipakai untuk mencoba cepat |
| Build tool | Vite 5 |
| Test | Pest (PHP), database SQLite di memori |

> **Inertia.js** artinya Laravel dan React berada di **satu aplikasi**. Controller Laravel mengirim data
> langsung sebagai *props* ke halaman React di `resources/js/Pages/`. Login memakai session/cookie biasa,
> tidak perlu token API.

---

## 2. Yang perlu di-install

| Software | Versi | Cek di terminal |
| --- | --- | --- |
| PHP | 8.2 atau lebih baru (ekstensi `pdo_mysql`, `fileinfo`, `gd` aktif) | `php -v` |
| Composer | 2.x | `composer -V` |
| Node.js | 18 atau lebih baru (disarankan 20+) | `node -v` |
| MySQL | 8.x | – |
| Git | bebas | `git --version` |

**Paling mudah di Windows: pakai [Laragon](https://laragon.org/)**. Laragon sudah berisi PHP, MySQL,
HeidiSQL (aplikasi untuk melihat isi database), dan Composer. Pastikan Laragon sudah **Start All**
(MySQL menyala) sebelum lanjut. Gunakan tombol **Terminal** di Laragon agar perintah `php` dan
`composer` langsung dikenali.

> Pakai XAMPP / MAMP / instalasi manual juga bisa, asalkan versi di atas terpenuhi.

---

## 3. Instalasi pertama kali (setelah clone)

Lakukan langkah ini **sekali saja** saat pertama kali mengambil project.

### Langkah 1 — Clone repository

```bash
git clone https://github.com/R1ngG3r1/AISTELL.git
cd AISTELL
```

### Langkah 2 — Install dependency PHP & JavaScript

```bash
composer install
npm install
```

Folder `vendor/` dan `node_modules/` tidak ikut di Git, jadi langkah ini wajib.

### Langkah 3 — Buat file konfigurasi `.env`

```bash
# Windows (PowerShell / CMD)
copy .env.example .env

# macOS / Linux / Git Bash
cp .env.example .env
```

Lalu buat kunci aplikasi:

```bash
php artisan key:generate
```

> File `.env` berisi pengaturan lokal masing-masing (password database, dll.) dan **tidak di-commit**
> ke Git. Isi bawaannya sudah cocok untuk Laragon.

### Langkah 4 — Buat database kosong

Buat database bernama **`aistell_db`** (perhatikan: dua huruf **L**).

- **HeidiSQL (Laragon):** Laragon → tombol **Database** → klik kanan koneksi → **Create new → Database**
  → nama `aistell_db` → OK.
- **phpMyAdmin (XAMPP):** tab **Databases** → isi `aistell_db` → **Create**.
- **Lewat terminal:**

  ```bash
  mysql -u root -e "CREATE DATABASE aistell_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  ```

Jika username/password MySQL kamu bukan `root` tanpa password, sesuaikan di `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aistell_db
DB_USERNAME=root
DB_PASSWORD=
```

### Langkah 5 — Buat tabel + isi data demo

```bash
php artisan migrate --seed
```

Perintah ini membuat semua tabel (`users`, `services`, `orders`, dll.) lalu mengisi **akun demo,
layanan awal, dan contoh pesanan**. Lihat [Akun demo](#5-akun-demo).

### Langkah 6 — Jalankan

```bash
composer dev
```

Buka **http://localhost:8000**. Selesai 🎉

> **Ringkasan cepat (copy-paste)** setelah database `aistell_db` dibuat:
>
> ```bash
> composer install && npm install
> copy .env.example .env        # macOS/Linux: cp .env.example .env
> php artisan key:generate
> php artisan migrate --seed
> composer dev
> ```

---

## 4. Menjalankan aplikasi

Aplikasi butuh **dua proses** yang berjalan bersamaan: server Laravel (PHP) dan Vite (React/CSS).

### Cara 1 — Satu perintah (disarankan)

```bash
composer dev
```

Perintah ini otomatis:
1. menjalankan migrasi database yang belum dijalankan (`php artisan migrate`),
2. menyalakan server Laravel di `http://localhost:8000`,
3. menyalakan Vite (perubahan kode React/CSS langsung terlihat tanpa refresh manual).

Hentikan dengan **Ctrl + C**.

### Cara 2 — Dua terminal terpisah

```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev
```

Buka **http://localhost:8000** (bukan alamat `localhost:5173` yang ditampilkan Vite).

### Mode build (tanpa Vite dev server)

```bash
npm run build
php artisan serve
```

Dipakai jika hanya ingin menjalankan aplikasi tanpa mengubah kode frontend, atau sebelum deploy.

---

## 5. Akun demo

Dibuat otomatis oleh `php artisan migrate --seed` (atau `php artisan db:seed`). Password semua akun:
**`password`**

| Email | Role | Isi |
| --- | --- | --- |
| `admin@aistel.test` | Admin | Mengelola pesanan, layanan, dan melihat pengguna |
| `user@aistel.test` | User | Punya 5 contoh pesanan (satu untuk setiap status) |
| `user2@aistel.test` | User | Punya 1 pesanan (untuk mengetes bahwa user tidak bisa melihat pesanan orang lain) |

Login bisa memakai **email** atau **username** (nama akun, jika nama itu hanya dipakai satu akun).

> Akun demo hilang? Jalankan `php artisan db:seed`. Aman diulang dan tidak menghapus data lain.
> Akun baru dari halaman **Daftar** selalu menjadi **user**. Admin dibuat lewat perintah
> `php artisan aistel:create-admin` (lihat [docs/PANDUAN_DATABASE.md](docs/PANDUAN_DATABASE.md)).

---

## 6. Setelah `git pull` (wajib dibaca)

Setiap kali mengambil perubahan terbaru dari tim, jalankan:

```bash
git pull
composer install        # jika composer.json / composer.lock berubah
npm install             # jika package.json / package-lock.json berubah
php artisan migrate     # jika ada file migrasi baru
```

> ⚠️ **Jangan lupa `php artisan migrate`.** Jika ada migrasi baru yang belum dijalankan, aplikasi akan
> error seperti:
>
> ```
> SQLSTATE[42S22]: Column not found: 1054 Unknown column 'address' in 'field list'
> ```
>
> Cek migrasi yang belum dijalankan dengan `php artisan migrate:status` (statusnya `Pending`).
> Jika memakai `composer dev`, migrasi dijalankan otomatis.

---

## 7. Database

### Bagaimana database "ada di project"?

Isi database (data akun, pesanan) **tidak** disimpan di Git. Yang disimpan di Git adalah
**struktur** dan **data awalnya**, sehingga setiap anggota tim bisa membangun database yang sama:

| Isi | Lokasi | Fungsi |
| --- | --- | --- |
| **Migrasi** | `database/migrations/` dan `app/Modules/*/Database/Migrations/` | "Resep" membuat/mengubah tabel. Dijalankan dengan `php artisan migrate` |
| **Seeder** | `database/seeders/` | Mengisi data awal: admin, layanan, akun & pesanan demo. Dijalankan dengan `php artisan db:seed` |
| **Factory** | `database/factories/` | Pembuat data palsu untuk seeder & test |

### Tabel utama

```
users 1 ──── N orders N ──── 1 services
```

| Tabel | Isi |
| --- | --- |
| `users` | Akun user & admin: nama, email, telepon, foto profil, `role` (`user` / `admin`) |
| `addresses` | Buku alamat user: label, alamat, detail, titik peta (latitude/longitude), `is_primary` (alamat utama → mengisi otomatis lokasi pemesanan) |
| `services` | Layanan kebersihan: nama, deskripsi, harga |
| `orders` | Pesanan: layanan, harga saat dipesan, tanggal, jam, lokasi, kontak, catatan, `status` |
| `sessions`, `cache`, `jobs`, `migrations` | Tabel sistem Laravel, jangan diedit manual |

Status pesanan: `menunggu` → `diproses` → `selesai`, atau berakhir di `ditolak` / `dibatalkan`.

### Aturan penting

- **Mengubah struktur tabel? Selalu lewat migrasi** (`php artisan make:migration ...`), jangan lewat
  HeidiSQL/phpMyAdmin. Kalau lewat HeidiSQL, anggota tim lain tidak akan mendapat perubahannya.
- **Jangan mengedit file migrasi yang sudah di-push.** Buat migrasi baru untuk perubahan berikutnya.
- **Jangan commit file backup database (`.sql`)**: isinya email & hash password.
- `php artisan migrate:fresh --seed` **menghapus semua data** lalu membuat ulang. Hanya untuk lokal.

### Ingin mencoba tanpa MySQL? (SQLite)

Ubah di `.env`:

```env
DB_CONNECTION=sqlite
# hapus / beri tanda # pada DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
```

Lalu buat file database kosong dan jalankan migrasi:

```bash
# Windows PowerShell
New-Item database/database.sqlite -ItemType File
# macOS / Linux
touch database/database.sqlite

php artisan migrate --seed
```

Panduan lengkap (tambah admin, reset password user, backup/restore, Tinker):
**[docs/PANDUAN_DATABASE.md](docs/PANDUAN_DATABASE.md)**

---

## 8. Struktur project

```
AISTELL/
├── app/
│   ├── Http/                     controller auth & profil, middleware (role, Inertia)
│   ├── Models/User.php           model akun (+ foto profil, alamat)
│   ├── Services/AvatarService.php  memproses foto profil (crop 400×400)
│   └── Modules/                  fitur utama, satu folder per modul
│       ├── Dashboard/            /dashboard (user) & /admin/dashboard
│       ├── Order/                pesanan: controller, model, aturan status, migrasi, routes
│       ├── Service/              layanan kebersihan: lihat + kelola (admin)
│       └── User/                 daftar pengguna (admin)
├── database/
│   ├── migrations/               migrasi tabel users & tabel sistem
│   ├── seeders/                  AdminSeeder, ServiceSeeder, DatabaseSeeder (data demo)
│   └── factories/                data palsu untuk test & seeder
├── lang/id/                      pesan validasi & error dalam Bahasa Indonesia
├── public/                       aset gambar (landingpage/, login/), hasil build
├── resources/
│   ├── css/app.css               style global + landing page
│   └── js/
│       ├── Pages/                halaman React (satu file = satu halaman)
│       ├── Layouts/              layout login/register, layout setelah login (sidebar)
│       ├── Components/           komponen yang dipakai ulang
│       ├── lib/                  helper: format rupiah/tanggal, animasi, realtime
│       └── types/index.d.ts      tipe data dari backend (TypeScript)
├── routes/                       web.php (landing, profil), auth.php (login, register, password)
├── tests/Feature/                test otomatis (Pest)
└── docs/                         dokumentasi backend, database, design system
```

Setiap folder di `app/Modules/<Nama>/` otomatis dimuat (routes, migrasi, provider) oleh
`app/Providers/ModuleServiceProvider.php`.

---

## 9. Perintah yang sering dipakai

| Perintah | Kegunaan |
| --- | --- |
| `composer dev` | Menjalankan aplikasi (migrasi + server + Vite) |
| `php artisan migrate` | Menjalankan migrasi baru |
| `php artisan migrate:status` | Melihat migrasi yang belum dijalankan |
| `php artisan db:seed` | Mengisi/memulihkan akun & data demo (aman diulang) |
| `php artisan migrate:fresh --seed` | ⚠️ Reset total database lokal + data demo |
| `php artisan aistel:users` | Melihat daftar akun |
| `php artisan aistel:create-admin` | Membuat akun admin |
| `php artisan aistel:set-role email@contoh.com admin` | Mengubah role akun |
| `php artisan aistel:reset-password email@contoh.com` | Mengganti password akun |
| `php artisan route:list --except-vendor` | Melihat semua URL aplikasi |
| `php artisan test` | Menjalankan semua test |
| `npm run build` | Build frontend (cek error TypeScript + hasil produksi) |
| `vendor/bin/pint` | Merapikan format kode PHP |
| `php artisan optimize:clear` | Membersihkan cache config/route/view jika perubahan tidak terbaca |

---

## 10. Test otomatis

```bash
php artisan test
```

Test memakai **SQLite di memori**, jadi database MySQL kamu **tidak tersentuh**. Jalankan test
sebelum membuat Pull Request. Satu file saja: `php artisan test --filter=OrderTest`.

Untuk frontend, `npm run build` sekaligus mengecek error TypeScript.

---

## 11. Mengirim email (lupa password)

Bawaan `.env` memakai `MAIL_MAILER=log`, artinya email **tidak benar-benar dikirim**, melainkan
ditulis ke `storage/logs/laravel.log`. Untuk mencoba fitur lupa password di lokal, buka file log itu
dan salin tautan reset-nya.

Agar email benar-benar terkirim, isi pengaturan SMTP di `.env`, contoh dengan
[Mailtrap](https://mailtrap.io/) (untuk testing) atau Gmail (pakai *App Password*):

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=emailkamu@gmail.com
MAIL_PASSWORD=app-password-16-karakter
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="emailkamu@gmail.com"
MAIL_FROM_NAME="AISTEL"
```

Setelah mengubah `.env`, jalankan `php artisan config:clear`.

---

## 12. Masalah yang sering muncul

| Gejala | Penyebab & solusi |
| --- | --- |
| `Unknown column '...'` / `Base table or view not found` | Ada migrasi yang belum dijalankan → `php artisan migrate` |
| `SQLSTATE[HY000] [1049] Unknown database 'aistell_db'` | Database belum dibuat → lihat [Langkah 4](#langkah-4--buat-database-kosong) |
| `SQLSTATE[HY000] [2002] ... connection refused` | MySQL belum menyala → Laragon **Start All** |
| `Access denied for user 'root'` | Username/password MySQL salah → sesuaikan `DB_USERNAME` / `DB_PASSWORD` di `.env` |
| `No application encryption key has been specified` | Lupa `php artisan key:generate` |
| `Vite manifest not found` | Vite belum jalan → `npm run dev` (atau `npm run build`) |
| Halaman putih / tampilan tidak berubah | Pastikan `npm run dev` berjalan; coba refresh paksa (**Ctrl + Shift + R**) |
| `'php' is not recognized ...` | PHP belum masuk PATH → pakai terminal Laragon |
| Login gagal dengan akun demo | Data demo belum ada → `php artisan db:seed` |
| Perubahan `.env` tidak terbaca | `php artisan config:clear` |
| `419 Page Expired` / "Sesi Anda telah berakhir" | Halaman terlalu lama dibuka → refresh lalu ulangi |
| Foto profil gagal diunggah | Maksimal 2 MB, format JPG/PNG/WebP. Pastikan ekstensi PHP `gd` & `fileinfo` aktif |
| Jam / tanggal selisih 7 jam | Pastikan `APP_TIMEZONE=Asia/Jakarta` di `.env`, lalu `php artisan config:clear` |

---

## 13. Alur kerja Git tim

1. Selalu mulai dari branch terbaru: `git checkout dev && git pull`.
2. Buat branch per fitur: `git checkout -b nama-fitur`.
3. Sebelum commit: `php artisan test` dan `npm run build` harus lolos.
4. Push lalu buat **Pull Request** ke branch `dev`.
5. Setelah PR di-merge, anggota lain menjalankan langkah di [Setelah `git pull`](#6-setelah-git-pull-wajib-dibaca).

File yang **tidak boleh** di-commit (sudah ada di `.gitignore`): `.env`, `vendor/`, `node_modules/`,
`public/build/`, file database lokal (`*.sqlite`), dan backup `.sql`.

---

## 14. Dokumentasi lain

| Dokumen | Isi |
| --- | --- |
| [docs/BACKEND_ROADMAP.md](docs/BACKEND_ROADMAP.md) | Arsitektur backend, hak akses per role, kontrak data (props) untuk frontend, rencana deploy |
| [docs/PANDUAN_DATABASE.md](docs/PANDUAN_DATABASE.md) | Mengelola akun, admin, layanan, pesanan, backup & restore database |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Warna, tipografi, dan komponen UI |
