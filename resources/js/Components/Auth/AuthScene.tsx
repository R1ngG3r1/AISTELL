import { useEffect, useState } from "react";
import FloatingLeaves from "./FloatingLeaves";

interface AuthSceneProps {
    mode: "login" | "register";
    burstTrigger?: number;
    children?: React.ReactNode;
}

export default function AuthScene({ mode, burstTrigger = 0, children }: AuthSceneProps) {
    const isDay = mode === "login";
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 15;
            setMousePos({ x, y });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="relative h-screen max-h-screen w-full overflow-hidden bg-[#061811] text-white selection:bg-[#2ea368]/30">
            {/* 1. Base Forest Image with Gentle Breathing & Parallax */}
            <div
                className="pointer-events-none absolute -inset-8 bg-cover bg-center transition-transform duration-700 ease-out"
                style={{
                    backgroundImage: `url('/assets/auth/pohon.jpg')`,
                    transform: `translate3d(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px, 0) scale(1.05)`,
                    filter: isDay ? "brightness(0.95) contrast(1.05)" : "brightness(0.75) contrast(1.15) hue-rotate(8deg)",
                    transition: "filter 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease-out",
                }}
            />

            {/* 2. Morning / Sunbeam Layer (Active during 'login') */}
            <div
                className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isDay ? "opacity-100" : "opacity-0"
                }`}
            >
                {/* Sun god rays radiating from canopy */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(255, 245, 200, 0.4) 0%, rgba(200, 240, 180, 0.2) 40%, transparent 80%)",
                    }}
                />
                {/* Diagonal sun shafts */}
                <div
                    className="absolute inset-0 opacity-40 mix-blend-screen"
                    style={{
                        background:
                            "repeating-linear-gradient(115deg, rgba(255, 255, 230, 0.12) 0px, rgba(255, 255, 230, 0.12) 35px, transparent 35px, transparent 110px)",
                    }}
                />
                {/* Warm morning light sweep */}
                <div
                    className="absolute inset-0 opacity-30 mix-blend-soft-light"
                    style={{
                        background: "linear-gradient(180deg, rgba(255, 230, 160, 0.4) 0%, transparent 60%, rgba(10, 40, 25, 0.8) 100%)",
                    }}
                />
            </div>

            {/* 3. Twilight / Enchanted Night Forest Layer (Active during 'register') */}
            <div
                className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    !isDay ? "opacity-100" : "opacity-0"
                }`}
            >
                {/* Deep mystical twilight hue */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 85% 65% at 50% 15%, rgba(46, 163, 104, 0.25) 0%, rgba(10, 45, 35, 0.5) 50%, rgba(4, 20, 15, 0.85) 100%)",
                    }}
                />
                {/* Moonlight beam from above */}
                <div
                    className="absolute inset-0 opacity-50 mix-blend-screen"
                    style={{
                        background:
                            "radial-gradient(circle 500px at 50% -10%, rgba(150, 255, 220, 0.28) 0%, transparent 70%)",
                    }}
                />
                {/* Bioluminescent forest floor glow */}
                <div
                    className="absolute bottom-0 inset-x-0 h-1/2 opacity-60 mix-blend-screen"
                    style={{
                        background:
                            "radial-gradient(ellipse 100% 50% at 50% 100%, rgba(77, 224, 151, 0.2) 0%, transparent 70%)",
                    }}
                />
            </div>

            {/* 4. Vignette & Contrast Control for Card Readability */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(circle at center, transparent 35%, rgba(4, 18, 12, 0.45) 75%, rgba(3, 14, 9, 0.85) 100%)",
                }}
            />

            {/* 5. Interactive Particle Canvas (Floating Leaves & Fireflies/Pollen) */}
            <FloatingLeaves mode={mode} burstTrigger={burstTrigger} />

            {/* 6. Cinematic Blurred Foreground Leaves for Depth of Field */}
            {/* Top Left Foreground Branch */}
            <div
                className="pointer-events-none fixed -left-12 -top-12 z-20 w-44 md:w-64 opacity-75 blur-[1.5px] transition-transform duration-300"
                style={{
                    transform: `translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 0) rotate(-15deg)`,
                }}
            >
                <img
                    src="/assets/auth/leaves/leaf_2.png"
                    alt=""
                    className="w-full h-auto drop-shadow-2xl animate-pulse"
                    style={{ animationDuration: "6s" }}
                />
            </div>

            {/* Bottom Right Foreground Maple Leaf */}
            <div
                className="pointer-events-none fixed -right-8 -bottom-8 z-20 w-36 md:w-56 opacity-70 blur-[1px] transition-transform duration-300"
                style={{
                    transform: `translate3d(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px, 0) rotate(25deg)`,
                }}
            >
                <img
                    src="/assets/auth/leaves/leaf_8.png"
                    alt=""
                    className="w-full h-auto drop-shadow-2xl"
                />
            </div>

            {/* Content Slot */}
            <div className="relative z-30 flex h-full max-h-screen flex-col justify-between overflow-hidden">{children}</div>
        </div>
    );
}
