import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Tanggal di test selalu dihitung dalam WIB, sama seperti aplikasinya, apa pun zona waktu mesin/CI.
process.env.TZ = 'Asia/Jakarta';

export default defineConfig({
    resolve: {
        alias: { '@': fileURLToPath(new URL('./resources/js', import.meta.url)) },
    },
    test: {
        environment: 'jsdom',
        include: ['resources/js/**/*.test.{ts,tsx}'],
        setupFiles: ['resources/js/test-setup.ts'],
        css: false,
    },
});
