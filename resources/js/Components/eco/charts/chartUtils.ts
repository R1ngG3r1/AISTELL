/*
| Bantuan untuk grafik laporan (SVG buatan sendiri, tanpa library).
| Warna mengikuti warna merek: forest-500 sebagai warna seri, lolos validasi
| palet (kontras >= 3:1 di atas permukaan putih kartu).
*/

export const CHART_COLORS = {
    series: '#328e67', // forest-500, satu seri = satu warna
    surface: '#ffffff', // permukaan kartu, dipakai untuk cincin 2px di sekitar titik
    grid: '#e1e0d9', // garis bantu hairline, solid
    axis: '#c3c2b7', // garis dasar
    muted: '#898781', // label sumbu (teks sekunder)
} as const;

/** Angka ringkas untuk sumbu: 0 / 500 rb / 1,5 jt. */
export function compact(value: number): string {
    return new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/** Pembulatan ke atas ke angka "bulat" (1, 2, 2.5, 5, 10 × 10ⁿ) agar tick sumbu rapi. */
export function niceCeil(value: number): number {
    if (value <= 0) return 4; // grafik kosong: sumbu 0–4 (bilangan bulat), bukan 0,25 / 0,5 …
    const exp = Math.floor(Math.log10(value));
    const base = 10 ** exp;
    const frac = value / base;
    const nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 2.5 ? 2.5 : frac <= 5 ? 5 : 10;

    return nice * base;
}

/** Kunci seri "2026-10-05" (harian) atau "2026-10" (bulanan) → tanggal lokal. */
export function parseKey(key: string): Date {
    const [y, m, d] = key.split('-').map(Number);

    return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Label sumbu: "5 Okt" (harian) atau "Okt 26" (bulanan). */
export function axisLabel(key: string, granularity: 'day' | 'month'): string {
    const date = parseKey(key);

    return granularity === 'day'
        ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        : date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
}

/** Label lengkap untuk tooltip dan tabel: "Senin, 5 Oktober 2026" atau "Oktober 2026". */
export function fullLabel(key: string, granularity: 'day' | 'month'): string {
    const date = parseKey(key);

    return granularity === 'day'
        ? date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

/** Indeks label sumbu-x yang ditampilkan: maksimal `max`, tersebar rata, selalu termasuk yang pertama dan terakhir. */
export function tickIndexes(count: number, max: number): number[] {
    if (count <= max) return Array.from({ length: count }, (_, i) => i);
    const step = (count - 1) / (max - 1);

    return Array.from({ length: max }, (_, i) => Math.round(i * step));
}
