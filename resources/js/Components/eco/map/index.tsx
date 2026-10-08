import { googleMapsUrl, LatLng } from '@/lib/geo';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ComponentProps, lazy, Suspense } from 'react';

// Leaflet dimuat terpisah (lazy) agar halaman tanpa peta tetap ringan.
const LazyPicker = lazy(() => import('./leaflet').then((m) => ({ default: m.LocationPicker })));
const LazyPreview = lazy(() => import('./leaflet').then((m) => ({ default: m.MapPreview })));

function MapSkeleton({ className }: { className: string }) {
    return <div className={`animate-pulse rounded-2xl bg-forest-50 ring-1 ring-forest-900/10 ${className}`} />;
}

export function LocationPicker(props: ComponentProps<typeof LazyPicker>) {
    return (
        <Suspense fallback={<MapSkeleton className={`mt-[3.75rem] ${props.className ?? 'h-72'}`} />}>
            <LazyPicker {...props} />
        </Suspense>
    );
}

export function MapPreview(props: ComponentProps<typeof LazyPreview>) {
    return (
        <Suspense fallback={<MapSkeleton className={props.className ?? 'h-44'} />}>
            <LazyPreview {...props} />
        </Suspense>
    );
}

/** Tombol "Buka di Google Maps" (petunjuk arah di HP / browser). */
export function GoogleMapsLink({ point, className = '' }: { point: LatLng; className?: string }) {
    return (
        <a href={googleMapsUrl(point)} target="_blank" rel="noopener noreferrer" className={`btn-ghost btn-sm ${className}`}>
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} /> Buka di Google Maps
        </a>
    );
}
