import Avatar from '@/Components/eco/Avatar';
import ChatPanel from '@/Components/eco/ChatPanel';
import GlassFrame, { glassPanel } from '@/Components/eco/GlassFrame';
import PageHeader from '@/Components/eco/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Reveal } from '@/lib/motion';
import { ChatMessage, HelpdeskThreadSummary, PageProps, User } from '@/types';
import { faArrowLeft, faComments, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link, usePoll } from '@inertiajs/react';
import { useState } from 'react';

// Props dari AdminHelpdeskController@index
type Props = PageProps<{
    threads: HelpdeskThreadSummary[];
    selected: { id: number; user: Pick<User, 'id' | 'name' | 'email' | 'avatar_url'> } | null;
    messages: ChatMessage[];
    synced_at: string;
}>;

const TZ = 'Asia/Jakarta';
const shortTime = (iso: string) => {
    const d = new Date(iso);
    const sameDay = d.toLocaleDateString('en-CA', { timeZone: TZ }) === new Date().toLocaleDateString('en-CA', { timeZone: TZ });
    return sameDay
        ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: TZ })
        : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: TZ });
};

export default function AdminHelpdeskIndex({ threads, selected, messages, synced_at }: Props) {
    const [query, setQuery] = useState('');

    // Daftar percakapan diperbarui berkala (pesan baru / badge belum dibaca); isi chat punya polling sendiri.
    usePoll(10_000, { only: ['threads'], showProgress: false });

    const q = query.trim().toLowerCase();
    const shown = q ? threads.filter((t) => `${t.user.name} ${t.user.email}`.toLowerCase().includes(q)) : threads;

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    eyebrow="Kelola Helpdesk"
                    title="Pesan dari pengguna"
                    description={`${threads.length} percakapan. Pilih salah satu untuk membalas, pesan baru masuk otomatis.`}
                />
            }
        >
            <Head title="Helpdesk" />

            <Reveal>
                <GlassFrame className="h-[38rem] sm:h-[42rem]">
                    <div className="grid h-full min-h-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-[20rem_minmax(0,1fr)]">
                        {/* Daftar percakapan: di HP disembunyikan saat sebuah percakapan terbuka */}
                        <aside className={`${glassPanel} min-h-0 flex-col overflow-hidden md:flex ${selected ? 'hidden' : 'flex'}`}>
                            <div className="p-3">
                                <label className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/15 px-3.5 py-2.5 text-white backdrop-blur-md focus-within:border-white/40">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm text-white/60" />
                                    <input
                                        type="search"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Cari pengguna…"
                                        aria-label="Cari percakapan"
                                        className="w-full border-0 bg-transparent p-0 text-sm text-white placeholder-white/50 focus:ring-0"
                                    />
                                </label>
                            </div>

                            <div className="scroll-glass min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-3">
                                {shown.length === 0 ? (
                                    <p className="px-3 py-10 text-center text-sm text-white/60">
                                        {threads.length === 0 ? 'Belum ada pesan masuk dari pengguna.' : 'Tidak ada pengguna yang cocok.'}
                                    </p>
                                ) : (
                                    shown.map((t) => {
                                        const active = selected?.id === t.id;
                                        return (
                                            <Link
                                                key={t.id}
                                                href={route('admin.helpdesk.index', { thread: t.id })}
                                                preserveScroll
                                                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${
                                                    active ? 'border-white/35 bg-white/25' : 'border-white/10 bg-white/10 hover:bg-white/20'
                                                }`}
                                            >
                                                <Avatar name={t.user.name} src={t.user.avatar_url} className="h-11 w-11 ring-2 ring-white/20" />
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-baseline justify-between gap-2">
                                                        <span className={`truncate text-sm text-white ${t.unread_count ? 'font-extrabold' : 'font-semibold'}`}>{t.user.name}</span>
                                                        {t.last_message && <span className="shrink-0 text-[11px] text-white/55">{shortTime(t.last_message.created_at)}</span>}
                                                    </span>
                                                    <span className="mt-0.5 flex items-center justify-between gap-2">
                                                        <span className={`truncate text-xs ${t.unread_count ? 'font-semibold text-white/90' : 'text-white/60'}`}>
                                                            {t.last_message ? `${t.last_message.from_admin ? 'Anda: ' : ''}${t.last_message.body}` : '-'}
                                                        </span>
                                                        {t.unread_count > 0 && (
                                                            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-[#4de097] px-1.5 text-[11px] font-bold text-[#07271e]">
                                                                {t.unread_count}
                                                            </span>
                                                        )}
                                                    </span>
                                                </span>
                                            </Link>
                                        );
                                    })
                                )}
                            </div>
                        </aside>

                        {/* Percakapan terpilih */}
                        <section className={`${glassPanel} min-h-0 flex-col overflow-hidden ${selected ? 'flex' : 'hidden md:flex'}`}>
                            {selected ? (
                                <>
                                    <div className="m-3 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/15 px-3.5 py-2.5 backdrop-blur-md">
                                        <Link
                                            href={route('admin.helpdesk.index')}
                                            className="grid h-8 w-8 place-items-center rounded-full text-white/80 hover:bg-white/15 md:hidden"
                                            aria-label="Kembali ke daftar"
                                        >
                                            <FontAwesomeIcon icon={faArrowLeft} />
                                        </Link>
                                        <Avatar name={selected.user.name} src={selected.user.avatar_url} className="h-11 w-11 ring-2 ring-white/20" />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-white">{selected.user.name}</p>
                                            <p className="truncate text-xs text-white/65">{selected.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="min-h-0 flex-1">
                                        <ChatPanel
                                            key={selected.id}
                                            initialMessages={messages}
                                            syncedAt={synced_at}
                                            fetchUrl={route('admin.helpdesk.messages', selected.id)}
                                            sendUrl={route('admin.helpdesk.store', selected.id)}
                                            viewer="admin"
                                            emptyHint="Belum ada pesan di percakapan ini."
                                            placeholder={`Balas ${selected.user.name}…`}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="m-auto max-w-xs px-6 text-center text-white/60">
                                    <FontAwesomeIcon icon={faComments} className="text-4xl text-[#4de097]/70" />
                                    <p className="mt-3 text-sm">Pilih percakapan di sebelah kiri untuk mulai membalas.</p>
                                </div>
                            )}
                        </section>
                    </div>
                </GlassFrame>
            </Reveal>
        </AuthenticatedLayout>
    );
}
