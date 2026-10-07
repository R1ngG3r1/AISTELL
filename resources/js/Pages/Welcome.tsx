import { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faLeaf,
    faRecycle,
    faShieldHalved,
    faClipboardCheck,
    faUsers,
    faLock,
    faBolt,
    faSeedling,
    faCircleCheck,
    faClock,
    faCheck,
    faArrowsRotate,
} from "@fortawesome/free-solid-svg-icons";
import { Service, User } from "@/types";

// Logo semanggi empat daun AISTEL
function AistelLogo({ className = "logo-svg" }: { className?: string }) {
    return <img src="/landingpage/LOGO.png" alt="" aria-hidden="true" className={className} />;
}

interface WelcomeProps {
    auth?: {
        user?: User | null;
    };
    services?: Service[];
    canLogin?: boolean;
    canRegister?: boolean;
}

export default function Welcome({ auth, services = [] }: WelcomeProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getServiceIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes("rumah") || lower.includes("hunian") || lower.includes("gedung")) return faHouse;
        if (lower.includes("rumput") || lower.includes("taman") || lower.includes("tanaman")) return faLeaf;
        if (lower.includes("sampah")) return faRecycle;
        if (lower.includes("selokan") || lower.includes("sanitasi") || lower.includes("steril")) return faShieldHalved;
        if (lower.includes("rt") || lower.includes("rw") || lower.includes("lingkungan") || lower.includes("warga")) return faUsers;
        return faSeedling;
    };

    const displayServices: Service[] = (services && services.length > 0)
        ? services
        : [
            {
                id: 1,
                name: "Kebersihan Hunian",
                description: "Layanan pembersihan rumah, apartemen, dan properti hunian secara menyeluruh dan profesional.",
                price: "150000.00",
            },
            {
                id: 2,
                name: "Perawatan Tanaman",
                description: "Perawatan taman, pemangkasan tanaman, dan penghijauan lingkungan sekitar Anda.",
                price: "120000.00",
            },
            {
                id: 3,
                name: "Pengelolaan Sampah",
                description: "Pengangkutan dan pemilahan sampah secara terjadwal dan bertanggung jawab.",
                price: "75000.00",
            },
            {
                id: 4,
                name: "Sanitasi Lingkungan",
                description: "Sterilisasi dan desinfeksi area lingkungan untuk kehidupan yang lebih sehat.",
                price: "100000.00",
            },
        ];

    const stats = [
        { value: "500+", label: "Layanan Selesai" },
        { value: "50+", label: "Area Terlayani" },
        { value: "98%", label: "Tingkat Kepuasan" },
        { value: `${displayServices.length}`, label: "Jenis Layanan" },
    ];

    const dashboardHref = auth?.user
        ? (auth.user.role === 'admin' ? route("admin.dashboard") : route("dashboard"))
        : route("login");

    const challenges = [
        {
            title: "Kesibukan Sehari-hari",
            description: "Rutinitas padat membuat masyarakat sulit meluangkan waktu untuk membersihkan dan merawat lingkungan sekitar.",
        },
        {
            title: "Kurang Tenaga Profesional",
            description: "Tidak semua orang memiliki akses ke layanan kebersihan yang terpercaya, terlatih, dan mudah dijangkau.",
        },
        {
            title: "Lingkungan Terbengkalai",
            description: "Ketidakhadiran perawatan rutin menyebabkan lingkungan kotor, tidak nyaman, dan berpotensi menimbulkan penyakit.",
        },
        {
            title: "Proses Pemesanan Rumit",
            description: "Mencari dan menghubungi jasa kebersihan satu per satu membutuhkan waktu dan effort yang tidak sedikit.",
        },
    ];

    const caraKerja = [
        {
            step: "01",
            title: "Pilih Layanan",
            description: "Pilih jenis layanan kebersihan yang sesuai kebutuhan lingkungan Anda.",
        },
        {
            step: "02",
            title: "Isi Formulir",
            description: "Lengkapi detail pemesanan: lokasi, tanggal, waktu, dan catatan khusus.",
        },
        {
            step: "03",
            title: "Kirim Pesanan",
            description: "Pesanan dikirim ke tim kami dan diproses dengan cepat.",
        },
        {
            step: "04",
            title: "Layanan Selesai",
            description: "Tim profesional kami menyelesaikan pekerjaan dan dapat dipantau statusnya.",
        },
    ];

    const keunggulan = [
        {
            icon: faLeaf,
            title: "Pemesanan Mudah",
            description: "Ajukan layanan kebersihan hanya dalam beberapa langkah tanpa kerumitan.",
        },
        {
            icon: faClipboardCheck,
            title: "Pantau Status Realtime",
            description: "Lacak perkembangan pesanan Anda dari pemesanan hingga selesai secara langsung.",
        },
        {
            icon: faUsers,
            title: "Tim Profesional",
            description: "Ditangani oleh tenaga terlatih yang berpengalaman di bidang kebersihan lingkungan.",
        },
        {
            icon: faLock,
            title: "Aman & Terpercaya",
            description: "Sistem terverifikasi dengan proses pemesanan yang terstandarisasi.",
        },
        {
            icon: faBolt,
            title: "Respons Cepat",
            description: "Admin memproses pesanan dengan cepat sehingga layanan bisa segera dijadwalkan.",
        },
        {
            icon: faSeedling,
            title: "Ramah Lingkungan",
            description: "Pendekatan berkelanjutan yang menggunakan metode dan material ramah lingkungan.",
        },
    ];

    const tentangKami = {
        title: "Mendorong Gaya Hidup",
        highlight: "Bersih & Berkelanjutan",
        description:
            "AISTEL hadir karena kami percaya bahwa lingkungan yang bersih adalah hak setiap orang. Kami mempertemukan masyarakat dengan tim kebersihan profesional melalui platform digital yang intuitif dan terpercaya.",
        points: [
            "Lingkungan bersih dan nyaman untuk seluruh masyarakat",
            "Waktu Anda lebih efisien tanpa mengorbankan kualitas hidup",
            "Mendorong gaya hidup berkelanjutan dan ramah lingkungan",
            "Membuka peluang kerja bagi tenaga kebersihan profesional",
        ],
    };

    return (
        <div className="home-wrapper">
            <Head title="AISTEL - Solusi Kebersihan Lingkungan Modern" />

            {/* FIRST SCREEN FOLD: NAVBAR + HERO + STATS */}
            <div className="hero-fold-wrapper">
                {/* Header / Navbar */}
                <header className="navbar-container">
                    <nav className="navbar" aria-label="Main Navigation">
                        <a href="#beranda" className="logo" id="nav-logo">
                            <AistelLogo className="logo-svg" />
                            <span className="logo-text">AISTEL</span>
                        </a>

                        <div className="nav-links">
                            <a href="#beranda" className="nav-link">Beranda</a>
                            <a href="#layanan" className="nav-link">Layanan</a>
                            <a href="#tentang" className="nav-link">Tentang Kami</a>
                            <a href="#kontak" className="nav-link">Kontak</a>
                        </div>

                        <div className="nav-action">
                            <Link
                                href={dashboardHref}
                                className="login-btn"
                                id="nav-login-btn"
                            >
                                {auth?.user ? (auth.user.role === 'admin' ? "Dashboard Admin" : "Dashboard") : "Masuk / Daftar"}
                            </Link>

                            <button
                                type="button"
                                className="mobile-toggle-btn"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Toggle Navigation Menu"
                                aria-expanded={isMenuOpen}
                            >
                                <span className="bar"></span>
                                <span className="bar"></span>
                                <span className="bar"></span>
                            </button>
                        </div>
                    </nav>

                    {/* Mobile Menu Dropdown */}
                    {isMenuOpen && (
                        <div className="mobile-menu-overlay">
                            <div className="mobile-menu-container">
                                <a href="#beranda" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                                    Beranda
                                </a>
                                <a href="#layanan" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                                    Layanan
                                </a>
                                <a href="#tentang" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                                    Tentang Kami
                                </a>
                                <a href="#kontak" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                                    Kontak
                                </a>
                                <Link
                                    href={dashboardHref}
                                    className="mobile-login-btn"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {auth?.user ? (auth.user.role === 'admin' ? "Dashboard Admin" : "Dashboard") : "Masuk / Daftar"}
                                </Link>
                            </div>
                        </div>
                    )}
                </header>

                {/* Hero Section */}
                <section className="hero-section" id="beranda">
                    <div className="hero-container">
                        <div className="hero-text-content">
                            <div className="hero-badge" id="hero-badge">
                                # AWARENESS INITIATIVE FOR SUSTAINABLE ENVIRONMENT & LIVING
                            </div>

                            <h1 className="hero-title">
                                CLEAN SPACE.
                                <br />
                                BETTER <span className="hero-title-accent">LIVING.</span>
                            </h1>

                            <p className="hero-description">
                                AISTEL menghadirkan layanan kebersihan dan
                                perawatan lingkungan profesional, mudah dipesan, dan
                                terpercaya, langsung dari genggaman Anda.
                            </p>

                            <div className="hero-cta-buttons">
                                <Link
                                    href={auth?.user ? (auth.user.role === 'admin' ? route('admin.dashboard') : route('orders.create')) : route('register')}
                                    className="hero-btn-primary"
                                    id="hero-cta-pesan"
                                >
                                    {auth?.user ? (auth.user.role === 'admin' ? "Ke Dashboard Admin" : "Pesan Layanan") : "Pesan Layanan"}
                                </Link>
                                <a href="#layanan" className="hero-btn-secondary" id="hero-cta-lihat">
                                    Lihat Layanan
                                </a>
                            </div>
                        </div>

                        <div className="hero-image-wrapper">
                            <img
                                src="/landingpage/gambar1.png"
                                alt="AISTEL - Clean Space Better Living"
                                className="hero-image"
                            />
                        </div>
                    </div>
                </section>

                {/* Stats Bar */}
                <section className="stats-bar" aria-label="Statistik AISTEL">
                    <div className="stats-container">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-card">
                                <div className="stat-number">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Tantangan Nyata (Challenges) */}
            <section className="challenges-section" id="tantangan">
                <div className="challenges-container">
                    <div className="section-header-centered">
                        <span className="section-label-light">TANTANGAN NYATA</span>
                        <h2 className="section-heading-dark">
                            Banyak yang peduli lingkungan,
                            <br />
                            <span className="italic-text">tapi kekurangan waktu</span>
                        </h2>
                    </div>

                    <div className="challenges-grid">
                        {challenges.map((item, index) => (
                            <div key={index} className="challenge-card">
                                <div className="challenge-dot"></div>
                                <h3 className="challenge-title">{item.title}</h3>
                                <p className="challenge-description">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Keunggulan Section */}
            <section className="keunggulan-section" id="keunggulan">
                <div className="keunggulan-container">
                    <div className="keunggulan-image-wrapper">
                        <img
                            src="/landingpage/gambar2.png"
                            alt="AISTEL - Keunggulan Platform"
                            className="keunggulan-image"
                        />
                    </div>

                    <div className="keunggulan-head">
                        <span className="section-label-dark">KEUNGGULAN KAMI</span>
                        <h2 className="keunggulan-heading">
                            Semua yang Anda butuhkan
                            <br />
                            dalam satu platform
                        </h2>
                    </div>

                    <div className="keunggulan-grid">
                        {keunggulan.map((item, index) => (
                            <div key={index} className="keunggulan-card">
                                <div className="keunggulan-icon-wrap">
                                    <FontAwesomeIcon icon={item.icon} />
                                </div>
                                <div className="keunggulan-card-text">
                                    <h3 className="keunggulan-card-title">{item.title}</h3>
                                    <p className="keunggulan-card-desc">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Solusi Kebersihan (Services) */}
            <section className="services-section" id="layanan">
                <div className="services-container">
                    <div className="section-header-centered">
                        <span className="section-label-light">LAYANAN KAMI</span>
                        <h2 className="section-heading-dark">
                            Solusi Kebersihan untuk
                            <br />
                            Setiap Kebutuhan Anda
                        </h2>
                        <p className="services-subtitle">
                            Dari hunian pribadi hingga area publik, AISTEL menyediakan
                            <br />
                            layanan lengkap untuk menjaga lingkungan Anda.
                        </p>
                    </div>

                    <div className="services-grid">
                        {displayServices.map((item) => (
                            <Link
                                key={item.id}
                                href={
                                    auth?.user
                                        ? (auth.user.role === 'admin' ? route('admin.services.index') : route('orders.create', { service: item.id }))
                                        : route('login')
                                }
                                className="service-card"
                            >
                                <div className="service-icon-box">
                                    <FontAwesomeIcon icon={getServiceIcon(item.name)} />
                                </div>
                                <h3 className="service-title">{item.name}</h3>
                                <p className="service-description">{item.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cara Kerja */}
            <section className="cara-kerja-section" id="cara-kerja">
                <div className="cara-kerja-container">
                    <div className="section-header-centered">
                        <span className="section-label-dark">CARA KERJA</span>
                        <h2 className="section-heading-light">
                            Empat langkah mudah menuju
                            <br />
                            lingkungan bersih
                        </h2>
                        <p className="cara-kerja-subtitle">
                            Proses yang sederhana dan transparan dari pemesanan
                            <br />
                            hingga layanan selesai.
                        </p>
                    </div>

                    <div className="cara-kerja-grid">
                        {caraKerja.map((item, index) => (
                            <div key={index} className="cara-kerja-step-card">
                                <div className="cara-kerja-step-badge">
                                    {item.step}
                                </div>
                                <div className="cara-kerja-step-text">
                                    <h3 className="cara-kerja-step-title">{item.title}</h3>
                                    <p className="cara-kerja-step-desc">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tentang Kami Section */}
            <section className="tentang-section" id="tentang">
                <div className="tentang-container">
                    {/* Left Column: Text & Checklist */}
                    <div className="tentang-content">
                        <span className="section-label-light">TENTANG KAMI</span>
                        <h2 className="tentang-heading">
                            {tentangKami.title}
                            <br />
                            <span className="italic-text">{tentangKami.highlight}</span>
                        </h2>

                        <p className="tentang-description">
                            {tentangKami.description}
                        </p>

                        <div className="tentang-checklist">
                            {tentangKami.points.map((point, index) => (
                                <div key={index} className="tentang-check-item">
                                    <FontAwesomeIcon icon={faCircleCheck} className="check-icon" />
                                    <span>{point}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Status Cards Container */}
                    <div className="tentang-status-panel">
                        <div className="status-panel-frame">
                            {/* Order 1: Selesai */}
                            <div className="order-status-card">
                                <div className="order-icon-badge order-icon-selesai">
                                    <FontAwesomeIcon icon={faCheck} />
                                </div>
                                <div className="order-details">
                                    <span className="order-number">Pesanan #497</span>
                                    <strong className="order-title">Pembersihan Rumah: Selesai</strong>
                                </div>
                                <span className="status-pill status-pill-selesai">
                                    Selesai
                                </span>
                            </div>

                            {/* Order 2: Diproses */}
                            <div className="order-status-card">
                                <div className="order-icon-badge order-icon-diproses">
                                    <FontAwesomeIcon icon={faArrowsRotate} />
                                </div>
                                <div className="order-details">
                                    <span className="order-number">Pesanan #498</span>
                                    <strong className="order-title">Perawatan Tanaman: Diproses</strong>
                                </div>
                                <span className="status-pill status-pill-diproses">
                                    Diproses
                                </span>
                            </div>

                            {/* Order 3: Menunggu */}
                            <div className="order-status-card">
                                <div className="order-icon-badge order-icon-menunggu">
                                    <FontAwesomeIcon icon={faClock} />
                                </div>
                                <div className="order-details">
                                    <span className="order-number">Pesanan #499</span>
                                    <strong className="order-title">Pengelolaan Sampah: Menunggu</strong>
                                </div>
                                <span className="status-pill status-pill-menunggu">
                                    Menunggu
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-section" id="kontak">
                <div className="footer-top-container">
                    <div className="footer-brand-col">
                        <div className="footer-logo">
                            <AistelLogo className="footer-logo-svg" />
                            <span className="footer-logo-text">AISTEL</span>
                        </div>
                        <p className="footer-brand-desc">
                            Awareness Initiative for Sustainable Environment & Living.
                            Platform layanan kebersihan dan perawatan lingkungan
                            untuk masyarakat modern.
                        </p>
                    </div>

                    <div className="footer-nav-col">
                        <h3 className="footer-col-title">Platform</h3>
                        <ul className="footer-link-list">
                            <li><a href="#beranda">Beranda</a></li>
                            <li><a href="#layanan">Layanan</a></li>
                            <li><a href="#tentang">Tentang Kami</a></li>
                            <li><a href="#kontak">Kontak</a></li>
                        </ul>
                    </div>

                    <div className="footer-contact-col">
                        <h3 className="footer-col-title">Kontak</h3>
                        <div className="footer-contact-info">
                            <p>hello@aistel.id</p>
                            <p>+62 812-3456-7890</p>
                            <p>Indonesia</p>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom-container">
                    <p className="footer-copyright">
                        © 2026 AISTEL. All rights reserved.
                    </p>
                    <p className="footer-slogan">
                        Awareness Initiative for Sustainable Environment & Living
                    </p>
                </div>
            </footer>
        </div>
    );
}
