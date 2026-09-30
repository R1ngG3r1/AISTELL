import { useEffect, useRef } from "react";

interface FloatingLeavesProps {
    mode: "login" | "register";
    burstTrigger?: number;
}

interface LeafParticle {
    x: number;
    y: number;
    z: number; // 0.3 (deep background) to 1.0 (crisp midground)
    size: number;
    vx: number;
    vy: number;
    baseVx: number;
    baseVy: number;
    rotation: number;
    vRot: number;
    flipAngle: number;
    vFlip: number;
    swaySpeed: number;
    swayOffset: number;
    imgIndex: number;
    opacity: number;
}

interface GlowParticle {
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
    alpha: number;
    alphaTarget: number;
    pulseSpeed: number;
    hue: number; // 45 for golden sun pollen, 155 for enchanted emerald firefly
}

export default function FloatingLeaves({ mode, burstTrigger = 0 }: FloatingLeavesProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const leavesRef = useRef<LeafParticle[]>([]);
    const glowParticlesRef = useRef<GlowParticle[]>([]);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
        x: -9999,
        y: -9999,
        active: false,
    });
    const animFrameRef = useRef<number | null>(null);

    // Preload leaf images
    useEffect(() => {
        const leafImages: HTMLImageElement[] = [];
        const leafCount = 8;
        let loaded = 0;

        for (let i = 1; i <= leafCount; i++) {
            const img = new Image();
            img.src = `/assets/auth/leaves/leaf_${i}.png`;
            img.onload = () => {
                loaded++;
            };
            leafImages.push(img);
        }
        imagesRef.current = leafImages;
    }, []);

    // Trigger wind burst when mode or burstTrigger changes
    useEffect(() => {
        if (leavesRef.current.length === 0) return;

        // Gust of wind across the screen
        leavesRef.current.forEach((leaf) => {
            const direction = mode === "register" ? 1 : -1;
            leaf.vx += (Math.random() * 4 + 2) * direction;
            leaf.vy += (Math.random() * 3 - 2);
            leaf.vRot += (Math.random() * 0.1 - 0.05);
            leaf.vFlip += Math.random() * 0.15 + 0.05;
        });
    }, [mode, burstTrigger]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        };

        window.addEventListener("resize", handleResize);

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = {
                x: e.clientX,
                y: e.clientY,
                active: true,
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current.active = false;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        const initParticles = () => {
            // Initialize 24 leaves
            const leaves: LeafParticle[] = [];
            const count = Math.min(28, Math.floor(width / 50));

            for (let i = 0; i < count; i++) {
                const z = Math.random() * 0.65 + 0.35; // 0.35 to 1.0
                const baseSize = 45 + Math.random() * 35;
                leaves.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    z,
                    size: baseSize * z,
                    vx: (Math.random() * 0.4 - 0.2) * z,
                    vy: (Math.random() * 0.5 + 0.3) * z,
                    baseVx: (Math.random() * 0.4 - 0.2) * z,
                    baseVy: (Math.random() * 0.5 + 0.3) * z,
                    rotation: Math.random() * Math.PI * 2,
                    vRot: (Math.random() * 0.015 - 0.0075) * z,
                    flipAngle: Math.random() * Math.PI * 2,
                    vFlip: Math.random() * 0.02 + 0.01,
                    swaySpeed: Math.random() * 0.015 + 0.008,
                    swayOffset: Math.random() * Math.PI * 2,
                    imgIndex: Math.floor(Math.random() * 8),
                    opacity: 0.45 + z * 0.5,
                });
            }
            leavesRef.current = leaves;

            // Initialize 35 glowing spores / fireflies
            const glowParticles: GlowParticle[] = [];
            const glowCount = 35;
            for (let i = 0; i < glowCount; i++) {
                glowParticles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 2.5 + 1.2,
                    vx: (Math.random() * 0.4 - 0.2),
                    vy: -(Math.random() * 0.5 + 0.2), // gentle upward float
                    alpha: Math.random() * 0.8,
                    alphaTarget: Math.random() * 0.8 + 0.2,
                    pulseSpeed: Math.random() * 0.03 + 0.01,
                    hue: mode === "login" ? 45 : 155, // Gold sun pollen or Emerald fireflies
                });
            }
            glowParticlesRef.current = glowParticles;
        };

        initParticles();

        let time = 0;

        const render = () => {
            time += 0.016;
            ctx.clearRect(0, 0, width, height);

            const isDay = mode === "login";
            const targetHue = isDay ? 45 : 155;

            // 1. Render Glow Particles (Pollen / Fireflies)
            glowParticlesRef.current.forEach((p) => {
                // Update position
                p.x += p.vx + Math.sin(time + p.y * 0.01) * 0.3;
                p.y += p.vy;

                // Wrap around
                if (p.y < -20) {
                    p.y = height + 20;
                    p.x = Math.random() * width;
                }
                if (p.x < -20) p.x = width + 20;
                if (p.x > width + 20) p.x = -20;

                // Smoothly shift hue between Day and Night
                p.hue += (targetHue - p.hue) * 0.05;

                // Pulse alpha
                p.alpha += (p.alphaTarget - p.alpha) * p.pulseSpeed;
                if (Math.abs(p.alphaTarget - p.alpha) < 0.05) {
                    p.alphaTarget = Math.random() * 0.85 + 0.15;
                }

                // Draw glowing spore
                ctx.save();
                ctx.beginPath();
                const grad = ctx.createRadialGradient(
                    p.x,
                    p.y,
                    0,
                    p.x,
                    p.y,
                    p.radius * 3.5
                );
                const colorCore = `hsla(${p.hue}, 90%, 75%, ${p.alpha})`;
                const colorAura = `hsla(${p.hue}, 90%, 60%, 0)`;
                grad.addColorStop(0, colorCore);
                grad.addColorStop(0.4, `hsla(${p.hue}, 90%, 65%, ${p.alpha * 0.4})`);
                grad.addColorStop(1, colorAura);

                ctx.fillStyle = grad;
                ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // 2. Render Floating Leaves
            const mouse = mouseRef.current;
            const images = imagesRef.current;

            leavesRef.current.forEach((leaf) => {
                // Natural sway
                const sway = Math.sin(time * 60 * leaf.swaySpeed + leaf.swayOffset);
                leaf.x += leaf.vx + sway * 0.8 * leaf.z;
                leaf.y += leaf.vy;
                leaf.rotation += leaf.vRot;
                leaf.flipAngle += leaf.vFlip;

                // Mouse wind repulsion
                if (mouse.active) {
                    const dx = leaf.x - mouse.x;
                    const dy = leaf.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const minDist = 180 * leaf.z;

                    if (dist < minDist && dist > 1) {
                        const force = (1 - dist / minDist) * 2.5 * leaf.z;
                        leaf.vx += (dx / dist) * force;
                        leaf.vy += (dy / dist) * force;
                        leaf.vRot += (Math.random() - 0.5) * 0.03;
                    }
                }

                // Restore to base speed
                leaf.vx += (leaf.baseVx - leaf.vx) * 0.03;
                leaf.vy += (leaf.baseVy - leaf.vy) * 0.03;

                // Screen boundaries / wrap-around
                if (leaf.y > height + 80) {
                    leaf.y = -80;
                    leaf.x = Math.random() * width;
                    leaf.vx = leaf.baseVx;
                    leaf.vy = leaf.baseVy;
                }
                if (leaf.x < -100) leaf.x = width + 80;
                if (leaf.x > width + 100) leaf.x = -80;

                // Draw leaf if image is ready
                const img = images[leaf.imgIndex];
                if (img && img.complete && img.naturalWidth > 0) {
                    ctx.save();
                    ctx.translate(leaf.x, leaf.y);
                    ctx.rotate(leaf.rotation);

                    // 3D tumble flip effect
                    const flipScale = Math.cos(leaf.flipAngle);
                    ctx.scale(1, flipScale);

                    // Depth blur / opacity
                    ctx.globalAlpha = leaf.opacity;

                    // Slight drop shadow for realistic floating depth
                    ctx.shadowColor = "rgba(0, 20, 10, 0.25)";
                    ctx.shadowBlur = 8 * leaf.z;
                    ctx.shadowOffsetX = 3 * leaf.z;
                    ctx.shadowOffsetY = 6 * leaf.z;

                    const w = leaf.size;
                    const aspect = img.naturalHeight / img.naturalWidth;
                    const h = w * aspect;

                    ctx.drawImage(img, -w / 2, -h / 2, w, h);
                    ctx.restore();
                }
            });

            animFrameRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [mode]);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-10 h-full w-full"
            style={{ mixBlendMode: "normal" }}
        />
    );
}
