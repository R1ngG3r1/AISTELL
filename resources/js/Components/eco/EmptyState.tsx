import { ReactNode } from 'react';
import { Sprout } from './Illustrations';

export default function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center px-6 py-12 text-center">
            <Sprout className="h-28 w-28" />
            <h3 className="display mt-4 text-xl text-forest-900">{title}</h3>
            {description && <p className="mt-1 max-w-sm text-sm text-forest-900/55">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
