// Bagian peta yang memakai Leaflet. File ini hanya di-import lewat React.lazy (lihat ./index.tsx),
// jadi library peta (±150 KB) hanya diunduh di halaman yang benar-benar menampilkan peta.
import { currentPosition, DEFAULT_CENTER, DEFAULT_ZOOM, LatLng, PICKED_ZOOM, PlaceResult, reverseGeocode, roundCoord, searchPlaces } from '@/lib/geo';
import { faCrosshairs, faLocationDot, faMagnifyingGlass, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

// Pin berupa SVG (bukan gambar PNG bawaan Leaflet yang sering hilang saat di-bundle Vite).
const pin = L.divIcon({
    className: '', // hapus kotak putih bawaan .leaflet-div-icon
    iconSize: [36, 46],
    iconAnchor: [18, 45],
    html: `<svg viewBox="0 0 36 46" width="36" height="46" style="filter:drop-shadow(0 4px 6px rgba(7,45,35,.35))">
        <path d="M18 1C8.6 1 1 8.6 1 18c0 12.4 15 25.6 16.3 26.7a1 1 0 0 0 1.4 0C20 43.6 35 30.4 35 18 35 8.6 27.4 1 18 1z" fill="#072d23" stroke="#fff" stroke-width="2"/>
        <circle cx="18" cy="18" r="6.5" fill="#b4d96f"/>
    </svg>`,
});

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';

/** Arahkan peta ke titik baru jika titik itu berada di luar layar / peta masih terlalu jauh. */
function FollowPoint({ point }: { point: LatLng | null }) {
    const map = useMap();
    useEffect(() => {
        if (!point) return;
        if (map.getZoom() < 14 || !map.getBounds().contains(point)) {
            map.flyTo(point, PICKED_ZOOM, { duration: 0.8 });
        }
    }, [map, point?.lat, point?.lng]); // eslint-disable-line react-hooks/exhaustive-deps
    return null;
}

function ClickToPick({ onPick }: { onPick: (p: LatLng) => void }) {
    useMapEvents({ click: (e) => onPick(e.latlng) });
    return null;
}

export interface LocationPickerProps {
    value: LatLng | null;
    /** Titik berubah (klik peta, geser pin, hasil pencarian, atau lokasi saya). */
    onChange: (point: LatLng) => void;
    /** Alamat hasil titik tersebut, untuk mengisi kolom alamat secara otomatis. */
    onAddress?: (address: string) => void;
    className?: string;
}

/**
 * Pemilih lokasi ala aplikasi e-commerce: cari alamat, pakai lokasi saat ini,
 * lalu klik peta / geser pin untuk menepatkan titik.
 */
export function LocationPicker({ value, onChange, onAddress, className = 'h-72' }: LocationPickerProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PlaceResult[] | null>(null);
    const [busy, setBusy] = useState<'search' | 'locate' | 'reverse' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const reverseCtrl = useRef<AbortController | null>(null);

    useEffect(() => () => reverseCtrl.current?.abort(), []);

    // Titik dipilih langsung di peta → cari alamatnya. Request lama dibatalkan
    // supaya alamat yang tampil selalu milik titik terakhir.
    const pickPoint = (p: LatLng) => {
        const point = { lat: roundCoord(p.lat), lng: roundCoord(p.lng) };
        onChange(point);
        setError(null);
        if (!onAddress) return;

        reverseCtrl.current?.abort();
        const ctrl = (reverseCtrl.current = new AbortController());
        setBusy('reverse');
        reverseGeocode(point, ctrl.signal)
            .then((address) => address && onAddress(address))
            .catch((e) => e.name !== 'AbortError' && setError('Alamat untuk titik ini tidak ditemukan, silakan ketik manual.'))
            .finally(() => reverseCtrl.current === ctrl && setBusy(null));
    };

    const search = async () => {
        if (query.trim().length < 3) {
            setError('Ketik minimal 3 huruf untuk mencari alamat.');
            return;
        }
        setBusy('search');
        setError(null);
        try {
            const found = await searchPlaces(query.trim());
            setResults(found);
            if (found.length === 0) setError('Alamat tidak ditemukan. Coba kata kunci lain, mis. nama jalan + kecamatan.');
        } catch {
            setError('Pencarian gagal. Periksa koneksi internet Anda.');
        } finally {
            setBusy(null);
        }
    };

    const choose = (place: PlaceResult) => {
        reverseCtrl.current?.abort();
        onChange({ lat: roundCoord(place.lat), lng: roundCoord(place.lng) });
        onAddress?.(place.name);
        setResults(null);
        setQuery('');
    };

    const locate = async () => {
        setBusy('locate');
        setError(null);
        try {
            pickPoint(await currentPosition());
        } catch (e) {
            setError((e as Error).message);
            setBusy(null);
        }
    };

    // Enter di kolom cari = cari alamat, BUKAN mengirim formulir pemesanan.
    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            search();
        }
        // Escape menutup daftar hasil dulu, tanpa ikut menutup modal.
        if (e.key === 'Escape' && results) {
            e.stopPropagation();
            setResults(null);
        }
    };

    return (
        <div>
            <div className="relative z-20">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-forest-900/35" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Cari jalan, kelurahan, atau nama tempat…"
                            className="input pl-10"
                            aria-label="Cari alamat di peta"
                        />
                    </div>
                    <button type="button" onClick={search} disabled={busy === 'search'} className="btn-primary shrink-0 rounded-2xl">
                        {busy === 'search' ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Cari'}
                    </button>
                </div>

                {results && results.length > 0 && (
                    <ul className="absolute inset-x-0 top-full mt-2 max-h-64 animate-fade-up overflow-y-auto rounded-2xl bg-white p-1.5 shadow-lift ring-1 ring-forest-900/10">
                        {results.map((r, i) => (
                            <li key={i}>
                                <button
                                    type="button"
                                    onClick={() => choose(r)}
                                    className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-forest-50"
                                >
                                    <FontAwesomeIcon icon={faLocationDot} className="mt-0.5 text-forest-500" />
                                    <span className="text-forest-900/80">{r.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* isolate: z-index internal Leaflet (400–1000) tidak menutupi modal/menu di luar peta */}
            <div className={`relative isolate z-0 mt-3 overflow-hidden rounded-2xl ring-1 ring-forest-900/10 ${className}`}>
                <MapContainer
                    center={value ?? DEFAULT_CENTER}
                    zoom={value ? PICKED_ZOOM : DEFAULT_ZOOM}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                >
                    <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
                    <ClickToPick onPick={pickPoint} />
                    <FollowPoint point={value} />
                    {value && (
                        <Marker
                            position={value}
                            icon={pin}
                            draggable
                            eventHandlers={{ dragend: (e) => pickPoint((e.target as L.Marker).getLatLng()) }}
                        />
                    )}
                </MapContainer>

                <button
                    type="button"
                    onClick={locate}
                    disabled={busy === 'locate'}
                    className="absolute right-3 top-3 z-[1000] inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-forest-900 shadow-soft ring-1 ring-forest-900/10 transition hover:bg-forest-50"
                >
                    <FontAwesomeIcon icon={busy === 'locate' ? faSpinner : faCrosshairs} spin={busy === 'locate'} className="text-forest-500" />
                    Lokasi saya
                </button>

                {!value && (
                    <p className="pointer-events-none absolute inset-x-3 bottom-3 z-[1000] rounded-xl bg-forest-900/85 px-3 py-2 text-center text-xs text-cream backdrop-blur">
                        Cari alamat, tekan “Lokasi saya”, atau klik peta untuk menaruh pin.
                    </p>
                )}
            </div>

            <p className={`mt-2 text-xs ${error ? 'text-clay-600' : 'text-forest-900/50'}`}>
                {error ??
                    (busy === 'reverse'
                        ? 'Mencari alamat dari titik yang dipilih…'
                        : value
                          ? 'Geser pin atau klik peta untuk menepatkan titik lokasi.'
                          : 'Titik peta membantu petugas menemukan lokasi Anda.')}
            </p>
        </div>
    );
}

/** Peta kecil (tidak bisa digeser) untuk menampilkan titik lokasi yang sudah tersimpan. */
export function MapPreview({ point, className = 'h-44' }: { point: LatLng; className?: string }) {
    return (
        <div className={`relative isolate z-0 overflow-hidden rounded-2xl ring-1 ring-forest-900/10 ${className}`}>
            <MapContainer
                key={`${point.lat},${point.lng}`} // center MapContainer hanya dibaca saat mount
                center={point}
                zoom={16}
                className="h-full w-full"
                dragging={false}
                zoomControl={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
                keyboard={false}
                attributionControl
            >
                <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
                <Marker position={point} icon={pin} interactive={false} />
            </MapContainer>
        </div>
    );
}
