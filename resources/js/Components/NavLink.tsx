import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={`relative inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ${
                active
                    ? 'bg-forest-900 text-cream shadow-soft'
                    : 'text-forest-900/65 hover:bg-forest-900/5 hover:text-forest-900'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
