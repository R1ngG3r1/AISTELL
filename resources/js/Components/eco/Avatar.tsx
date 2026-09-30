/** Lingkaran berisi inisial nama. Warna konsisten untuk nama yang sama. */
export default function Avatar({ name, className = '' }: { name: string; className?: string }) {
    const initials = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('');
    const palettes = [
        'bg-leaf-300 text-forest-900',
        'bg-forest-500 text-cream',
        'bg-sun-400 text-forest-900',
        'bg-forest-200 text-forest-900',
    ];
    const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);

    return (
        <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${palettes[hash % palettes.length]} ${className}`}
        >
            {initials || '?'}
        </span>
    );
}
