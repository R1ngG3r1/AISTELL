import { afterEach, describe, expect, it, vi } from 'vitest';
import { googleMapsUrl, reverseGeocode, roundCoord, searchPlaces, toLatLng } from './geo';

afterEach(() => vi.unstubAllGlobals());

describe('toLatLng', () => {
    it('mengubah koordinat backend menjadi titik peta', () => {
        expect(toLatLng({ latitude: -5.4, longitude: 105.26 })).toEqual({ lat: -5.4, lng: 105.26 });
    });

    it('null bila salah satunya kosong', () => {
        expect(toLatLng({ latitude: null, longitude: 105 })).toBeNull();
        expect(toLatLng({ latitude: -5, longitude: null })).toBeNull();
    });

    it('nol adalah koordinat yang sah (bukan kosong)', () => {
        expect(toLatLng({ latitude: 0, longitude: 0 })).toEqual({ lat: 0, lng: 0 });
    });
});

describe('roundCoord', () => {
    it('membulatkan ke 7 desimal sesuai kolom database', () => {
        expect(roundCoord(-5.123456789)).toBe(-5.1234568);
        expect(roundCoord(105.5)).toBe(105.5);
    });
});

describe('googleMapsUrl', () => {
    it('membuat tautan pencarian titik', () => {
        expect(googleMapsUrl({ lat: -5.4, lng: 105.26 })).toBe('https://www.google.com/maps/search/?api=1&query=-5.4,105.26');
    });
});

describe('searchPlaces', () => {
    it('memanggil Nominatim terbatas di Indonesia dan merapikan hasil', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ lat: '-5.4', lon: '105.26', display_name: 'Way Huwi, Lampung, Indonesia' }],
        });
        vi.stubGlobal('fetch', fetchMock);

        const results = await searchPlaces('way huwi');

        expect(results).toEqual([{ lat: -5.4, lng: 105.26, name: 'Way Huwi, Lampung' }]);
        const url = String(fetchMock.mock.calls[0][0]);
        expect(url).toContain('https://nominatim.openstreetmap.org/search?');
        expect(url).toContain('countrycodes=id');
        expect(url).toContain('q=way+huwi');
    });

    it('melempar error bila server menolak', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

        await expect(searchPlaces('x')).rejects.toThrow('Pencarian alamat gagal.');
    });
});

describe('reverseGeocode', () => {
    it('mengembalikan alamat tanpa akhiran ", Indonesia"', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ display_name: 'Jl. Mawar, Bandar Lampung, Indonesia' }) }));

        expect(await reverseGeocode({ lat: -5.4, lng: 105.26 })).toBe('Jl. Mawar, Bandar Lampung');
    });

    it('null bila alamat tidak ditemukan atau server gagal', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
        expect(await reverseGeocode({ lat: 0, lng: 0 })).toBeNull();

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
        expect(await reverseGeocode({ lat: 0, lng: 0 })).toBeNull();
    });
});
