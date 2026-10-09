import ChatPanel from '@/Components/eco/ChatPanel';
import GlassFrame, { glassPanel } from '@/Components/eco/GlassFrame';
import PageHeader from '@/Components/eco/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Reveal } from '@/lib/motion';
import { ChatMessage, PageProps } from '@/types';
import { Head } from '@inertiajs/react';

// Props dari HelpdeskController@index
export default function HelpdeskIndex({ messages, synced_at }: PageProps<{ messages: ChatMessage[]; synced_at: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    eyebrow="Bantuan"
                    title="Helpdesk"
                    description="Ada pertanyaan atau kendala dengan pesanan? Kirim pesan ke admin dan balasannya muncul langsung di sini."
                />
            }
        >
            <Head title="Helpdesk" />

            <Reveal>
                <GlassFrame className="h-[38rem] sm:h-[42rem]">
                    <section className={`${glassPanel} flex h-full min-h-0 flex-col overflow-hidden`}>
                        <div className="m-3 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-md">
                            <span className="relative grid h-11 w-11 place-items-center rounded-full bg-[#f5f7f2] p-2 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.6)]">
                                <img src="/landingpage/LOGO.png" alt="AISTEL" className="h-full w-full object-contain" />
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b3a2b] bg-[#4de097]" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white">Admin AISTEL</p>
                                <p className="text-xs text-white/65">Pesan Anda dibalas secepatnya</p>
                            </div>
                        </div>
                        <div className="min-h-0 flex-1">
                            <ChatPanel
                                initialMessages={messages}
                                syncedAt={synced_at}
                                fetchUrl={route('helpdesk.messages')}
                                sendUrl={route('helpdesk.store')}
                                viewer="user"
                                emptyHint="Belum ada percakapan. Tulis pesan pertama Anda ke admin di bawah ini."
                                placeholder="Tulis pesan untuk admin…"
                            />
                        </div>
                    </section>
                </GlassFrame>
            </Reveal>
        </AuthenticatedLayout>
    );
}
