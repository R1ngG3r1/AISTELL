import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/**
 * Design system AISTEL — "Eco-modern".
 * Warna dasar diambil dari landing page awal (#072d23, #328e67, #b4d96f, #f7f8f3)
 * lalu dikembangkan menjadi skala agar konsisten di semua halaman.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
        './resources/js/**/*.ts',
    ],

    theme: {
        extend: {
            colors: {
                // Hijau hutan → lumut. 500 = #328e67 (primer), 900 = #072d23 (teks/ink)
                forest: {
                    50: '#eef6f1',
                    100: '#d6eadf',
                    200: '#b0d6c1',
                    300: '#80bb9c',
                    400: '#52a07b',
                    500: '#328e67',
                    600: '#247352',
                    700: '#1b5b42',
                    800: '#103f2f',
                    900: '#072d23',
                    950: '#041b15',
                },
                // Aksen hijau muda / lime
                leaf: {
                    50: '#f6fbea',
                    100: '#ecf6d2',
                    200: '#dcedb0',
                    300: '#c7e188',
                    400: '#b4d96f',
                    500: '#98c34b',
                    600: '#76a032',
                },
                cream: '#f7f8f3',
                sand: {
                    100: '#f3f0e6',
                    200: '#ece8da',
                    300: '#ddd6c1',
                },
                clay: {
                    100: '#fbe9e1',
                    500: '#d9764a',
                    600: '#c05f35',
                },
                sun: {
                    100: '#fdf3d7',
                    400: '#f2c14e',
                    600: '#b7861b',
                },
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
                display: ['"Space Grotesk"', '"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
            },
            boxShadow: {
                soft: '0 1px 2px rgba(7,45,35,.04), 0 8px 24px -8px rgba(7,45,35,.12)',
                lift: '0 2px 4px rgba(7,45,35,.05), 0 24px 48px -16px rgba(7,45,35,.25)',
                glow: '0 0 0 6px rgba(180,217,111,.25)',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                sway: {
                    '0%, 100%': { transform: 'rotate(-6deg)' },
                    '50%': { transform: 'rotate(6deg)' },
                },
                drift: {
                    '0%': { transform: 'translate3d(0,-10vh,0) rotate(0deg)', opacity: '0' },
                    '10%': { opacity: '1' },
                    '90%': { opacity: '1' },
                    '100%': { transform: 'translate3d(8vw,110vh,0) rotate(540deg)', opacity: '0' },
                },
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                },
                blob: {
                    '0%, 100%': { borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%' },
                    '50%': { borderRadius: '70% 30% 46% 54% / 30% 39% 61% 70%' },
                },
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'scale-in': {
                    '0%': { opacity: '0', transform: 'scale(.96) translateY(8px)' },
                    '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
                },
                'toast-in': {
                    '0%': { opacity: '0', transform: 'translateX(24px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                'progress-fill': {
                    '0%': { width: '0%' },
                    '100%': { width: '100%' },
                },
                grow: {
                    '0%': { transform: 'scaleX(0)' },
                    '100%': { transform: 'scaleX(1)' },
                },
            },
            animation: {
                float: 'float 6s ease-in-out infinite',
                'float-slow': 'float 9s ease-in-out infinite',
                sway: 'sway 5s ease-in-out infinite',
                drift: 'drift 14s linear infinite',
                marquee: 'marquee 30s linear infinite',
                blob: 'blob 12s ease-in-out infinite',
                'fade-up': 'fade-up .6s cubic-bezier(.2,.7,.2,1) both',
                'scale-in': 'scale-in .25s cubic-bezier(.2,.7,.2,1) both',
                'toast-in': 'toast-in .35s cubic-bezier(.2,.7,.2,1) both',
                grow: 'grow 1s cubic-bezier(.2,.7,.2,1) both',
                'progress-fill': 'progress-fill 3s linear forwards',
            },
        },
    },

    plugins: [forms],
};
