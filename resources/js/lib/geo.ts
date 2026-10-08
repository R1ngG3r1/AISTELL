// Pencarian alamat & titik peta memakai OpenStreetMap (Nominatim): gratis, tanpa API key.
// Aturan pakai Nominatim: maksimal ±1 request/detik dan TIDAK untuk autocomplete per ketikan,
// jadi pencarian hanya dijalankan saat user menekan tombol Cari / Enter.
// https://operations.osmfoundation.org/policies/nominatim/

export interface LatLng {
    lat: number;
    lng: number;
}

export interface PlaceResult extends LatLng {
    name: string; // alamat lengkap, mis. "Way Huwi, Jati Agung, Lampung Selatan, Lampung"
}

const NOMINATIM = 'https://nominatim.openstreetmap.org';

/** Titik awal peta jika belum ada lokasi dipilih: seluruh Indonesia. */
export const DEFAULT_CENTER: LatLng = { lat: -2.5, lng: 118 };
export const DEFAULT_ZOOM = 5;
/** Zoom saat sebuah titik dipilih (cukup dekat untuk melihat jalan). */
export const PICKED_ZOOM = 17;

// "…, Lampung, 35365, Indonesia" → "…, Lampung, 35365"
const tidy = (name: string) => name.replace(/,\s*Indonesia$/, '');

/** Cari alamat / nama tempat (dibatasi di Indonesia). */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
    const params = new URLSearchParams({ q: query, format: 'jsonv2', countrycodes: 'id', limit: '5', 'accept-language': 'id' });
    // Pakai fetch (bukan axios) agar tidak ada header tambahan yang memicu CORS preflight.
    const res = await fetch(`${NOMINATIM}/search?${params}`, { signal });
    if (!res.ok) throw new Error('Pencarian alamat gagal.');
    const rows: { lat: string; lon: string; display_name: string }[] = await res.json();
    return rows.map((r) => ({ lat: Number(r.lat), lng: Number(r.lon), name: tidy(r.display_name) }));
}

/** Titik peta → alamat (reverse geocoding). Null jika tidak ditemukan. */
export async function reverseGeocode({ lat, lng }: LatLng, signal?: AbortSignal): Promise<string | null> {
    const params = new URLSearchParams({ lat: String(lat), lon: String(lng), format: 'jsonv2', zoom: '18', 'accept-language': 'id' });
    const res = await fetch(`${NOMINATIM}/reverse?${params}`, { signal });
    if (!res.ok) return null;
    const row: { display_name?: string } = await res.json();
    return row.display_name ? tidy(row.display_name) : null;
}

/** Lokasi perangkat saat ini (meminta izin browser). */
export function currentPosition(): Promise<LatLng> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Browser tidak mendukung deteksi lokasi.'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) =>
                reject(
                    new Error(
                        err.code === err.PERMISSION_DENIED
                            ? 'Izin lokasi ditolak. Aktifkan izin lokasi di browser Anda.'
                            : 'Lokasi Anda tidak dapat dideteksi. Coba cari alamat secara manual.',
                    ),
                ),
            { enableHighAccuracy: true, timeout: 10000 },
        );
    });
}

/** Link petunjuk arah Google Maps ke titik tersebut (bisa dibuka di aplikasi Maps HP). */
export function googleMapsUrl({ lat, lng }: LatLng): string {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/** Bulatkan ke 7 desimal, sesuai kolom decimal(10,7) di database. */
export const roundCoord = (n: number) => Math.round(n * 1e7) / 1e7;

/** Titik dari data backend (latitude/longitude bisa null). */
export function toLatLng(src: { latitude: number | null; longitude: number | null }): LatLng | null {
    return src.latitude !== null && src.longitude !== null ? { lat: src.latitude, lng: src.longitude } : null;
}
