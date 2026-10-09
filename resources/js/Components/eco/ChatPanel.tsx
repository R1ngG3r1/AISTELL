import { ChatMessage } from '@/types';
import {
    faBan,
    faCheck,
    faChevronDown,
    faFileLines,
    faPaperclip,
    faPaperPlane,
    faPen,
    faTrash,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { ChangeEvent, FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

/** Selang polling pesan baru / perubahan (ms). Cukup cepat agar terasa realtime, tetap ringan untuk server. */
const POLL_MS = 2500;
const TIME_ZONE = 'Asia/Jakarta';
const MAX_FILE_BYTES = 2 * 1024 * 1024; // sama dengan batas server (2 MB)
const ACCEPT = '.jpg,.jpeg,.png,.webp,.gif,.pdf,.txt,.doc,.docx,.xls,.xlsx';

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE });
const dayKey = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
const dayLabel = (iso: string) => {
    const key = dayKey(iso);
    const today = new Date().toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
    const yesterday = new Date(Date.now() - 86_400_000).toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
    if (key === today) return 'Hari ini';
    if (key === yesterday) return 'Kemarin';
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TIME_ZONE });
};
const sizeLabel = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);
const stillOpen = (until: string | null) => !!until && Date.now() <= Date.parse(until);

/** Tambahkan pesan baru tanpa duplikat, lalu ganti pesan lama yang berubah (diedit / dihapus). */
const mergeMessages = (current: ChatMessage[], incoming: ChatMessage[], updated: ChatMessage[] = []) => {
    const byId = new Map(current.map((m) => [m.id, m]));
    let changed = false;
    for (const m of [...incoming, ...updated]) {
        if (JSON.stringify(byId.get(m.id)) !== JSON.stringify(m)) {
            byId.set(m.id, m);
            changed = true;
        }
    }
    return changed ? [...byId.values()].sort((a, b) => a.id - b.id) : current;
};

/** Perkecil foto besar di browser sebelum diunggah (lampiran disimpan di database, jadi harus kecil). */
async function shrinkImage(file: File): Promise<File> {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 300 * 1024) return file;
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return file;
        ctx.fillStyle = '#fff'; // PNG transparan → latar putih (hasil JPEG)
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
        if (!blob || blob.size >= file.size) return file;
        return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
    } catch {
        return file;
    }
}

const errorText = (err: unknown, fallback: string) => {
    if (!axios.isAxiosError(err)) return fallback;
    const errors = err.response?.data?.errors as Record<string, string[]> | undefined;
    return (errors && Object.values(errors)[0]?.[0]) || err.response?.data?.message || fallback;
};

/**
 * Panel chat helpdesk (daftar pesan + kolom ketik) bergaya kaca, dipakai user maupun admin.
 * Pesan baru dan perubahan (edit / hapus) diambil berkala dari `fetchUrl`; pesan dikirim lewat `sendUrl`.
 * Beri `key` berbeda per percakapan agar state ter-reset saat pindah percakapan.
 */
export default function ChatPanel({
    initialMessages,
    syncedAt,
    fetchUrl,
    sendUrl,
    viewer,
    emptyHint,
    placeholder = 'Tulis pesan…',
}: {
    initialMessages: ChatMessage[];
    syncedAt: string;
    fetchUrl: string;
    sendUrl: string;
    viewer: 'user' | 'admin';
    emptyHint: string;
    placeholder?: string;
}) {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [editing, setEditing] = useState<ChatMessage | null>(null);
    const [menuFor, setMenuFor] = useState<number | null>(null);
    const [confirmFor, setConfirmFor] = useState<number | null>(null);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scroller = useRef<HTMLDivElement>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const textarea = useRef<HTMLTextAreaElement>(null);
    const stickToBottom = useRef(true); // true = otomatis gulir ke pesan terbaru
    const lastId = useRef(initialMessages.at(-1)?.id ?? 0);
    const since = useRef(syncedAt);
    const polling = useRef(false);

    const mine = (m: ChatMessage) => (viewer === 'admin' ? m.from_admin : !m.from_admin);

    useEffect(() => {
        lastId.current = messages.at(-1)?.id ?? 0;
        const el = scroller.current;
        if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
    }, [messages]);

    const poll = useCallback(async () => {
        if (polling.current || document.hidden) return;
        polling.current = true;
        try {
            const { data } = await axios.get<{ messages: ChatMessage[]; updated: ChatMessage[]; synced_at: string }>(fetchUrl, {
                params: { after: lastId.current, since: since.current },
            });
            since.current = data.synced_at;
            setMessages((cur) => mergeMessages(cur, data.messages, data.updated));
        } catch {
            /* gangguan jaringan sesaat → coba lagi pada putaran berikutnya */
        } finally {
            polling.current = false;
        }
    }, [fetchUrl]);

    useEffect(() => {
        const id = window.setInterval(poll, POLL_MS);
        document.addEventListener('visibilitychange', poll); // langsung segarkan saat tab dibuka lagi
        return () => {
            window.clearInterval(id);
            document.removeEventListener('visibilitychange', poll);
        };
    }, [poll]);

    // Tutup menu pesan saat klik di luar
    useEffect(() => {
        if (menuFor === null) return;
        const close = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('[data-chat-menu]')) {
                setMenuFor(null);
                setConfirmFor(null);
            }
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [menuFor]);

    // Pratinjau foto yang akan dikirim
    useEffect(() => {
        if (!file || !file.type.startsWith('image/')) return setPreview(null);
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const onScroll = () => {
        const el = scroller.current;
        if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    };

    const pickFile = async (e: ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0];
        e.target.value = '';
        if (!picked) return;
        setError(null);
        const ready = await shrinkImage(picked);
        if (ready.size > MAX_FILE_BYTES) return setError('Ukuran lampiran maksimal 2 MB.');
        setFile(ready);
    };

    const startEdit = (m: ChatMessage) => {
        setMenuFor(null);
        setEditing(m);
        setFile(null);
        setText(m.body ?? '');
        setError(null);
        window.setTimeout(() => textarea.current?.focus(), 0);
    };

    const cancelEdit = () => {
        setEditing(null);
        setText('');
        setError(null);
    };

    const remove = async (m: ChatMessage) => {
        setMenuFor(null);
        setConfirmFor(null);
        try {
            const { data } = await axios.delete<{ message: ChatMessage }>(route('helpdesk.messages.destroy', m.id));
            setMessages((cur) => mergeMessages(cur, [], [data.message]));
            if (editing?.id === m.id) cancelEdit();
        } catch (err) {
            setError(errorText(err, 'Pesan gagal dihapus.'));
        }
    };

    const send = async (e?: FormEvent) => {
        e?.preventDefault();
        const body = text.trim();
        if (sending || (!body && !file && !(editing && editing.attachment))) return;

        setSending(true);
        setError(null);
        try {
            if (editing) {
                const { data } = await axios.patch<{ message: ChatMessage }>(route('helpdesk.messages.update', editing.id), { body });
                setMessages((cur) => mergeMessages(cur, [], [data.message]));
                cancelEdit();
            } else {
                const form = new FormData();
                if (body) form.append('body', body);
                if (file) form.append('file', file);
                const { data } = await axios.post<{ message: ChatMessage }>(sendUrl, form);
                stickToBottom.current = true;
                setMessages((cur) => mergeMessages(cur, [data.message]));
                setText('');
                setFile(null);
            }
        } catch (err) {
            setError(errorText(err, 'Pesan gagal terkirim. Coba lagi.'));
        } finally {
            setSending(false);
        }
    };

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape' && editing) return cancelEdit();
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            void send();
        }
    };

    const canSend = !sending && (text.trim() !== '' || !!file || !!(editing && editing.attachment));

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div ref={scroller} onScroll={onScroll} className="scroll-glass flex-1 space-y-1 overflow-y-auto px-3 py-4 sm:px-5" aria-live="polite">
                {messages.length === 0 ? (
                    <p className="mx-auto mt-10 max-w-xs text-center text-sm text-white/60">{emptyHint}</p>
                ) : (
                    messages.map((m, i) => {
                        const own = mine(m);
                        const newDay = i === 0 || dayKey(messages[i - 1].created_at) !== dayKey(m.created_at);
                        const sameSender = i > 0 && !newDay && messages[i - 1].from_admin === m.from_admin;
                        const canEdit = own && !m.deleted && stillOpen(m.editable_until);
                        const canDelete = own && !m.deleted && stillOpen(m.deletable_until);
                        const hasMenu = canEdit || canDelete;
                        return (
                            <div key={m.id}>
                                {newDay && (
                                    <p className="my-3 text-center">
                                        <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white/80 backdrop-blur-sm">{dayLabel(m.created_at)}</span>
                                    </p>
                                )}
                                <div className={`flex ${own ? 'justify-end' : 'justify-start'} ${sameSender ? '' : 'mt-3'}`}>
                                    <div
                                        className={`group relative max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-[0_4px_14px_-6px_rgba(0,0,0,0.5)] sm:max-w-[72%] ${
                                            own ? 'rounded-br-md bg-[#287e59]/95 text-white' : 'rounded-bl-md bg-white/90 text-[#0c2b20]'
                                        } ${m.deleted ? 'opacity-80' : ''}`}
                                    >
                                        {!own && !sameSender && viewer === 'user' && <p className="mb-0.5 text-[11px] font-bold text-[#287e59]">Admin AISTEL</p>}

                                        {m.deleted ? (
                                            <p className="flex items-center gap-2 italic opacity-80">
                                                <FontAwesomeIcon icon={faBan} className="text-xs" /> Pesan ini telah dihapus
                                            </p>
                                        ) : (
                                            <>
                                                {m.attachment &&
                                                    (m.attachment.image ? (
                                                        <a href={m.attachment.url} target="_blank" rel="noreferrer" className="mb-1 block overflow-hidden rounded-xl">
                                                            <img src={m.attachment.url} alt={m.attachment.name} loading="lazy" className="max-h-64 w-full object-cover" />
                                                        </a>
                                                    ) : (
                                                        <a
                                                            href={m.attachment.url}
                                                            download={m.attachment.name}
                                                            className={`mb-1 flex items-center gap-3 rounded-xl p-2.5 ${own ? 'bg-black/15 hover:bg-black/25' : 'bg-[#287e59]/10 hover:bg-[#287e59]/20'}`}
                                                        >
                                                            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${own ? 'bg-white/20' : 'bg-[#287e59] text-white'}`}>
                                                                <FontAwesomeIcon icon={faFileLines} />
                                                            </span>
                                                            <span className="min-w-0">
                                                                <span className="block truncate text-[13px] font-semibold">{m.attachment.name}</span>
                                                                <span className="text-[11px] opacity-70">{sizeLabel(m.attachment.size)} · Unduh</span>
                                                            </span>
                                                        </a>
                                                    ))}
                                                {m.body && <p className="whitespace-pre-wrap break-words leading-relaxed">{m.body}</p>}
                                            </>
                                        )}

                                        <p className={`mt-0.5 flex items-center justify-end gap-1.5 text-[10px] ${own ? 'text-white/70' : 'text-[#0c2b20]/50'}`}>
                                            {m.edited && <span>diedit</span>}
                                            {timeOf(m.created_at)}
                                        </p>

                                        {hasMenu && (
                                            <div data-chat-menu className="absolute right-1 top-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMenuFor(menuFor === m.id ? null : m.id);
                                                        setConfirmFor(null);
                                                    }}
                                                    aria-label="Opsi pesan"
                                                    aria-expanded={menuFor === m.id}
                                                    className={`grid h-6 w-6 place-items-center rounded-full bg-[#1f6a49] text-[10px] text-white opacity-0 transition focus:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100 ${
                                                        menuFor === m.id ? '!opacity-100' : ''
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={faChevronDown} />
                                                </button>
                                                {menuFor === m.id && (
                                                    <div className="absolute right-0 top-7 z-30 w-44 overflow-hidden rounded-xl bg-white py-1 text-[#0c2b20] shadow-[0_12px_30px_-8px_rgba(0,0,0,0.5)] ring-1 ring-black/5">
                                                        {confirmFor === m.id ? (
                                                            <div className="p-3">
                                                                <p className="text-xs font-semibold">Hapus pesan ini untuk semua orang?</p>
                                                                <div className="mt-2.5 flex gap-2">
                                                                    <button type="button" onClick={() => setConfirmFor(null)} className="flex-1 rounded-lg bg-[#eaf2e6] px-2 py-1.5 text-xs font-semibold">
                                                                        Batal
                                                                    </button>
                                                                    <button type="button" onClick={() => void remove(m)} className="flex-1 rounded-lg bg-[#c24a22] px-2 py-1.5 text-xs font-semibold text-white">
                                                                        Hapus
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {canEdit && (
                                                                    <button type="button" onClick={() => startEdit(m)} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm hover:bg-[#f0f5ec]">
                                                                        <FontAwesomeIcon icon={faPen} className="w-3.5 text-[#287e59]" /> Edit
                                                                    </button>
                                                                )}
                                                                {canDelete && (
                                                                    <button type="button" onClick={() => setConfirmFor(m.id)} className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-[#c24a22] hover:bg-[#fdf1ec]">
                                                                        <FontAwesomeIcon icon={faTrash} className="w-3.5" /> Hapus
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={send} className="p-3 sm:p-4">
                {/* Penanda mode edit / lampiran yang akan dikirim */}
                {editing && (
                    <div className="mb-2 flex items-center gap-3 rounded-2xl bg-white/15 px-3.5 py-2 text-white backdrop-blur-md">
                        <FontAwesomeIcon icon={faPen} className="text-[#4de097]" />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#4de097]">Mengedit pesan</p>
                            <p className="truncate text-xs text-white/70">{editing.body ?? 'Lampiran'}</p>
                        </div>
                        <button type="button" onClick={cancelEdit} aria-label="Batal edit" className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/15">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                )}
                {file && !editing && (
                    <div className="mb-2 flex items-center gap-3 rounded-2xl bg-white/15 px-3 py-2 text-white backdrop-blur-md">
                        {preview ? (
                            <img src={preview} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                            <span className="grid h-12 w-12 place-items-center rounded-lg bg-white/20 text-lg">
                                <FontAwesomeIcon icon={faFileLines} />
                            </span>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{file.name}</p>
                            <p className="text-xs text-white/60">{sizeLabel(file.size)}</p>
                        </div>
                        <button type="button" onClick={() => setFile(null)} aria-label="Hapus lampiran" className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/15">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                )}
                {error && <p className="mb-2 rounded-xl bg-[#c24a22]/90 px-3 py-1.5 text-xs font-semibold text-white">{error}</p>}

                <div className="flex items-end gap-2">
                    <div className="flex min-h-[48px] flex-1 items-end gap-1 rounded-2xl bg-white/15 px-2 py-1.5 ring-1 ring-white/20 backdrop-blur-md focus-within:ring-white/40">
                        <input ref={fileInput} type="file" accept={ACCEPT} onChange={pickFile} className="sr-only" tabIndex={-1} />
                        <button
                            type="button"
                            onClick={() => fileInput.current?.click()}
                            disabled={!!editing}
                            aria-label="Lampirkan file"
                            title="Lampirkan foto atau dokumen (maks. 2 MB)"
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white/70 transition hover:bg-white/15 hover:text-white disabled:opacity-30"
                        >
                            <FontAwesomeIcon icon={faPaperclip} />
                        </button>
                        <textarea
                            ref={textarea}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={onKeyDown}
                            rows={Math.min(4, Math.max(1, text.split('\n').length))}
                            maxLength={2000}
                            placeholder={editing ? 'Ubah pesan…' : placeholder}
                            aria-label="Tulis pesan"
                            className="max-h-28 min-h-[36px] flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm text-white placeholder-white/45 focus:ring-0"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!canSend}
                        aria-label={editing ? 'Simpan perubahan' : 'Kirim pesan'}
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#07271e] text-[#4de097] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.7)] ring-1 ring-white/20 transition hover:bg-[#287e59] hover:text-white disabled:opacity-40"
                    >
                        <FontAwesomeIcon icon={editing ? faCheck : faPaperPlane} />
                    </button>
                </div>
            </form>
        </div>
    );
}
