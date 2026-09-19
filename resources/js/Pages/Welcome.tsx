import { Link } from "@inertiajs/react";
import { useState } from "react";
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
} from "@fortawesome/free-solid-svg-icons";

export default function Welcome() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const stats = [
        { value: "500+", label: "Layanan Selesai" },
        { value: "50+", label: "Area Terlayani" },
        { value: "98%", label: "Tingkat Kepuasan" },
        { value: "4", label: "Jenis Layanan" },
    ];

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

    const services = [
        {
          icon: faHouse,
          title: "Kebersihan Hunian",
          description: "Layanan pembersihan rumah, apartemen, dan properti hunian secara menyeluruh dan profesional.",
        },
        {
          icon: faLeaf,
          title: "Perawatan Tanaman",
          description: "Perawatan taman, pemangkasan tanaman, dan penghijauan lingkungan sekitar Anda.",
        },
        {
          icon: faRecycle,
          title: "Pengelolaan Sampah",
          description: "Pengangkutan dan pemilahan sampah secara terjadwal dan bertanggung jawab.",
        },
        {
          icon: faShieldHalved,
          title: "Sanitasi Lingkungan",
          description: "Sterilisasi dan desinfeksi area lingkungan untuk kehidupan yang lebih sehat.",
        },
    ];

    const caraKerja = [
        {
          step: 1,
          title: "Pilih Layanan",
          description: "Pilih jenis layanan kebersihan yang sesuai kebutuhan lingkungan Anda.",
        },
        {
          step: 2,
          title: "Isi Formulir",
          description: "Lengkapi detail pemesanan: lokasi, tanggal, waktu, dan catatan khusus.",
        },
        {
          step: 3,
          title: "Kirim Pesanan",
          description: "Pesanan dikirim tim kami dan diproses dengan cepat.",
        },
        {
          step: 4,
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
    description: "AISTEL hadir karena kami percaya bahwa lingkungan yang bersih adalah hak setiap orang. Kami mempertemukan masyarakat dengan tim kebersihan profesional melalui platform digital yang intuitif dan terpercaya.",
    points: [
        "Lingkungan bersih dan nyaman untuk seluruh masyarakat",
        "Waktu Anda lebih efisien tanpa mengorbankan kualitas hidup",
        "Mendorong gaya hidup berkelanjutan dan ramah lingkungan",
        "Membuka peluang kerja bagi tenaga kebersihan profesional",
    ],
};

    return (
        <div className="home">
            {/*  Navbar */}
            <nav className="navbar">
                <div className="logo">
                    <span className="logo-icon">🍀</span>
                    <span>AISTEL</span>
                </div>

                <div className="nav-menu">
                    <a href="#beranda">Beranda</a>
                    <a href="#layanan">Layanan</a>
                    <a href="#tentang">Tentang Kami</a>
                    <a href="#kontak">Kontak</a>
                </div>

                <Link href={route("login")} className="login-button">
                    Masuk/Daftar
                </Link>

                <button
                    className="hamburger-button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    ☰
                </button>

                {isMenuOpen && (
                <div className="mobile-menu">
                    <a href="#beranda">Beranda</a>
                    <a href="#layanan">Layanan</a>
                    <a href="#tentang">Tentang Kami</a>
                    <a href="#kontak">Kontak</a>

                    <Link href={route("login")}>
                        Masuk/Daftar
                    </Link>
                </div>
            )}   
            </nav>

            {/* Hero section */}
            <main className="hero" id="beranda">
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="hero-badge">
                            # AWARENESS INITIATIVE FOR SUSTAINABLE ENVIRONMENT &
                            LIVING
                        </div>

                        <h1 className="hero-title">
                            CLEAN SPACE.
                            <br />
                            BETTER <span>LIVING.</span>
                        </h1>

                        <p className="hero-description">
                            AISTEL menghadirkan layanan kebersihan dan perawatan
                            lingkungan profesional, mudah dipesan, dan
                            terpercaya, langsung dari genggaman Anda.
                        </p>

                        <div className="hero-buttons">
                            <button className="primary-button">
                                Pesan Layanan
                            </button>
                            <button className="secondary-button">
                                Lihat Layanan
                            </button>
                        </div>
                    </div>

                    <div className="hero-image-wrapper">
                        <img
                            src="/images/hero-cat.jpg"
                            alt="AISTEL Banner"
                            className="hero-image"
                        />
                    </div>
                </div>
            </main>

            {/*  Stats */}
            <section className="stats">
                <div className="stats-container">
                    {stats.map((item, index) => (
                        <div className="stat-item" key={index}>
                            <h3>{item.value}</h3>
                            <p>{item.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Challenges section */}
            <section className="challenges">
                <p className="challenge-label">TANTANGAN NYATA</p>

                <h2 className="challenge-title">
                    Banyak yang peduli lingkungan,
                    <br />
                    <span>tapi kekurangan waktu</span>
                </h2>

                <div className="challenge-grid">
                    {challenges.map((item, index) => (
                        <div key={index} className="challenge-card">
                            <div className="challenge-dot"></div>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Services section */}
            <section className="services" id="layanan">
                <p className="services-label">LAYANAN KAMI</p>

                <h2 className="services-title">
                    Solusi Kebersihan untuk
                    <br />
                    Setiap Kebutuhan Anda
                </h2>

                <p className="services-description">
                    Dari hunian pribadi hingga area publik, AISTEL menyediakan
                    <br />
                    layanan lengkap untuk menjaga lingkungan Anda.
                </p>

                <div className="services-grid">
                    {services.map((item, index) => (
                        <div key={index} className="service-card">
                            <div className="service-icon">
                                <FontAwesomeIcon icon={item.icon} />
                            </div>

                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Cara Kerja section */}
            <section className="cara-kerja">
                <p className="cara-kerja-label">CARA KERJA</p>

                <h2 className="cara-kerja-title">
                  Empat langkah mudah menuju
                  <br />
                  lingkungan bersih
                </h2>

                <p className="cara-kerja-description">
                  Proses sederhana dan transparan dari pemesanan
                  <br />
                  hingga layanan selesai.
                </p>

                <div className="cara-kerja-grid">
                  {caraKerja.map((item, index) => (
                    <div key={index} className="cara-kerja-card">
                      <div className="cara-kerja-step">
                        {String(item.step).padStart(2, "0")}
                      </div>

                      <div className="cara-kerja-info">
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
            </section>

            {/*  Keunggulan section start  */}
            <section className="keunggulan">
                <div className="keunggulan-container">

                    <div className="keunggulan-image">
                        <img
                            src="/images/hero-cat.jpg"
                            alt="Keunggulan AISTEL"
                        />
                    </div>

                    <div className="keunggulan-content">
                        <p className="keunggulan-label">
                            KEUNGGULAN KAMI
                        </p>

                        <h2 className="keunggulan-title">
                            Semua yang Anda butuhkan {' '}
                            <br />
                            dalam satu platform
                        </h2>

                        <div className="keunggulan-grid">
                            {keunggulan.map((item, index) => (
                                <div
                                    key={index}
                                    className="keunggulan-card"
                                >
                                    <div className="keunggulan-icon">
                                        <FontAwesomeIcon icon={item.icon} />
                                    </div>

                                    <div>
                                        <h3>{item.title}</h3>
                                        <p>{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>
            {/* Keunggulan section end */}

            {/* Tentang kami start */}
            <section className="tentang-kami" id="tentang">
                <div className="tentang-kami-container">

                    {/* BAGIAN KIRI */}
                    <div className="tentang-kami-content">
                        <p className="tentang-kami-label">
                            TENTANG KAMI
                        </p>

                        <h2 className="tentang-kami-title">
                            {tentangKami.title}
                            <br />
                            <span>{tentangKami.highlight}</span>
                        </h2>

                        <p className="tentang-kami-description">
                            {tentangKami.description}
                        </p>

                        <div className="tentang-kami-points">
                            {tentangKami.points.map((point, index) => (
                                <div
                                    key={index}
                                    className="tentang-kami-point"
                                >
                                    <FontAwesomeIcon icon={faCircleCheck} />
                                    <span>{point}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BAGIAN KANAN */}
                    <div className="pesanan-status">

                        <div className="pesanan-item">
                            <div className="pesanan-icon selesai">
                                <FontAwesomeIcon icon={faCircleCheck} />
                            </div>

                            <div className="pesanan-info">
                                <small>Pesanan #497</small>
                                <strong>Pembersihan Rumah: Selesai</strong>
                            </div>

                            <span className="pesanan-badge selesai-badge">
                                Selesai
                            </span>
                        </div>

                        <div className="pesanan-item">
                            <div className="pesanan-icon diproses">
                                <FontAwesomeIcon icon={faRecycle} />
                            </div>

                            <div className="pesanan-info">
                                <small>Pesanan #498</small>
                                <strong>Perawatan Tanaman: Diproses</strong>
                            </div>

                            <span className="pesanan-badge diproses-badge">
                                Diproses
                            </span>
                        </div>

                        <div className="pesanan-item">
                            <div className="pesanan-icon menunggu">
                                <FontAwesomeIcon icon={faLeaf} />
                            </div>

                            <div className="pesanan-info">
                                <small>Pesanan #499</small>
                                <strong>Pengelolaan Sampah: Menunggu</strong>
                            </div>

                            <span className="pesanan-badge menunggu-badge">
                                Menunggu
                            </span>
                        </div>
                    </div>
                </div>
            </section>
            {/* Tentang kami end  */}

            {/*  CTA section start  */}
            <section className="cta-section">
                <div className="cta-container">

                    <h2 className="cta-title">
                        Mulai Perjalanan
                        <br />
                        <span>Hidup Lebih Bersih</span>
                    </h2>

                    <p className="cta-description">
                        Bergabunglah dengan ratusan keluarga yang sudah merasakan
                        <br />
                        manfaat AISTEL. Pesan layanan pertama Anda hari ini.
                    </p>

                    <div className="cta-buttons">
                        <button className="cta-primary-button">
                            Daftar Gratis Sekarang
                        </button>

                        <button className="cta-secondary-button">
                            Lihat Layanan
                        </button>
                    </div>
                </div>
            </section>
            {/* CTA section end */}

            {/* Footer start */}
            <footer className="footer" id="kontak">
                <div className="footer-container">

                    <div className="footer-brand">
                        <div className="footer-logo">
                            <span className="footer-logo-icon">✿</span>
                            <span>AISTEL</span>
                        </div>

                        <p>
                            Awareness Initiative for Sustainable
                            <br />
                            Environment & Living. Platform layanan
                            <br />
                            kebersihan dan perawatan lingkungan
                            <br />
                            untuk masyarakat modern.
                        </p>

                    </div>

                    <div className="footer-column">
                        <h3>Platform</h3>
                        <a href="#beranda">Beranda</a>
                        <a href="#layanan">Layanan</a>
                        <a href="#tentang-kami">Tentang Kami</a>
                        <a href="#kontak">Kontak</a>
                    </div>

                    <div className="footer-column">
                        <h3>Kontak</h3>
                        <p>hello@aistel.id</p>
                        <p>+62 812-3456-7890</p>
                        <p>Indonesia</p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>
                        © 2026 AISTEL. All rights reserved.
                    </p>
                    <p>
                        Awareness Initiative for Sustainable Environment & Living
                    </p>
                </div>
            </footer>
            {/*  Footer end  */}
        </div>
    );
}
