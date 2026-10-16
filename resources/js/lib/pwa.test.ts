import { describe, expect, it, vi } from 'vitest';
import { DISMISS_DAYS, isIos, isStandalone, rememberDismissed, wasDismissedRecently } from './pwa';

const DAY = 86_400_000;
const memoryStorage = (initial: Record<string, string> = {}) => {
    const data = { ...initial };
    return {
        data,
        getItem: (k: string) => data[k] ?? null,
        setItem: (k: string, v: string) => {
            data[k] = v;
        },
    };
};

describe('isIos', () => {
    it('mengenali iPhone, iPad, dan iPod', () => {
        expect(isIos('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15')).toBe(true);
        expect(isIos('Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X)')).toBe(true);
    });

    it('bukan Android atau desktop', () => {
        expect(isIos('Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/126.0')).toBe(false);
        expect(isIos('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0')).toBe(false);
    });
});

describe('isStandalone', () => {
    it('false di tab browser biasa', () => {
        expect(isStandalone()).toBe(false);
    });

    it('true bila display-mode standalone', () => {
        vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('standalone') }));
        expect(isStandalone()).toBe(true);
        vi.unstubAllGlobals();
    });
});

describe('ajakan pasang yang ditutup', () => {
    const now = 1_800_000_000_000;

    it('belum pernah ditutup → boleh muncul', () => {
        expect(wasDismissedRecently(now, memoryStorage())).toBe(false);
    });

    it('baru ditutup → tidak muncul', () => {
        const storage = memoryStorage();
        rememberDismissed(now - 2 * DAY, storage);

        expect(wasDismissedRecently(now, storage)).toBe(true);
    });

    it(`lewat ${DISMISS_DAYS} hari → muncul lagi`, () => {
        const storage = memoryStorage();
        rememberDismissed(now - (DISMISS_DAYS + 1) * DAY, storage);

        expect(wasDismissedRecently(now, storage)).toBe(false);
    });

    it('nilai rusak dianggap belum pernah ditutup', () => {
        expect(wasDismissedRecently(now, memoryStorage({ 'aistel.install.dismissedAt': 'abc' }))).toBe(false);
    });

    it('penyimpanan yang melempar error (mode privat) tidak merusak aplikasi', () => {
        const broken = {
            getItem: () => {
                throw new Error('denied');
            },
            setItem: () => {
                throw new Error('denied');
            },
        };

        expect(wasDismissedRecently(now, broken)).toBe(false);
        expect(() => rememberDismissed(now, broken)).not.toThrow();
    });

    it('tanpa penyimpanan sama sekali tetap aman', () => {
        expect(wasDismissedRecently(now, null)).toBe(false);
        expect(() => rememberDismissed(now, null)).not.toThrow();
    });
});
