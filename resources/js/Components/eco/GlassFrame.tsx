import { ReactNode } from 'react';

/** Kelas panel kaca (buram + garis tipis) yang dipakai di dalam GlassFrame. */
export const glassPanel = 'rounded-3xl border border-white/20 bg-[#07271e]/45 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl';

/** Bingkai bergaya kaca: latar daun gelap seperti sidebar, panel buram di atasnya. */
export default function GlassFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`relative isolate overflow-hidden rounded-[2rem] p-3 shadow-lift ring-1 ring-white/15 sm:p-4 ${className}`}>
            <div aria-hidden className="absolute inset-0 -z-20 bg-[#07271e] bg-[url('/landingpage/latardaun.jpeg')] bg-[length:520px_auto] bg-repeat opacity-90" />
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0a3a2b]/70 via-[#0b4a37]/50 to-[#051d16]/80" />
            {children}
        </div>
    );
}
