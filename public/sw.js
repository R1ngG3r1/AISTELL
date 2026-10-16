/*
| Service worker AISTEL.
|
| Tujuan: aplikasi bisa dipasang di layar utama, memuat lebih cepat (aset statis disimpan), dan
| menampilkan halaman "Anda sedang offline" yang ramah saat tidak ada koneksi.
|
| YANG TIDAK PERNAH DISIMPAN: halaman, respons Inertia/JSON, atau apa pun yang berisi data pengguna
| (pesanan, chat, profil, pembayaran). Hanya berkas statis publik. Jadi tidak ada data pribadi yang
| tertinggal di perangkat bersama setelah logout.
|
| Ubah VERSION untuk membuang semua cache lama (mis. bila daftar PRECACHE berubah).
*/

const VERSION = 'v1';
const STATIC_CACHE = `aistel-static-${VERSION}`;
const OFFLINE_URL = '/offline.html';
const MAX_STATIC_ENTRIES = 150;

/** Disimpan saat service worker dipasang, supaya halaman offline selalu tersedia. */
const PRECACHE = [OFFLINE_URL, '/dashboard/maskot.webp', '/landingpage/LOGO.png', '/pwa/icon-192.png', '/favicon.svg'];

const SAME_ORIGIN_STATIC = [/^\/build\/assets\//, /^\/(landingpage|dashboard|login|tips|pwa)\//, /^\/favicon\.(svg|ico)$/];
const FONT_HOST = 'https://fonts.bunny.net';

/** Berkas statis publik yang aman disimpan. Aset build bernama hash, jadi tidak pernah basi. */
function isStaticAsset(url) {
    if (url.origin === self.location.origin) {
        return SAME_ORIGIN_STATIC.some((pattern) => pattern.test(url.pathname));
    }

    return url.origin === FONT_HOST;
}

/** Permintaan yang ditangani service worker: hanya GET; selain itu dibiarkan lewat apa adanya. */
function shouldHandle(request) {
    return request.method === 'GET';
}

function isNavigation(request) {
    return request.mode === 'navigate';
}

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((key) => key.startsWith('aistel-') && key !== STATIC_CACHE).map((key) => caches.delete(key))))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

/** Batasi jumlah berkas di cache agar tidak membengkak (aset build lama menumpuk tiap rilis). */
async function trim(cache) {
    const keys = await cache.keys();
    const surplus = keys.length - MAX_STATIC_ENTRIES;
    for (let i = 0; i < surplus; i++) await cache.delete(keys[i]);
}

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (!shouldHandle(request)) return;

    // Pindah halaman: selalu dari jaringan (data selalu terbaru); hanya saat gagal tampil halaman offline.
    if (isNavigation(request)) {
        event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
        return;
    }

    const url = new URL(request.url);
    if (!isStaticAsset(url)) return; // XHR Inertia, JSON, tile peta, dll: langsung ke jaringan

    // Aset statis: cache dulu (cepat), simpan bila belum ada.
    event.respondWith(
        caches.open(STATIC_CACHE).then(async (cache) => {
            const cached = await cache.match(request);
            if (cached) return cached;

            const response = await fetch(request);
            // Simpan hanya respons sukses (atau opaque dari font lintas-origin), bukan error.
            if (response.ok || response.type === 'opaque') {
                cache.put(request, response.clone()).then(() => trim(cache));
            }

            return response;
        }),
    );
});

// Dipakai test (Vitest); di service worker `module` tidak ada sehingga baris ini diabaikan.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { isStaticAsset, shouldHandle, isNavigation, PRECACHE, OFFLINE_URL, VERSION };
}
