import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-center rounded-2xl px-4 py-3 text-start text-base font-semibold transition ${
                active ? 'bg-forest-900 text-cream' : 'text-forest-900/75 hover:bg-forest-900/5'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
