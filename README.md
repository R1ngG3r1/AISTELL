# Project Scaffolding - Laravel 11 + React (Inertia.js) Modular Monolith

Project web berbasis **Modular Monolith** yang menggabungkan kepraktisan **Laravel 11** dan keandalan **React 18 (TypeScript)** melalui **Inertia.js**. Dirancang khusus untuk tim kecil dengan pembagian kerja Frontend dan Backend yang terpisah tanpa *over-engineering*.

---

## 🏗️ Stack Teknologi

- **Backend Framework**: PHP 8.2+ / Laravel 11
- **Starter Kit / Auth**: Laravel Breeze (Inertia React + TypeScript preset)
- **FE-BE Integration**: Inertia.js Server Adapter + Ziggy (`ziggy-js` & `tightenco/ziggy`)
- **Frontend Framework**: React 18 + TypeScript (`.tsx`)
- **Build Tool & PM**: Vite + NPM
- **Styling**: Tailwind CSS v3 + `@tailwindcss/forms`
- **Form & Validation**: React Hook Form + Zod schema validation
- **Testing & Formatting**: Pest PHP + Laravel Pint

---

## 📦 Struktur Arsitektur Project

### Backend: Modular Monolith (`app/Modules/`)
Setiap domain/modul bisnis berada terisolasi di dalam `app/Modules/`:

```
app/
├── Modules/
│   ├── User/                         # Modul Contoh (Reference Pattern)
│   │   ├── Controllers/
│   │   │   └── UserController.php    # Modul Controller
│   │   ├── Models/
│   │   │   └── UserModel.php         # Modul Eloquent Model
│   │   ├── Services/
│   │   │   └── UserService.php       # Business Logic / Service Layer
│   │   ├── Providers/
│   │   │   └── UserServiceProvider.php # Modul Service Provider
│   │   └── Routes/
│   │       └── web.php               # Modul Web Routes
│   └── Auth/                         # Modul Auth Placeholder
└── Providers/
    └── ModuleServiceProvider.php     # Dynamic Loader untuk seluruh modul di app/Modules/
```

### Frontend (`resources/js/`)
```
resources/js/
├── Components/                       # Komponen UI Reusable (Tailwind CSS)
├── Layouts/                          # Layout Utama (AuthenticatedLayout, GuestLayout)
├── Pages/                            # Halaman Inertia (.tsx)
│   ├── Auth/                         # Halaman Login/Register/Password Breeze
│   ├── User/                         # Halaman Modul User (Index.tsx)
│   └── Dashboard.tsx
└── types/                            # Definitions TypeScript (index.d.ts, global.d.ts)
```

---

## 🚀 Panduan Instalasi (Step-by-Step)

Ikuti langkah-langkah di bawah ini untuk menjalankan project di lingkungan lokal dari nol:

### 1. Prasyarat Sistem
Pastikan perangkat Anda sudah terinstall:
- PHP >= 8.2
- Composer >= 2.0
- Node.js >= 18.0 (NPM sudah bawaan Node.js)

### 2. Clone Repository & Install Dependensi
```bash
# 1. Clone repository ini
git clone https://github.com/R1ngG3r1/AISTELL.git
cd AISTELL

# 2. Install dependensi Backend (PHP / Composer)
composer install

# 3. Install dependensi Frontend (Node / NPM)
npm install
```

### 3. Konfigurasi Environment & Database
```bash
# 4. Salin file environment contoh
cp .env.example .env

# 5. Generate Application Key
php artisan key:generate
```

Buka file `.env` dan atur koneksi database sesuai pilihan Anda:

- **Option A: PostgreSQL (Default / Neon Compatible)**
  ```env
  DB_CONNECTION=pgsql
  DB_HOST=127.0.0.1
  DB_PORT=5432
  DB_DATABASE=nama_database
  DB_USERNAME=postgres
  DB_PASSWORD=secret
  ```

- **Option B: MySQL (Switch lokal)**
  ```env
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=nama_database
  DB_USERNAME=root
  DB_PASSWORD=
  ```

- **Option C: SQLite (Quick Dev)**
  ```env
  DB_CONNECTION=sqlite
  ```
  *(Buat file kosong di `database/database.sqlite` jika menggunakan SQLite)*.

### 4. Jalankan Migrasi Database
```bash
php artisan migrate
```

### 5. Jalankan Development Server
Buka 2 terminal terpisah atau jalankan secara paralel:

```bash
# Terminal 1: Backend Laravel Server
php artisan serve

# Terminal 2: Frontend Vite Asset Server
npm run dev
```

Buka browser di `http://localhost:8000`.

---

## 🧪 Testing & Code Style

### Pest PHP Testing
```bash
php artisan test
# Atau
./vendor/bin/pest
```

### Laravel Pint (Code Formatter)
```bash
# Pengecekan code style
./vendor/bin/pint --test

# Memperbaiki otomatis code style
./vendor/bin/pint
```

### Build Production Asset
```bash
npm run build
```

---

## 💡 Panduan Pembagian Kerja Tim (FE & BE)

1. **Pengembang Backend (BE)**:
   - Tambahkan folder modul baru di dalam `app/Modules/{NamaModul}/`.
   - Buat `Controllers/`, `Models/`, `Services/`, `Providers/`, dan `Routes/web.php` di dalam modul tersebut.
   - Panggil halaman Inertia dari Controller dengan `Inertia::render('{NamaModul}/Index', $props)`.

2. **Pengembang Frontend (FE)**:
   - Buat halaman komponen React di `resources/js/Pages/{NamaModul}/`.
   - Gunakan `route('nama.route')` dari Ziggy untuk memanggil rute Laravel secara akurat di JavaScript/TypeScript.
   - Gunakan `React Hook Form` + `Zod` untuk form dan validasi input.
