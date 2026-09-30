import { SVGAttributes } from 'react';

export default function ApplicationLogo({
    className = 'h-9 w-auto',
    color = '#287e59',
    ...props
}: SVGAttributes<SVGElement> & { color?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill={props.fill || color}
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <circle cx="8" cy="8" r="4.8" />
            <circle cx="16" cy="8" r="4.8" />
            <circle cx="8" cy="16" r="4.8" />
            <circle cx="16" cy="16" r="4.8" />
        </svg>
    );
}
