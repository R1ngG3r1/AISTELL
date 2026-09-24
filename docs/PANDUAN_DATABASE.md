# Panduan Mengelola Database & Akun AISTEL

Panduan praktis untuk backend: melihat data, menambah admin, mengelola user, layanan, pesanan,
backup, dan reset. Semua perintah dijalankan dari folder project.

> **Terminal:** pakai terminal Laragon (tombol *Terminal*) agar `php` dan `mysql` langsung dikenali.
> Di terminal VS Code biasa, `php` baru dikenali jika folder PHP Laragon sudah masuk ke PATH.

---

## 0. Kenali datanya dulu

| Tabel | Isi | Catatan penting |
| --- | --- | --- |
| `users` | Akun user & admin | Kolom `role` = `user` / `admin`. Kolom `password` berisi **hash**, bukan teks asli |
| `services` | Layanan kebersihan | Tidak bisa dihapus jika sudah pernah dipesan |
| `orders` | Pesanan | `status`: `menunggu`, `diproses`, `selesai`, `ditolak`, `dibatalkan` |
| `sessions` | Sesi login yang aktif | Boleh dikosongkan: semua orang akan ter-logout |
| `migrations` | Catatan migrasi yang sudah dijalankan | **Jangan diedit manual** |

Ada 4 cara mengelola data. Urutan di bawah ini dari yang paling aman:

| Cara | Cocok untuk | Keamanan |
| --- | --- | --- |
| **A. Website** (login admin) | Layanan & pesanan sehari-hari | Paling aman: ada validasi & aturan status |
| **B. Perintah `aistel:*`** | Akun: tambah admin, ubah role, reset password | Aman: password otomatis di-hash |
| **C. Tinker** | Hal khusus yang belum ada menunya | Hati-hati: langsung ke database |
| **D. HeidiSQL** | Melihat isi tabel, backup | Paling berisiko untuk mengedit: tanpa validasi |

---

## 1. Melihat data

### Lewat perintah

```bash
php artisan aistel:users               # semua akun
php artisan aistel:users --role=admin  # admin saja
```

### Lewat HeidiSQL (tampilan seperti Excel)

1. Laragon → tombol **Database** → HeidiSQL terbuka.
2. Klik koneksi (biasanya `Laragon.MySQL`) → **Open**.
3. Di panel kiri pilih database **`aistell_db`** → klik tabel (mis. `users`) → tab **Data**.

Tab **Query** bisa dipakai untuk menjalankan SQL, contoh:

```sql
SELECT id, name, email, role FROM users;
SELECT status, COUNT(*) FROM orders GROUP BY status;
```

---

## 2. Menambah akun ADMIN (manual)

### Cara 1: perintah `aistel:create-admin` (disarankan)

```bash
php artisan aistel:create-admin
```

Kamu akan ditanya email, nama, dan password (password tidak terlihat saat diketik: itu normal).
Hasilnya:

```
 Email admin:
 > budi@aistel.id
 Nama admin [Admin AISTEL]:
 > Budi
 Password (minimal 8 karakter, tidak terlihat saat diketik):
 >
 Admin budi@aistel.id berhasil dibuat. Silakan login di /login.
```

Versi satu baris (tanpa pertanyaan):

```bash
php artisan aistel:create-admin budi@aistel.id --name="Budi" --password="rahasia123"
```

### Cara 2: jadikan akun yang sudah ada sebagai admin

Orangnya **Register** dulu di website (otomatis menjadi user), lalu:

```bash
php artisan aistel:set-role budi@aistel.id admin
```

Kelebihannya: orang itu memilih password sendiri, jadi kamu tidak perlu tahu password-nya.

### Cara 3: lewat Tinker

```bash
php artisan tinker
```

Lalu ketik (tekan Enter setiap baris):

```php
$u = new App\Models\User(['name' => 'Budi', 'email' => 'budi@aistel.id', 'password' => 'rahasia123']);
$u->role = 'admin';
$u->email_verified_at = now();
$u->save();
exit
```

`role` harus diisi terpisah (`$u->role = ...`) karena sengaja tidak termasuk kolom yang boleh diisi
lewat form (`$fillable`). Password otomatis di-hash oleh model.

### Cara 4: lewat HeidiSQL (hanya mengubah role)

Mengubah role akun yang sudah ada aman dilakukan lewat HeidiSQL: buka tabel `users` → klik dua kali
sel `role` → pilih `admin` → tekan **Ctrl+S** (atau tombol ✓ *Post*).

Atau lewat tab Query:

```sql
UPDATE users SET role = 'admin' WHERE email = 'budi@aistel.id';
```

> ⚠️ **Jangan membuat akun baru dengan INSERT di HeidiSQL** lalu mengetik password biasa di kolom
> `password`. Login pasti gagal karena Laravel mencocokkan password dengan **hash**. Jika terpaksa,
> buat hash-nya dulu: jalankan `php artisan tinker`, ketik `bcrypt('rahasia123')`, lalu salin hasilnya
> (`$2y$12$...`) ke kolom password.

### Cara 5: admin utama lewat `.env` (untuk server/production)

Isi `.env`:

```env
ADMIN_EMAIL=admin@aistel.id
ADMIN_PASSWORD=PasswordYangKuat123
```

Lalu jalankan:

```bash
php artisan db:seed --class=AdminSeeder
```

Jika email tersebut sudah ada, password dan role-nya diperbarui. Jika belum ada, akun baru dibuat.

---

## 3. Mengelola akun USER

| Kebutuhan | Perintah |
| --- | --- |
| Membuat akun user | Suruh orangnya **Register** di `/register` |
| Mengganti password (user lupa) | `php artisan aistel:reset-password budi@aistel.id` |
| Menurunkan admin menjadi user | `php artisan aistel:set-role budi@aistel.id user` |
| Melihat pesanan milik user | Login admin → Kelola Pesanan, atau Tinker (di bawah) |

`aistel:set-role` menolak menurunkan **admin terakhir**, supaya sistem tidak pernah kehilangan admin.

### Menghapus akun (Tinker)

```php
App\Models\User::where('email', 'budi@aistel.id')->first()->delete();
```

> ⚠️ **Semua pesanan milik user itu ikut terhapus** (foreign key `cascadeOnDelete`). Pastikan
> memang itu yang diinginkan. User biasa juga bisa menghapus akunnya sendiri dari halaman Profil.

### Membuat akun user manual (Tinker)

```php
App\Models\User::create(['name' => 'Siti', 'email' => 'siti@contoh.com', 'phone' => '0812...', 'password' => 'rahasia123']);
```

Role otomatis `user`.

---

## 4. Mengelola LAYANAN & PESANAN

Untuk pekerjaan sehari-hari, **pakai website sebagai admin**: menu **Kelola Layanan** dan
**Kelola Pesanan**. Di sana sudah ada validasi dan aturan status.

Jika perlu lewat Tinker:

```php
use App\Modules\Service\Models\Service;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Enums\OrderStatus;

// Layanan
Service::all(['id', 'name', 'price']);
Service::create(['name' => 'Cuci Karpet', 'description' => 'Karpet bersih & wangi', 'price' => 80000]);
Service::find(3)->update(['price' => 90000]);

// Pesanan
Order::where('status', 'menunggu')->count();
Order::with('user', 'service')->latest()->take(5)->get();

// Ubah status lewat OrderService agar aturan transisi tetap dicek:
app(App\Modules\Order\Services\OrderService::class)->changeStatus(Order::find(7), OrderStatus::Diproses);
```

Hindari `UPDATE orders SET status = ...` langsung di HeidiSQL: aturan transisi status tidak akan dicek.

---

## 5. Data awal & reset

| Perintah | Efek | Kapan |
| --- | --- | --- |
| `php artisan db:seed` | Membuat admin/user demo, layanan awal, pesanan contoh **jika belum ada**. Tidak menghapus apa pun | Akun demo hilang, database baru |
| `php artisan db:seed --class=ServiceSeeder` | Hanya layanan awal | Layanan contoh terhapus |
| `php artisan migrate` | Menjalankan migrasi baru saja | Setelah `git pull` |
| `php artisan migrate:fresh --seed` | ⚠️ **Hapus semua tabel**, buat ulang, isi data demo | Database lokal berantakan |

> **Jangan pernah** menjalankan `migrate:fresh` di server/production.

---

## 6. Backup & restore

### Backup (sebelum melakukan hal berisiko)

```bash
mysqldump -u root aistell_db > backup_aistel_2026-09-24.sql
```

Atau di HeidiSQL: klik kanan `aistell_db` → **Export database as SQL** → centang *Create* +
*Data: Insert* → Export.

### Restore

```bash
mysql -u root aistell_db < backup_aistel_2026-09-24.sql
```

Atau di HeidiSQL: menu **File → Run SQL file…** → pilih file backup.

> File backup berisi email & hash password. **Jangan di-commit ke Git** dan jangan dibagikan.

---

## 7. Mengubah struktur tabel (menambah kolom, dsb.)

**Jangan** menambah kolom lewat HeidiSQL: anggota tim lain tidak akan mendapat perubahannya.
Selalu lewat migrasi:

```bash
php artisan make:migration add_is_active_to_services_table --table=services
```

Edit file baru di `database/migrations/`, lalu:

```bash
php artisan migrate            # jalankan
php artisan migrate:rollback   # batalkan migrasi terakhir (jika salah)
```

Commit file migrasinya. Setelah pull, anggota tim cukup menjalankan `php artisan migrate`.

---

## 8. Contekan Tinker

Masuk: `php artisan tinker`. Keluar: `exit`.

```php
App\Models\User::count();                                   // jumlah akun
App\Models\User::where('role', 'admin')->pluck('email');    // email semua admin
App\Models\User::firstWhere('email', 'user@aistel.test')->orders()->count();
App\Modules\Service\Models\Service::withCount('orders')->get(['id', 'name']);
app(App\Modules\Order\Services\OrderService::class)->statusCounts();   // ringkasan status
```

---

## Ringkasan cepat

```bash
php artisan aistel:users                                  # lihat akun
php artisan aistel:create-admin                           # tambah admin baru
php artisan aistel:set-role email@contoh.com admin        # user → admin
php artisan aistel:set-role email@contoh.com user         # admin → user
php artisan aistel:reset-password email@contoh.com        # ganti password
php artisan db:seed                                       # pulihkan akun demo
mysqldump -u root aistell_db > backup.sql                 # backup
```
