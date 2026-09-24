import { SVGAttributes } from 'react';

/** Logo daun AISTEL (sama dengan favicon). Untuk logo + nama, pakai <LogoMark>. */
export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="18" fill="#072d23" />
            <path d="M32 12c-11 7-15 18-11 29 2 5 6 8 11 8s9-3 11-8c4-11 0-22-11-29z" fill="#b4d96f" />
            <path d="M32 20v29" stroke="#072d23" strokeWidth="3" strokeLinecap="round" />
            <path d="M32 32l-6-5M32 39l7-6" stroke="#072d23" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}
