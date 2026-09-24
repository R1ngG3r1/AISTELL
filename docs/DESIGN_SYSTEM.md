# Design System AISTEL: Eco-modern

Panduan untuk tim FE & UI/UX. Semua halaman memakai sistem ini, jadi **mengubah satu token
di sini mengubah seluruh aplikasi**. Kalau desain Figma berbeda, sesuaikan dari tempat yang
tertulis di kolom "Ubah di".

## 1. Token

| Token | Nilai | Dipakai untuk | Ubah di |
| --- | --- | --- | --- |
| `forest-900` | `#072d23` | Teks utama, tombol utama, section gelap | `tailwind.config.js` → `colors.forest` |
| `forest-500` | `#328e67` | Warna primer, link, eyebrow | idem |
| `forest-50…950` | skala | Latar lembut, border, hover | idem |
| `leaf-400` | `#b4d96f` | Aksen: tombol di atas latar gelap, highlight | `colors.leaf` |
| `cream` | `#f7f8f3` | Latar halaman | `colors.cream` |
| `sand-100/200` | `#f3f0e6` / `#ece8da` | Section selang-seling, state netral | `colors.sand` |
| `sun-*` | kuning | Status **Menunggu** | `colors.sun` |
| `clay-*` | oranye-bata | Error, tombol hapus/tolak, status **Ditolak** | `colors.clay` |
| Font judul | **Fraunces** (serif organik) | Kelas `display` / `font-display` | `tailwind.config.js` + link font di `resources/views/app.blade.php` |
| Font teks | **Plus Jakarta Sans** | Semua teks | idem |
| Radius | `rounded-2xl` input, `rounded-3xl/4xl` kartu, `rounded-full` tombol | | `borderRadius` |
| Bayangan | `shadow-soft`, `shadow-lift` (hover) | | `boxShadow` |

Warna dasar diambil dari landing page awal buatan Reuben, lalu dibuat menjadi skala.

## 2. Kelas komponen (`resources/css/app.css`)

| Kelas | Hasil |
| --- | --- |
| `btn-primary` | Tombol hijau gelap (aksi utama) |
| `btn-leaf` | Tombol lime (aksi utama di atas latar gelap) |
| `btn-ghost` | Tombol putih bergaris (aksi sekunder) |
| `btn-danger` | Tombol hapus/tolak |
| `btn-sm` / `btn-lg` | Ukuran tombol |
| `card`, `card-hover` | Kartu putih semi-transparan + efek angkat saat hover |
| `input`, `label` | Field form |
| `eyebrow` | Label kecil huruf kapital di atas judul |
| `display` | Judul memakai font Fraunces |
| `table-eco` | Tabel admin |
| `grain`, `dots` | Tekstur latar dekoratif |

Komponen Breeze (`PrimaryButton`, `TextInput`, `Modal`, dll.) sudah memakai kelas di atas,
jadi props lamanya tetap berlaku.

## 3. Komponen eco (`resources/js/Components/eco/`)

| Komponen | Fungsi |
| --- | --- |
| `Illustrations.tsx` | Aset SVG: `Leaf`, `LogoMark`, `Blob`, `FloatingLeaves`, `Wave`, `HeroScene` (lanskap parallax berlapis), `Sprout` (pot tanaman untuk empty state/error) |
| `PageHeader` | Judul halaman: eyebrow + judul + deskripsi + tombol aksi |
| `StatCard` | Kartu statistik dengan angka count-up |
| `EmptyState` | Tampilan saat data kosong |
| `ConfirmModal` | Dialog konfirmasi (pengganti `window.confirm`) |
| `OrderTimeline` | Progres status pesanan |
| `ServiceIcon` | Ikon layanan otomatis dari nama layanan |
| `Avatar` | Inisial nama |
| `PasswordInput` | Input password + tombol lihat |

Aset gambar asli (foto/ilustrasi dari Figma) bisa diletakkan di `public/images/` lalu dipanggil
`<img src="/images/nama.png">`. Contohnya untuk mengganti `HeroScene` di landing page.

## 4. Animasi (`resources/js/lib/motion.tsx`)

| API | Contoh |
| --- | --- |
| `<Reveal variant="up|left|right|scale" delay={100}>` | Muncul halus saat di-scroll |
| `<Parallax speed={0.2}>` / `useParallax()` | Bergerak lebih lambat dari scroll (kedalaman). Pergeseran dibatasi ±90px |
| `<CountUp value="500+" />` | Angka menghitung naik saat terlihat |
| `usePointerTilt()` | Elemen mengikuti kursor (hero landing) |
| `useScrolled()` | Navbar berubah saat halaman di-scroll |
| Kelas Tailwind | `animate-float`, `animate-sway`, `animate-drift`, `animate-marquee`, `animate-blob`, `animate-fade-up`, `animate-scale-in`, `animate-grow` |

Semua animasi otomatis mati jika pengguna mengaktifkan *reduce motion* di sistem operasinya.

## 5. Aturan saat redesain

- Boleh mengubah tampilan apa pun. **Jangan ubah** nama file halaman, nama props, nama field
  form, atau nama route (lihat [BACKEND_ROADMAP.md](BACKEND_ROADMAP.md#5-kontrak-data-untuk-frontend)).
- Warna status pesanan harus konsisten: Menunggu = sun, Diproses = forest, Selesai = leaf,
  Ditolak = clay, Dibatalkan = sand (`Components/StatusBadge.tsx`).
- Cek hasil di lebar HP (±390px) dan desktop (≥1280px).
