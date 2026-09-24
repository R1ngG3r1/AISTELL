import { HTMLAttributes } from 'react';

export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p {...props} className={`animate-fade-up text-sm font-medium text-clay-600 ${className}`}>
            {message}
        </p>
    ) : null;
}
