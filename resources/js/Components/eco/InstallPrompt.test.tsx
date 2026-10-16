import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InstallPrompt from './InstallPrompt';

const DISMISS_KEY = 'aistel.install.dismissedAt';

/** Meniru event beforeinstallprompt milik Chrome/Android. */
function installEvent(outcome: 'accepted' | 'dismissed' = 'accepted') {
    const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
    event.prompt = vi.fn().mockResolvedValue(undefined);
    event.userChoice = Promise.resolve({ outcome });
    return event;
}

const wait = (ms: number) => act(async () => void vi.advanceTimersByTime(ms));

beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
});
afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});

describe('InstallPrompt (Android/Chrome)', () => {
    it('tidak tampil sebelum browser menyatakan aplikasi bisa dipasang', async () => {
        render(<InstallPrompt />);
        await wait(10_000);

        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('tampil beberapa detik setelah event, bukan langsung', async () => {
        render(<InstallPrompt />);
        act(() => void window.dispatchEvent(installEvent()));

        expect(screen.queryByRole('dialog')).toBeNull();
        await wait(4100);
        expect(screen.getByRole('dialog', { name: /Pasang aplikasi AISTEL/ })).toBeTruthy();
    });

    it('menahan dialog otomatis browser (preventDefault)', () => {
        render(<InstallPrompt />);
        const event = installEvent();

        act(() => void window.dispatchEvent(event));

        expect(event.defaultPrevented).toBe(true);
    });

    it('tombol Pasang memanggil dialog pasang browser lalu menutup ajakan', async () => {
        render(<InstallPrompt />);
        const event = installEvent('accepted');
        act(() => void window.dispatchEvent(event));
        await wait(4100);

        await act(async () => void fireEvent.click(screen.getByRole('button', { name: /Pasang aplikasi/ })));

        expect(event.prompt).toHaveBeenCalledOnce();
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(window.localStorage.getItem(DISMISS_KEY)).toBeNull(); // diterima, jadi tidak perlu "ingat ditutup"
    });

    it('menolak dialog pasang dianggap menutup ajakan', async () => {
        render(<InstallPrompt />);
        act(() => void window.dispatchEvent(installEvent('dismissed')));
        await wait(4100);

        await act(async () => void fireEvent.click(screen.getByRole('button', { name: /Pasang aplikasi/ })));

        expect(window.localStorage.getItem(DISMISS_KEY)).not.toBeNull();
    });

    it('tombol Tutup menyembunyikan dan mengingat pilihan', async () => {
        render(<InstallPrompt />);
        act(() => void window.dispatchEvent(installEvent()));
        await wait(4100);

        fireEvent.click(screen.getByRole('button', { name: 'Tutup' }));

        expect(screen.queryByRole('dialog')).toBeNull();
        expect(window.localStorage.getItem(DISMISS_KEY)).not.toBeNull();
    });

    it('tidak tampil bila baru ditutup', async () => {
        window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
        render(<InstallPrompt />);
        act(() => void window.dispatchEvent(installEvent()));
        await wait(5000);

        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('tidak tampil bila sudah dibuka sebagai aplikasi terpasang', async () => {
        vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('standalone') }));
        render(<InstallPrompt />);
        act(() => void window.dispatchEvent(installEvent()));
        await wait(5000);

        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('hilang bila aplikasi selesai dipasang', async () => {
        render(<InstallPrompt />);
        act(() => void window.dispatchEvent(installEvent()));
        await wait(4100);

        act(() => void window.dispatchEvent(new Event('appinstalled')));

        expect(screen.queryByRole('dialog')).toBeNull();
    });
});

describe('InstallPrompt (iPhone/iPad)', () => {
    it('menampilkan petunjuk Bagikan → Tambahkan ke Layar Utama, tanpa tombol pasang', async () => {
        vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15');
        render(<InstallPrompt />);
        await wait(4100);

        const dialog = screen.getByRole('dialog');
        expect(dialog.textContent).toContain('Tambahkan ke Layar Utama');
        expect(screen.queryByRole('button', { name: /Pasang aplikasi/ })).toBeNull();
    });
});
