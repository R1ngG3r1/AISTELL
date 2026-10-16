# Backend AISTEL - Panduan & Status

Panduan kelola akun & database: [PANDUAN_DATABASE.md](PANDUAN_DATABASE.md).

Dokumen ini menjelaskan backend AISTEL yang sudah dibangun: arsitekturnya, isi setiap file, cara
menjalankan, dan cara mengujinya. Acuan kebutuhan: [PRD_AISTEL.md](../PRD_AISTEL.md) bagian 11–17.

## Status

| Fase | Isi | Status |
| --- | --- | --- |
| 0 | Arsitektur: Laravel + Inertia (bukan REST JSON) | ✅ |
| 1 | Setup lokal (Laragon PHP 8.3 + MySQL 8.4) | ✅ |
| 2 | Alur Git: branch per fitur + PR | ✅ branch `BE-Backend-MVP` |
| 3 | Database: `users` (role, phone), `services`, `orders` + seeder | ✅ |
| 4 | Login & hak akses: middleware `role`, redirect per role, `OrderPolicy` | ✅ |
| 5 | Modul Layanan: lihat + CRUD admin | ✅ |
| 6 | Modul Pesanan User: buat, daftar, detail, batal | ✅ |
| 7 | Admin: kelola pesanan, aturan status, dashboard | ✅ |
| 8 | Profil + nomor telepon | ✅ |
| 9 | Kontrak data untuk FE (tabel di bawah) | ✅ |
| 10 | Test otomatis: 95 test, semua kriteria PRD 14 | ✅ |
| 10b | Realtime (polling), foto profil, alamat utama, harga terkunci, Bahasa Indonesia | ✅ |
| 11 | Deploy ke hosting | ⏳ menunggu hosting dipilih |

---

## 1. Cara kerja aplikasi (wajib dipahami)

Repo ini memakai **Inertia.js**: Laravel dan React berada dalam satu aplikasi.

```
Browser (halaman React)
   │  klik link / kirim form
   ▼
Route (Routes/web.php) ──▶ Middleware (auth, role) ──▶ FormRequest (validasi)
                                                        │
                                                        ▼
                                  Controller ──▶ Service (business logic) ──▶ Model ──▶ MySQL
                                       │
   ◀── Inertia::render('Halaman', props) / redirect()->with('success', ...)
```

- **GET**: controller memanggil `Inertia::render('Orders/Index', ['orders' => ...])`, lalu
  React menerima `orders` sebagai props di `resources/js/Pages/Orders/Index.tsx`.
- **POST/PUT/PATCH/DELETE**: controller menyimpan data, lalu `redirect()` dengan pesan.
  Kalau validasi gagal, Laravel otomatis mengembalikan `errors` ke form React.
- **Login** memakai session/cookie (Laravel Breeze), tidak perlu token.

Karena itu, endpoint `/api/...` di PRD 17 diterjemahkan menjadi route web (lihat bagian 5).
Fiturnya sama, hanya bentuk request/response-nya yang berbeda.

### Tugas setiap lapisan

| Lapisan | Tugas | Contoh |
| --- | --- | --- |
| Route | Memetakan URL ke controller, memasang middleware | `app/Modules/Order/Routes/web.php` |
| Middleware | Pemeriksaan sebelum masuk controller (login? admin?) | `app/Http/Middleware/EnsureUserHasRole.php` |
| FormRequest | Aturan validasi input | `app/Modules/Order/Requests/StoreOrderRequest.php` |
| Policy | Hak atas satu data tertentu (pesanan milik siapa?) | `app/Modules/Order/Policies/OrderPolicy.php` |
| Controller | Tipis: terima request, panggil service, render/redirect | `app/Modules/Order/Controllers/OrderController.php` |
| Service | Business logic (aturan status, statistik) | `app/Modules/Order/Services/OrderService.php` |
| Model | Representasi tabel + relasi | `app/Modules/Order/Models/Order.php` |
| Enum | Nilai tetap + aturannya | `app/Modules/Order/Enums/OrderStatus.php` |

---

## 2. Peta file

```
app/
├── Http/Middleware/EnsureUserHasRole.php   middleware 'role:admin' / 'role:user'
├── Models/User.php                         + phone, role, isAdmin(), orders()
└── Modules/
    ├── Dashboard/                          /dashboard & /admin/dashboard
    ├── Service/                            layanan kebersihan
    │   ├── Controllers/ServiceController.php        lihat (user & admin)
    │   ├── Controllers/AdminServiceController.php   CRUD (admin)
    │   ├── Database/Migrations/…create_services_table.php
    │   ├── Models/Service.php
    │   ├── Requests/ServiceRequest.php
    │   ├── Routes/web.php
    │   └── Services/ServiceCatalog.php
    ├── Order/                              pesanan
    │   ├── Controllers/OrderController.php          user
    │   ├── Controllers/AdminOrderController.php     admin
    │   ├── Database/Migrations/…create_orders_table.php
    │   ├── Enums/OrderStatus.php                    status + aturan transisi
    │   ├── Models/Order.php
    │   ├── Policies/OrderPolicy.php
    │   ├── Providers/OrderServiceProvider.php       mendaftarkan policy
    │   ├── Requests/StoreOrderRequest.php, UpdateOrderStatusRequest.php
    │   ├── Routes/web.php
    │   └── Services/OrderService.php
    ├── Address/                            buku alamat user
    ├── Payment/                            pembayaran DUMMY (metode, kode VA/QRIS, status)
    └── Helpdesk/                           chat user ↔ admin (polling, edit/hapus, lampiran di database)

database/
├── migrations/2026_09_24_000000_add_role_and_phone_to_users_table.php
├── factories/  UserFactory (+admin()), ServiceFactory, OrderFactory (+status())
└── seeders/    AdminSeeder, ServiceSeeder, DatabaseSeeder (data demo)

tests/Feature/  ServiceTest, OrderTest, AdminOrderTest, DashboardTest
```

`ModuleServiceProvider` otomatis memuat `Routes/web.php`, `Database/Migrations/`, dan
`Providers/<Nama>ServiceProvider.php` dari setiap folder di `app/Modules/`. Untuk menambah
modul baru, cukup buat foldernya dengan struktur yang sama.

---

## 3. Database (PRD 16)

```
users 1 ── N orders N ── 1 services
```

| Tabel | Kolom penting |
| --- | --- |
| `users` | name, email, **phone**, **address** (alamat utama), **avatar_path** (foto profil), password (hash), **role** `user`/`admin` (default `user`) |
| `services` | name, description, price `decimal(12,2)` |
| `orders` | user_id (FK), service_id (FK), **price** (harga saat dipesan), date, time, location, **contact_name**, **contact_phone**, notes, status |

Keputusan desain:
- `contact_name` & `contact_phone` ditambahkan ke `orders` karena PRD 12 memintanya (pemesan
  bisa berbeda dengan pemilik akun).
- `service_id` memakai `restrictOnDelete`: layanan yang sudah pernah dipesan tidak bisa dihapus,
  agar riwayat pesanan tetap utuh. Admin akan mendapat pesan error yang jelas.
- `role` **tidak** ada di `$fillable`: user tidak bisa menjadikan dirinya admin lewat form.
- `user_id` & `status` **tidak** ada di `$fillable` Order: selalu ditentukan backend.

### Aturan status (PRD 11), di `OrderStatus::allowedTransitions()`

```
menunggu ──terima──▶ diproses ──▶ selesai
   │                    │
   ├──tolak──▶ ditolak  └──▶ dibatalkan
   └──batal──▶ dibatalkan   (user hanya boleh membatalkan saat masih menunggu)
```

`selesai`, `ditolak`, dan `dibatalkan` adalah status akhir. Perubahan yang tidak sah
(mis. `selesai → menunggu`) ditolak dengan pesan error di `errors.status`.

---

## 4. Hak akses (PRD 13)

| Fitur | Tamu | User | Admin | Dijaga oleh |
| --- | :-: | :-: | :-: | --- |
| Landing page + daftar layanan | ✓ | ✓ | ✓ | – |
| Lihat layanan `/services` | – | ✓ | ✓ | `auth` |
| Buat / lihat pesanan sendiri | – | ✓ | – | `auth` + `role:user` + `OrderPolicy` |
| Batalkan pesanan (masih menunggu) | – | ✓ | – | `OrderPolicy::cancel` |
| Semua pesanan, ubah status | – | – | ✓ | `role:admin` |
| Kelola layanan | – | – | ✓ | `role:admin` |
| Pembayaran pesanan sendiri (dummy) | – | ✓ | – | `role:user` + `OrderPolicy::pay` |
| Helpdesk: chat dengan admin `/helpdesk` | – | ✓ | – | `role:user` (hanya percakapan sendiri) |
| Helpdesk: semua percakapan `/admin/helpdesk` | – | – | ✓ | `role:admin` |
| Edit / hapus pesan helpdesk, unduh lampiran | – | ✓ | ✓ | `auth`; edit/hapus hanya pengirimnya |
| Profil & password | – | ✓ | ✓ | `auth` (admin tidak bisa menghapus akunnya) |

Setelah login, admin diarahkan ke `/admin/dashboard` dan user ke `/dashboard`.

---

## 5. Kontrak data untuk Frontend

Semua halaman juga menerima props bersama: `auth.user` (`id, name, email, phone, address, avatar_url, role`),
`flash.success` / `flash.error`, `clock` (`now`, `timezone` - untuk jam realtime), dan `counters`
(badge sidebar: `pendingOrders` untuk admin, `activeOrders` untuk user). `clock` & `counters` memakai
`Inertia::always`, jadi selalu ikut terkirim saat polling.

**Realtime:** halaman memanggil `router.reload({ only: [...] })` setiap 10 detik (lihat
`resources/js/lib/live.ts` dan prop `live` di `AuthenticatedLayout`). Karena itu props di controller
dibungkus `fn () => ...`, agar polling hanya menjalankan query yang diminta. Tipe TypeScript-nya ada di
[resources/js/types/index.d.ts](../resources/js/types/index.d.ts).

| Endpoint PRD 17 | Route (nama) | Halaman React | Props / body |
| --- | --- | --- | --- |
| – (landing) | `GET /` (`home`) | `Welcome` | `services` |
| `POST /api/login`, `/logout` | `POST /login`, `POST /logout` | `Auth/Login` | `email, password` |
| `GET/PUT /api/profile` | `GET/PATCH /profile` | `Profile/Edit` | `summary` (`memberSince`, `orders`); body `name, email, phone, address` |
| – (foto profil) | `POST/DELETE /profile/avatar`, `GET /avatars/{user}` | `Profile/Edit` | body `avatar` (JPG/PNG/WebP, maks. 2 MB; disimpan 400×400) |
| `PUT /api/profile/password` | `PUT /password` | `Profile/Edit` | `current_password, password, password_confirmation` |
| `GET /api/services` | `GET /services` (`services.index`) | `Services/Index` | `services[]` |
| `GET /api/services/{id}` | `GET /services/{id}` (`services.show`) | `Services/Show` | `service` |
| `POST/PUT/DELETE /api/services` | `/admin/services[/{id}]` (`admin.services.*`) | `Admin/Services/Index` | `services[]` (+`orders_count`); body `name, description, price` |
| – (form pesan) | `GET /orders/create?service=ID` (`orders.create`) | `Orders/Create` | `services[]`, `selectedServiceId` |
| `POST /api/orders` | `POST /orders` (`orders.store`) | – (redirect ke detail) | `service_id, contact_name, contact_phone, location, date (Y-m-d), time (H:i), notes` |
| `GET /api/orders` | `GET /orders` (`orders.index`) | `Orders/Index` | `orders` (paginate) |
| `GET /api/orders/{id}` | `GET /orders/{id}` (`orders.show`) | `Orders/Show` | `order` (+`service`) |
| – (batal) | `PATCH /orders/{id}/cancel` (`orders.cancel`) | – | – |
| `GET /api/admin/orders` | `GET /admin/orders?status=` (`admin.orders.index`) | `Admin/Orders/Index` | `orders`, `filters`, `statuses` |
| `GET /api/admin/orders/{id}` | `GET /admin/orders/{id}` (`admin.orders.show`) | `Admin/Orders/Show` | `order` (+`user`, `service`), `allowedStatuses` |
| `PUT /api/admin/orders/{id}/status` | `PUT /admin/orders/{id}/status` (`admin.orders.status`) | – | `status` |
| – (dashboard) | `GET /dashboard`, `GET /admin/dashboard` | `Dashboard`, `Admin/Dashboard` | `stats`, `latestOrders`, `schedule`; user: `upcomingOrders`; admin: `pendingOrders` |

Setiap `order` berisi `status` (mis. `"diproses"`) dan `status_label` (mis. `"Diproses"`).

### Daftar halaman untuk FE

Semua halaman di PRD 6 sudah ada, tersambung ke backend, dan memakai desain eco-modern
(lihat [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)). Tim FE/UI-UX bebas menyesuaikan dengan Figma. **Aturannya:** jangan ganti nama/lokasi file, nama props, dan nama
field form. Yang diubah cukup tampilannya. Jika perlu data tambahan, minta ke BE.

| Area | Halaman (PRD) | File di `resources/js/Pages/` | Status |
| --- | --- | --- | --- |
| Publik | Landing Page | `Welcome.tsx` | ✅ Konten Reuben, desain eco-modern + data layanan asli |
| Publik | Login | `Auth/Login.tsx` | ✅ Desain eco-modern (Indonesia) |
| Publik | Register | `Auth/Register.tsx` | ✅ Desain eco-modern, ada input telepon |
| Publik | Lupa / reset password | `Auth/ForgotPassword.tsx`, `Auth/ResetPassword.tsx` | ✅ Desain eco-modern |
| Semua | Halaman error 403/404/500/503 | `Error.tsx` | ✅ Desain eco-modern |
| User | Dashboard | `Dashboard.tsx` | ✅ Desain eco-modern |
| User | Pesan Layanan: pilih layanan | `Services/Index.tsx`, `Services/Show.tsx` | ✅ Desain eco-modern |
| User | Pesan Layanan: form | `Orders/Create.tsx` | ✅ Desain eco-modern |
| User | Pesanan Saya: daftar & detail | `Orders/Index.tsx`, `Orders/Show.tsx` | ✅ Desain eco-modern |
| User & Admin | Profil Saya + ubah password | `Profile/Edit.tsx` + `Profile/Partials/*` | ✅ Desain eco-modern |
| Admin | Dashboard Admin | `Admin/Dashboard.tsx` | ✅ Desain eco-modern |
| Admin | Kelola Pesanan: daftar & detail | `Admin/Orders/Index.tsx`, `Admin/Orders/Show.tsx` | ✅ Desain eco-modern |
| Admin | Kelola Layanan (tambah/ubah/hapus) | `Admin/Services/Index.tsx` | ✅ Desain eco-modern |
| User | Pembayaran (dummy) | `Payments/Show.tsx` | ✅ Desain eco-modern |
| User | Helpdesk (chat dengan admin) | `Helpdesk/Index.tsx` | ✅ Desain kaca |
| Admin | Helpdesk (daftar & balas chat) | `Admin/Helpdesk/Index.tsx` | ✅ Desain kaca |
| Layout | Navbar setelah login (menu per role) | `Layouts/AuthenticatedLayout.tsx` | ✅ Desain eco-modern |

Komponen pembantu yang bisa dipakai ulang: `Components/StatusBadge.tsx` (warna status pesanan),
`Components/FlashMessage.tsx` (pesan sukses/error, sudah otomatis tampil di layout),
`Components/Pagination.tsx`, dan `lib/format.ts` (`formatRupiah`, `formatDate`, `formatTime`).

Catatan untuk FE: landing page (`Welcome.tsx`) sudah memakai props `services` dari database;
jika database kosong, tampil daftar layanan contoh.

---

## 6. Menjalankan di lokal

```powershell
# Sekali saja (anggota baru)
composer install
npm install
copy .env.example .env
php artisan key:generate
# buat database `aistell_db` di HeidiSQL/phpMyAdmin Laragon

# Buat tabel + data demo (HATI-HATI: menghapus semua data lokal)
php artisan migrate:fresh --seed

# Jalankan (otomatis menjalankan migrasi baru, lalu server + Vite)
composer dev             # atau manual: php artisan migrate  →  php artisan serve  +  npm run dev
```

Akun demo (password `password`):

| Email | Role |
| --- | --- |
| `admin@aistel.test` | admin |
| `user@aistel.test` | user (punya 5 pesanan contoh, 1 per status) |
| `user2@aistel.test` | user (1 pesanan; untuk mengetes bahwa user tidak bisa melihat pesanan orang lain) |

Jika akun hilang, jalankan `php artisan db:seed`. Perintah ini aman diulang (tidak membuat data
dobel) dan tidak menghapus data lain. Password admin bisa diganti lewat `ADMIN_PASSWORD` di `.env`.

### Skenario uji manual (PRD 14)

1. Login `user@aistel.test` → Pesan Layanan → pilih layanan → isi form → Kirim.
2. Pesanan muncul di Pesanan Saya dengan status **Menunggu**.
3. Logout, login `admin@aistel.test` → Kelola Pesanan → buka pesanan tadi → **Terima**.
4. Ubah lagi menjadi **Selesai**.
5. Login kembali sebagai user → status pesanan sekarang **Selesai**.
6. Coba buka `/admin/orders` sebagai user → muncul 403.

### Perintah yang sering dipakai

| Perintah | Kegunaan |
| --- | --- |
| `php artisan route:list --except-vendor` | Melihat semua route |
| `php artisan migrate` | Menjalankan migrasi baru (wajib setelah `git pull` yang membawa migrasi) |
| `php artisan migrate:status` | Mengecek migrasi yang belum dijalankan (`Pending`) |
| `php artisan migrate:fresh --seed` | Reset database + data demo |
| `php artisan tinker` | Mencoba query, mis. `App\Models\User::first()->orders` |
| `php artisan test` | Menjalankan semua test |
| `php artisan test --filter=OrderTest` | Menjalankan satu file test |
| `vendor/bin/pint` | Merapikan format kode PHP |

---

## 7. Test (PRD 14)

Test memakai SQLite di memori (lihat `phpunit.xml`), jadi database MySQL lokal tidak tersentuh.

| Kriteria PRD 14 | Test |
| --- | --- |
| User dapat login | `AuthenticationTest`, `DashboardTest` (redirect admin) |
| User dapat melihat layanan | `ServiceTest` |
| User dapat mengajukan pesanan | `OrderTest › user dapat mengajukan pesanan…` |
| Pesanan dapat dilihat Admin | `AdminOrderTest › pesanan user dapat dilihat oleh admin` |
| Admin menerima / menolak | `AdminOrderTest › admin dapat menerima / menolak pesanan` |
| Admin memperbarui status | `AdminOrderTest › …selesai dan user melihat perubahannya` |
| User melihat perubahan status | idem |

Ditambah test keamanan: user tidak bisa melihat pesanan orang lain, tidak bisa membuka halaman
admin, tidak bisa menyelipkan `role=admin` / `user_id` / `status` lewat form, dan transisi status
ilegal ditolak.

---

## 8. Fase 11 - Deploy

Panduan lengkap, daftar periksa, dan pilihan hosting: **[DEPLOY.md](DEPLOY.md)** (contoh env:
`.env.production.example`). Ringkasnya:

```bash
# .env production: APP_ENV=production, APP_DEBUG=false, DB_*, ADMIN_EMAIL, ADMIN_PASSWORD
composer install --no-dev --optimize-autoloader
php artisan key:generate          # hanya pertama kali
php artisan migrate --force
php artisan db:seed --class=AdminSeeder --force
php artisan db:seed --class=ServiceSeeder --force   # opsional: layanan awal
npm ci && npm run build
php artisan config:cache && php artisan route:cache && php artisan view:cache
```

`AdminSeeder` menolak berjalan di production jika `ADMIN_PASSWORD` kosong. Jangan jalankan
`DatabaseSeeder` / `migrate:fresh` di production.

## 9. Pengembangan berikutnya (di luar MVP)

Mengikuti PRD 10, fitur berikut belum dibuat: pembayaran online sungguhan (saat ini dummy), Google Login,
Google Maps, rating, promo, dan notifikasi push/email. Chat (Helpdesk) sudah ada dengan polling; untuk
WebSocket sungguhan bisa memakai Laravel Reverb. Ide kecil yang bisa ditambahkan: kolom `is_active` di
`services` (menyembunyikan layanan tanpa menghapusnya), dan riwayat perubahan status
(tabel `order_status_logs`).
