import Modal from "@/Components/Modal";
import {
    faArrowsUpDownLeftRight,
    faMagnifyingGlassMinus,
    faMagnifyingGlassPlus,
    faRotateLeft,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    KeyboardEvent,
    PointerEvent as ReactPointerEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

const MAX_FRAME = 280; // ukuran maksimal area pangkas di layar (px); mengecil di HP sempit
const PREVIEW = 72; // ukuran pratinjau kecil (px)
const OUTPUT = 512; // ukuran foto hasil pangkas yang diunggah (px)
const MAX_ZOOM = 4;

type Offset = { x: number; y: number };

/**
 * Dialog untuk memangkas foto profil sebelum diunggah.
 * Geser foto untuk mengatur posisi, perbesar/perkecil dengan slider, tombol, atau scroll mouse.
 * Hasilnya dipotong di browser menjadi persegi 512×512 (JPG), lalu dikirim lewat `onConfirm`.
 */
export default function AvatarCropModal({
    src,
    processing = false,
    progress = null,
    error,
    onConfirm,
    onClose,
}: {
    src: string | null;
    processing?: boolean;
    progress?: number | null;
    error?: string;
    onConfirm: (file: File) => void;
    onClose: () => void;
}) {
    // Ukuran area pangkas: 280px, atau lebih kecil agar muat di HP sempit (mis. lebar 320px).
    const [FRAME] = useState(() => Math.min(MAX_FRAME, window.innerWidth - 80));
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
    const frameRef = useRef<HTMLDivElement>(null);
    const drag = useRef<{ x: number; y: number; start: Offset } | null>(null);

    // Muat gambar setiap kali file baru dipilih, lalu kembalikan posisi ke tengah.
    useEffect(() => {
        setImage(null);
        if (!src) return;
        const img = new Image();
        img.onload = () => {
            setImage(img);
            setZoom(1);
            setOffset({ x: 0, y: 0 });
        };
        img.src = src;
    }, [src]);

    // Skala dasar = "cover": sisi terpendek foto pas memenuhi bingkai.
    const baseScale = image
        ? Math.max(FRAME / image.naturalWidth, FRAME / image.naturalHeight)
        : 1;
    const scale = baseScale * zoom;

    /** Batasi geseran agar bingkai selalu tertutup foto (tidak ada area kosong). */
    const clamp = useCallback(
        (next: Offset, z = zoom): Offset => {
            if (!image) return next;
            const s = baseScale * z;
            const maxX = Math.max(0, (image.naturalWidth * s - FRAME) / 2);
            const maxY = Math.max(0, (image.naturalHeight * s - FRAME) / 2);
            return {
                x: Math.min(maxX, Math.max(-maxX, next.x)),
                y: Math.min(maxY, Math.max(-maxY, next.y)),
            };
        },
        [image, baseScale, zoom, FRAME],
    );

    const applyZoom = useCallback(
        (z: number) => {
            const next = Math.min(MAX_ZOOM, Math.max(1, z));
            setZoom(next);
            setOffset((o) => clamp(o, next));
        },
        [clamp],
    );

    // Scroll mouse untuk zoom (listener native agar bisa preventDefault, tidak menggulir halaman).
    useEffect(() => {
        const el = frameRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            applyZoom(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08));
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [applyZoom, zoom, image]);

    const onPointerDown = (e: ReactPointerEvent) => {
        if (processing) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, y: e.clientY, start: offset };
    };
    const onPointerMove = (e: ReactPointerEvent) => {
        if (!drag.current) return;
        const d = drag.current;
        setOffset(
            clamp({
                x: d.start.x + e.clientX - d.x,
                y: d.start.y + e.clientY - d.y,
            }),
        );
    };
    const onPointerUp = () => {
        drag.current = null;
    };

    // Geser dengan tombol panah (aksesibilitas keyboard).
    const onKeyDown = (e: KeyboardEvent) => {
        const step = e.shiftKey ? 20 : 5;
        const moves: Record<string, Offset> = {
            ArrowLeft: { x: step, y: 0 },
            ArrowRight: { x: -step, y: 0 },
            ArrowUp: { x: 0, y: step },
            ArrowDown: { x: 0, y: -step },
        };
        const m = moves[e.key];
        if (!m) return;
        e.preventDefault();
        setOffset((o) => clamp({ x: o.x + m.x, y: o.y + m.y }));
    };

    const reset = () => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    };

    /** Potong area di dalam bingkai menjadi file JPG persegi. */
    const confirm = () => {
        if (!image) return;
        const canvas = document.createElement("canvas");
        canvas.width = OUTPUT;
        canvas.height = OUTPUT;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Posisi sudut kiri-atas foto relatif terhadap bingkai.
        const left = FRAME / 2 + offset.x - (image.naturalWidth * scale) / 2;
        const top = FRAME / 2 + offset.y - (image.naturalHeight * scale) / 2;
        const size = FRAME / scale; // sisi bingkai dalam piksel asli foto

        ctx.fillStyle = "#ffffff"; // latar putih untuk PNG transparan
        ctx.fillRect(0, 0, OUTPUT, OUTPUT);
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(
            image,
            -left / scale,
            -top / scale,
            size,
            size,
            0,
            0,
            OUTPUT,
            OUTPUT,
        );

        canvas.toBlob(
            (blob) =>
                blob &&
                onConfirm(
                    new File([blob], "foto-profil.jpg", { type: "image/jpeg" }),
                ),
            "image/jpeg",
            0.9,
        );
    };

    // Transform foto di bingkai utama & di pratinjau kecil (pratinjau = bingkai yang diperkecil).
    const transform = (ratio: number) => ({
        width: image ? image.naturalWidth * scale * ratio : 0,
        height: image ? image.naturalHeight * scale * ratio : 0,
        transform: `translate(calc(-50% + ${offset.x * ratio}px), calc(-50% + ${offset.y * ratio}px))`,
    });

    return (
        <Modal
            show={src !== null}
            onClose={processing ? () => {} : onClose}
            closeable={!processing}
            maxWidth="md"
        >
            <div className="p-5 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="font-display text-2xl font-bold text-[#0c2b20]">
                            Sesuaikan foto profil
                        </h2>
                        <p className="mt-1 text-sm text-[#4c6156]">
                            Geser dan perbesar foto sampai pas di dalam
                            lingkaran.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#0c2b20]/60 transition hover:bg-[#0c2b20]/5 disabled:opacity-40"
                        aria-label="Tutup"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                {/* Area pangkas */}
                <div
                    ref={frameRef}
                    tabIndex={0}
                    role="application"
                    aria-label="Area pangkas foto. Seret atau gunakan tombol panah untuk menggeser."
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onKeyDown={onKeyDown}
                    className="relative mx-auto mt-5 cursor-grab touch-none select-none overflow-hidden rounded-3xl bg-[#07271e] outline-none ring-[#4de097] focus-visible:ring-4 active:cursor-grabbing"
                    style={{ width: FRAME, height: FRAME }}
                >
                    {image ? (
                        <img
                            src={src ?? undefined}
                            alt=""
                            draggable={false}
                            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
                            style={transform(1)}
                        />
                    ) : (
                        <div className="grid h-full place-items-center text-sm text-white/60">
                            Memuat foto…
                        </div>
                    )}

                    {/* Lapisan gelap di luar lingkaran + garis bantu */}
                    <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_999px_rgba(4,27,21,0.6)]" />
                    <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/80" />
                    <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <span key={i} className="border border-white/30" />
                        ))}
                    </div>

                    {image && !processing && (
                        <span className="pointer-events-none absolute bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white">
                            <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />{" "}
                            Seret untuk menggeser
                        </span>
                    )}
                </div>

                {/* Zoom */}
                <div className="mx-auto mt-5 flex items-center gap-3" style={{ maxWidth: FRAME }}>
                    <button
                        type="button"
                        onClick={() => applyZoom(zoom - 0.2)}
                        disabled={!image || processing || zoom <= 1}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#287e59] transition hover:bg-[#eaf2e6] disabled:opacity-30"
                        aria-label="Perkecil"
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
                    </button>
                    <input
                        type="range"
                        min={1}
                        max={MAX_ZOOM}
                        step={0.01}
                        value={zoom}
                        disabled={!image || processing}
                        onChange={(e) => applyZoom(Number(e.target.value))}
                        className="h-1.5 flex-1 cursor-pointer accent-[#287e59]"
                        aria-label="Perbesar foto"
                    />
                    <button
                        type="button"
                        onClick={() => applyZoom(zoom + 0.2)}
                        disabled={!image || processing || zoom >= MAX_ZOOM}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#287e59] transition hover:bg-[#eaf2e6] disabled:opacity-30"
                        aria-label="Perbesar"
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                    </button>
                </div>

                {/* Pratinjau hasil */}
                <div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#e1e8db] bg-[#f6f8f2] p-3">
                    <div
                        className="relative shrink-0 overflow-hidden rounded-full bg-[#eaf2e6] ring-2 ring-white"
                        style={{ width: PREVIEW, height: PREVIEW }}
                    >
                        {image && (
                            <img
                                src={src ?? undefined}
                                alt="Pratinjau"
                                className="absolute left-1/2 top-1/2 max-w-none"
                                style={transform(PREVIEW / FRAME)}
                            />
                        )}
                    </div>
                    <div className="min-w-0 flex-1 text-xs text-[#4c6156]">
                        <p className="font-bold text-[#0c2b20]">Pratinjau</p>
                    </div>
                    <button
                        type="button"
                        onClick={reset}
                        disabled={!image || processing}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-[#287e59] transition hover:bg-[#eaf2e6] disabled:opacity-30"
                    >
                        <FontAwesomeIcon icon={faRotateLeft} /> Reset
                    </button>
                </div>

                {error && (
                    <p className="mt-3 text-sm font-semibold text-clay-600">
                        {error}
                    </p>
                )}

                {processing && (
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e4ebde]">
                        <div
                            className="h-full rounded-full bg-[#287e59] transition-all"
                            style={{ width: `${progress ?? 0}%` }}
                        />
                    </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="btn-ghost"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={confirm}
                        disabled={!image || processing}
                        className="btn-primary"
                    >
                        {processing
                            ? `Mengunggah… ${progress ?? 0}%`
                            : "Simpan foto"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
