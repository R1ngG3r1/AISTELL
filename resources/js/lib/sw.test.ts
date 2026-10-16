import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

/*
| Service worker (public/sw.js) menentukan apa yang boleh disimpan di perangkat pengguna.
| Aturan terpenting: HANYA aset statis publik. Halaman dan data pribadi tidak boleh pernah ikut
| tersimpan (perangkat bisa dipakai bersama). Test ini menjaga aturan itu.
*/

type ServiceWorkerApi = {
    isStaticAsset: (url: URL) => boolean;
    shouldHandle: (request: { method: string }) => boolean;
    isNavigation: (request: { mode: string }) => boolean;
    PRECACHE: string[];
    OFFLINE_URL: string;
};

/**
 * Memuat sw.js apa adanya dengan `self` palsu. Tidak memakai require(): package.json bertipe "module",
 * sehingga Node menganggap sw.js sebagai ESM dan `module.exports` tidak terpasang.
 */
function loadServiceWorker(): ServiceWorkerApi {
    const source = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');
    const fakeSelf = { location: { origin: 'http://localhost:3000' }, addEventListener: vi.fn() };
    const fakeModule = { exports: {} as ServiceWorkerApi };
    new Function('self', 'module', source)(fakeSelf, fakeModule);

    return fakeModule.exports;
}

const sw = loadServiceWorker();
const origin = 'http://localhost:3000';
const url = (path: string) => new URL(path, origin);

describe('isStaticAsset: yang boleh disimpan', () => {
    it.each([
        '/build/assets/app-DsfQp3.js',
        '/build/assets/app-Ab12.css',
        '/landingpage/LOGO.png',
        '/dashboard/maskot.webp',
        '/login/gambar1.jpeg',
        '/tips/pilahsampah.jpg',
        '/pwa/icon-192.png',
        '/favicon.svg',
        '/favicon.ico',
    ])('%s', (path) => {
        expect(sw.isStaticAsset(url(path))).toBe(true);
    });

    it('font dari bunny.net', () => {
        expect(sw.isStaticAsset(new URL('https://fonts.bunny.net/css?family=plus-jakarta-sans:400'))).toBe(true);
        expect(sw.isStaticAsset(new URL('https://fonts.bunny.net/plus-jakarta-sans/files/x.woff2'))).toBe(true);
    });
});

describe('isStaticAsset: yang TIDAK boleh disimpan', () => {
    it.each([
        '/',
        '/dashboard',
        '/orders',
        '/orders/1',
        '/orders/1/invoice',
        '/admin/orders',
        '/admin/reports/export',
        '/notifications',
        '/helpdesk/messages',
        '/helpdesk/attachments/5',
        '/avatars/3', // foto profil: data pribadi
        '/profile',
        '/build/manifest.json',
        '/sw.js',
        '/manifest.webmanifest',
    ])('%s', (path) => {
        expect(sw.isStaticAsset(url(path))).toBe(false);
    });

    it('domain lain (peta, pencarian alamat, Google, dll.)', () => {
        for (const external of [
            'https://tile.openstreetmap.org/5/10/10.png',
            'https://nominatim.openstreetmap.org/search?q=x',
            'https://www.google.com/maps',
            'https://evil.example/build/assets/app.js',
        ]) {
            expect(sw.isStaticAsset(new URL(external))).toBe(false);
        }
    });
});

describe('shouldHandle', () => {
    it('hanya permintaan GET', () => {
        expect(sw.shouldHandle({ method: 'GET' })).toBe(true);
        for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
            expect(sw.shouldHandle({ method })).toBe(false);
        }
    });
});

describe('isNavigation', () => {
    it('membedakan pindah halaman dari permintaan lain', () => {
        expect(sw.isNavigation({ mode: 'navigate' })).toBe(true);
        expect(sw.isNavigation({ mode: 'cors' })).toBe(false);
        expect(sw.isNavigation({ mode: 'no-cors' })).toBe(false);
    });
});

describe('PRECACHE', () => {
    it('memuat halaman offline', () => {
        expect(sw.PRECACHE).toContain(sw.OFFLINE_URL);
    });

    it.each(['/offline.html', '/dashboard/maskot.webp', '/landingpage/LOGO.png', '/pwa/icon-192.png', '/favicon.svg'])('%s ada di folder public', (path) => {
        expect(sw.PRECACHE).toContain(path);
        expect(existsSync(resolve(process.cwd(), 'public', path.slice(1)))).toBe(true);
    });

    it('semuanya dianggap aset statis atau halaman offline (tidak ada data pribadi)', () => {
        for (const path of sw.PRECACHE) {
            expect(path === sw.OFFLINE_URL || sw.isStaticAsset(url(path))).toBe(true);
        }
    });
});
