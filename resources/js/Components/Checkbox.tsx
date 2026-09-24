import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={`h-4 w-4 rounded-md border-forest-900/20 text-forest-600 shadow-sm focus:ring-forest-500/30 ${className}`}
        />
    );
}
