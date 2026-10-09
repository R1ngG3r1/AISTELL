// Tips hijau statis untuk carousel di dashboard. Foto ada di public/tips/.
export interface GreenTip {
    title: string;
    text: string;
    image: string;
    alt: string;
}

export const greenTipSlides: GreenTip[] = [
    {
        title: 'Pilah sampah dari rumah',
        text: 'Pisahkan sampah organik (sisa makanan, daun) dan anorganik (plastik, kertas, logam) sejak dari dapur. Sampah organik bisa dikomposkan, yang anorganik bisa didaur ulang.',
        image: '/tips/pilahsampah.jpg',
        alt: 'Tiga tempat sampah berwarna merah, biru, dan kuning berlabel sampah plastik, kertas, dan organik',
    },
    {
        title: 'Rutin bersihkan selokan',
        text: 'Bersihkan selokan dan saluran air di sekitar rumah secara berkala, terutama sebelum musim hujan, agar air mengalir lancar dan jentik nyamuk tidak berkembang.',
        image: '/tips/bersihselokan.jpg',
        alt: 'Warga bergotong royong membersihkan selokan dan menyapu jalan lingkungan',
    },
    {
        title: 'Hadirkan tanaman di dalam rumah',
        text: 'Letakkan tanaman hias di ruang tamu atau kamar agar ruangan terasa lebih segar, asri, dan menenangkan.',
        image: '/tips/tanamanhias.jpg',
        alt: 'Tanaman hias berdaun hijau bercorak dalam pot putih di ruang tamu',
    },
    {
        title: 'Pilih pembersih isi ulang',
        text: 'Gunakan pembersih yang mudah terurai dan beli kemasan isi ulang (refill) untuk mengurangi sampah botol plastik dan beban pencemaran air.',
        image: '/tips/pembersihramah.jpg',
        alt: 'Ilustrasi tiga botol semprot pembersih dengan ikon bumi dalam genggaman tangan',
    },
    {
        title: 'Tanam dan rawat pohon',
        text: 'Tanam pohon di halaman dan siram bibitnya secara rutin. Pohon memberi keteduhan, membantu menyerap air hujan, dan membuat suhu sekitar rumah lebih sejuk.',
        image: '/tips/tanampohon.jpg',
        alt: 'Tangan memegang bibit pohon kecil beserta tanahnya',
    },
];
