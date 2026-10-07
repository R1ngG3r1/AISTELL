// Tips hijau yang ditampilkan bergantian setiap hari (sidebar & dashboard).
export const greenTips = [
    'Pisahkan sampah organik dan anorganik sejak dari dapur agar mudah didaur ulang.',
    'Bersihkan selokan sebelum musim hujan untuk mencegah genangan dan nyamuk.',
    'Tanaman hias di dalam rumah membantu menyaring udara secara alami.',
    'Gunakan cairan pembersih ramah lingkungan untuk menjaga kualitas air tanah.',
    'Tanam lebih banyak pohon di halaman agar lingkungan lebih sejuk dan asri.',
];

/** Tip untuk hari ini; `offset` dipakai agar dua tempat bisa menampilkan tip berbeda. */
export function tipOfTheDay(offset = 0) {
    return greenTips[(new Date().getDate() + offset) % greenTips.length];
}
