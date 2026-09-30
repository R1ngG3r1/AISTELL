import { useState, useEffect, FormEventHandler } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthScene from "@/Components/Auth/AuthScene";

interface AuthLayoutUnifiedProps {
    initialMode: "login" | "register";
    status?: string;
    canResetPassword?: boolean;
}

// Botanical Pointed Leaf Badge on the left of input fields
// Authentic High-Definition Botanical Leaf Badges with 3D Embossed Golden Seals
function LeafBadge({ type }: { type: "user" | "lock" | "mail" | "shield" }) {
    const badgeMap = {
        user: "/assets/auth/leaf_user_final.png",
        lock: "/assets/auth/leaf_lock_final.png",
        mail: "/assets/auth/leaf_mail_final.png",
        shield: "/assets/auth/leaf_shield_final.png",
    };

    return (
        <div className="absolute -left-3 sm:-left-3.5 md:-left-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center pointer-events-none filter drop-shadow-[0_3px_5px_rgba(10,30,10,0.65)]">
            <img
                src={badgeMap[type]}
                alt={`${type} emblem`}
                className="w-8 h-10 sm:w-9 sm:h-11 md:w-10 md:h-12 object-contain transform -rotate-12 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
            />
        </div>
    );
}

// Sculpted Wooden Twig Frame that curls above the input pill
function TwigFrame() {
    return (
        <svg
            className="pointer-events-none absolute -top-1.5 left-4 right-1 h-3.5 z-20 overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 200 12"
            fill="none"
        >
            {/* Main curving twig branch */}
            <path
                d="M 0 10 Q 50 1.5 110 4.5 Q 165 7.5 198 10"
                stroke="#6d431f"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            {/* Top bark highlight */}
            <path
                d="M 1 9.5 Q 50 1 110 4 Q 165 7 197 9.5"
                stroke="#a67746"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.75"
            />
            {/* Small offshoot twigs */}
            <path d="M 75 3.5 Q 85 -0.5 95 0.5" stroke="#5a3415" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M 160 6.5 Q 170 2 178 3" stroke="#5a3415" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    );
}

// Authentic Plump 3D Foliage Leaf Button ("Masuk >" / "Daftar >") with Realistic Vine & Embossed Gold Type
function LeafButton({
    text,
    processing,
    onClick,
    type = "submit",
}: {
    text: string;
    processing?: boolean;
    onClick?: () => void;
    type?: "submit" | "button";
}) {
    return (
        <button
            type={type}
            disabled={processing}
            onClick={onClick}
            className="group relative w-full max-w-[210px] sm:max-w-[235px] md:max-w-[255px] mx-auto aspect-[1128/422] block transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none"
        >
            {/* Ultra High-Resolution Botanical Leaf Asset with Left Vine Stem */}
            <img
                src="/assets/auth/leaf_button_perfect.png"
                alt="Leaf Action"
                className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(10,35,10,0.65)] group-hover:brightness-105 transition-all duration-300 pointer-events-none select-none"
            />

            {/* Embossed Golden Text Placed Dead Center on the Leaf Blade (Centered at 64% horizontally, 49% vertically) */}
            <div
                className="absolute z-10 flex items-center justify-center pointer-events-none"
                style={{
                    left: "64%",
                    top: "49%",
                    transform: "translate(-50%, -50%)",
                    width: "max-content",
                }}
            >
                <span
                    className="font-black text-sm sm:text-base md:text-lg tracking-wider text-[#fff4ad] flex items-center justify-center gap-1.5 transition-colors group-hover:text-white select-none"
                    style={{
                        textShadow: "0 2px 4px rgba(5,25,5,0.95), 0 1px 2px rgba(0,0,0,0.85), 0 -1px 0 rgba(255,255,180,0.6)",
                    }}
                >
                    {processing ? (
                        <svg className="animate-spin h-5 w-5 text-[#fff4ad]" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <>
                            <span>{text}</span>
                            <span className="text-sm font-black transition-transform group-hover:translate-x-1">&gt;</span>
                        </>
                    )}
                </span>
            </div>
        </button>
    );
}

export default function AuthLayoutUnified({
    initialMode,
    status,
    canResetPassword = true,
}: AuthLayoutUnifiedProps) {
    const [mode, setMode] = useState<"login" | "register">(initialMode);
    const [burstTrigger, setBurstTrigger] = useState(0);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    // Login Form State
    const loginForm = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    // Register Form State
    const registerForm = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    // Handle Switcher Click
    const handleSwitchMode = (targetMode: "login" | "register") => {
        if (targetMode === mode) return;
        setMode(targetMode);
        setBurstTrigger((prev) => prev + 1);

        const newUrl = targetMode === "login" ? "/login" : "/register";
        window.history.pushState(null, "", newUrl);
    };

    // Keep mode synced with initialMode or browser popstate
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            if (path.includes("register")) {
                setMode("register");
            } else {
                setMode("login");
            }
            setBurstTrigger((prev) => prev + 1);
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    // Submit Handlers
    const submitLogin: FormEventHandler = (e) => {
        e.preventDefault();
        loginForm.post(route("login"), {
            onFinish: () => loginForm.reset("password"),
        });
    };

    const submitRegister: FormEventHandler = (e) => {
        e.preventDefault();
        registerForm.post(route("register"), {
            onFinish: () => registerForm.reset("password", "password_confirmation"),
        });
    };

    return (
        <AuthScene mode={mode} burstTrigger={burstTrigger}>
            <Head title={mode === "login" ? "Masuk ke AISTELL" : "Daftar Akun AISTELL"} />

            {/* TOP BAR: Floating Logo & Back Button Overlay */}
            <header className="absolute top-0 left-0 right-0 px-6 py-3 sm:px-10 sm:py-4 flex items-center justify-between z-40 pointer-events-none">
                <Link
                    href="/"
                    className="group flex items-center gap-2.5 transition-transform duration-200 hover:scale-105 pointer-events-auto"
                >
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-lg group-hover:border-emerald-400/50 transition-colors">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="#4de097" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="8" cy="8" r="4.8" />
                            <circle cx="16" cy="8" r="4.8" />
                            <circle cx="8" cy="16" r="4.8" />
                            <circle cx="16" cy="16" r="4.8" />
                        </svg>
                    </div>
                    <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white drop-shadow-md">
                        AISTEL<span className="text-[#4de097]">L</span>
                    </span>
                </Link>

                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition-all duration-200 shadow-lg pointer-events-auto"
                >
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Beranda</span>
                </Link>
            </header>

            {/* MAIN AREA: THE ENTIRE TREE CARD SPANS 100% OF THE VIEWPORT HEIGHT ("FULL DARI ATAS KE BAWAH MENTOK") */}
            <main className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden z-30">
                
                {/* Status Alert if passed */}
                {status && (
                    <div className="absolute top-16 z-50 w-full max-w-md rounded-2xl border border-emerald-400/40 bg-emerald-950/90 px-4 py-1.5 text-center text-xs sm:text-sm font-medium text-emerald-200 backdrop-blur-md shadow-xl animate-fade-in">
                        {status}
                    </div>
                )}

                {/* THE COMPLETE TREE HERO CARD - STABLE, IMMUTABLE (NO HOVER TILT CUTOFF), FULL HEIGHT 100vh MENTOK */}
                <div
                    className="relative h-screen w-auto max-w-[100vw] aspect-[565/442] flex items-center justify-center select-none flex-shrink-0"
                >
                    {/* The Full Tree Illustration (No artificial drop shadow, blends 100% naturally into pohon.jpg) */}
                    <img
                        src="/assets/auth/login_2x.png"
                        alt="AISTELL Nature Portal"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />

                    {/* ========================================================
                        FORM OVERLAY POSITIONED PRECISELY ON THE WOODEN BOARD
                        Coordinates on login.png:
                        Left: 56.5% - Right: 91.5%
                        Top: 8% - Bottom: 8.5%
                        ======================================================== */}
                    <div
                        className="absolute top-[8%] bottom-[8.5%] left-[56.5%] right-[8%] z-20 flex flex-col justify-center gap-4 sm:gap-5 md:gap-6 py-2 px-2 sm:px-4 text-center"
                    >
                        
                        {/* 1. HIGH-CONTRAST DEEP CARVED WOOD TITLE & SUBTITLE */}
                        <div className="space-y-1">
                            <h1
                                className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight font-display leading-[1.08] text-[#241103]"
                                style={{
                                    textShadow: "0 1px 0 rgba(255, 255, 255, 0.85), 0 -1px 1px rgba(0, 0, 0, 0.45)",
                                }}
                            >
                                {mode === "login" ? (
                                    <>
                                        Selamat Datang <br />
                                        <span className="text-[#180a01]">Kembali</span>
                                    </>
                                ) : (
                                    <>
                                        Mulai Langkah <br />
                                        <span className="text-[#180a01]">Hijau</span>
                                    </>
                                )}
                            </h1>
                            <p
                                className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-[#2d1607]"
                                style={{
                                    textShadow: "0 1px 0 rgba(255, 255, 255, 0.75)",
                                }}
                            >
                                {mode === "login"
                                    ? "Masuk ke portal Anda untuk tetap terhubung."
                                    : "Daftar akun baru untuk merawat alam."}
                            </p>
                        </div>

                        {/* 2. FORM FIELDS & SUBMIT BUTTON (Centered with harmonious spacing) */}
                        <div className="w-full">
                            {mode === "login" ? (
                                <form onSubmit={submitLogin} className="space-y-3 sm:space-y-3.5">
                                    {/* Username / Email Field */}
                                    <div className="relative group flex items-center">
                                        <LeafBadge type="user" />
                                        <TwigFrame />
                                        <div className="flex-1 relative pl-5 sm:pl-6">
                                            <input
                                                id="login-email"
                                                type="email"
                                                name="email"
                                                value={loginForm.data.email}
                                                autoComplete="username"
                                                required
                                                placeholder="Username atau Email"
                                                onChange={(e) => loginForm.setData("email", e.target.value)}
                                                className="w-full pl-8 sm:pl-9 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-bold rounded-full border border-[#75441a]/60 text-[#1e0c02] placeholder-[#46280e]/75 focus:outline-none focus:ring-2 focus:ring-[#855424]/50 focus:bg-[rgba(255,238,208,0.72)] transition-all duration-200"
                                                style={{
                                                    background: "linear-gradient(180deg, rgba(235, 205, 160, 0.48) 0%, rgba(255, 235, 200, 0.6) 42%, rgba(230, 195, 150, 0.52) 100%)",
                                                    backdropFilter: "blur(1.5px)",
                                                    boxShadow: "inset 0 3px 5px rgba(45, 20, 5, 0.6), inset 0 1px 2px rgba(30, 10, 0, 0.5), inset 0 -1.5px 2px rgba(255, 255, 255, 0.45), 0 1.5px 2px rgba(255, 255, 255, 0.25)",
                                                }}
                                            />
                                            {/* Inner user icon beside placeholder */}
                                            <span className="absolute left-7 sm:left-8 top-1/2 -translate-y-1/2 text-[#5a3415] pointer-events-none text-sm">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                    {loginForm.errors.email && (
                                        <p className="text-xs text-rose-800 font-bold -mt-1 text-left pl-8">{loginForm.errors.email}</p>
                                    )}

                                    {/* Password Field */}
                                    <div className="relative group flex items-center">
                                        <LeafBadge type="lock" />
                                        <TwigFrame />
                                        <div className="flex-1 relative pl-5 sm:pl-6">
                                            <input
                                                id="login-password"
                                                type={showLoginPassword ? "text" : "password"}
                                                name="password"
                                                value={loginForm.data.password}
                                                autoComplete="current-password"
                                                required
                                                placeholder="Kata Sandi"
                                                onChange={(e) => loginForm.setData("password", e.target.value)}
                                                className="w-full pl-8 sm:pl-9 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-bold rounded-full border border-[#75441a]/60 text-[#1e0c02] placeholder-[#46280e]/75 focus:outline-none focus:ring-2 focus:ring-[#855424]/50 focus:bg-[rgba(255,238,208,0.72)] transition-all duration-200"
                                                style={{
                                                    background: "linear-gradient(180deg, rgba(235, 205, 160, 0.48) 0%, rgba(255, 235, 200, 0.6) 42%, rgba(230, 195, 150, 0.52) 100%)",
                                                    backdropFilter: "blur(1.5px)",
                                                    boxShadow: "inset 0 3px 5px rgba(45, 20, 5, 0.6), inset 0 1px 2px rgba(30, 10, 0, 0.5), inset 0 -1.5px 2px rgba(255, 255, 255, 0.45), 0 1.5px 2px rgba(255, 255, 255, 0.25)",
                                                }}
                                            />
                                            {/* Inner lock icon beside placeholder */}
                                            <span className="absolute left-7 sm:left-8 top-1/2 -translate-y-1/2 text-[#5a3415] pointer-events-none text-sm">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </span>
                                            {/* Eye Toggle */}
                                            <button
                                                type="button"
                                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                className="absolute inset-y-0 right-3 flex items-center text-[#5c3c1e] hover:text-[#1a0a02]"
                                            >
                                                {showLoginPassword ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    {loginForm.errors.password && (
                                        <p className="text-xs text-rose-800 font-bold -mt-1 text-left pl-8">{loginForm.errors.password}</p>
                                    )}

                                    {/* Lupa Kata Sandi Link (Right-aligned under password input) */}
                                    <div className="flex items-center justify-end pr-1 pt-0.5">
                                        {canResetPassword && (
                                            <Link
                                                href={route("password.request")}
                                                className="text-xs sm:text-sm font-extrabold text-[#241103] hover:text-[#145e26] hover:underline transition-colors"
                                                style={{ textShadow: "0 1px 0 rgba(255,255,255,0.85)" }}
                                            >
                                                Lupa Kata Sandi?
                                            </Link>
                                        )}
                                    </div>

                                    {/* 3. REALISTIC GREEN LEAF BUTTON "Masuk >" */}
                                    <div className="pt-2 sm:pt-3">
                                        <LeafButton text="Masuk" processing={loginForm.processing} />
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={submitRegister} className="space-y-2 sm:space-y-2.5">
                                    {/* Name Field */}
                                    <div className="relative group flex items-center">
                                        <LeafBadge type="user" />
                                        <TwigFrame />
                                        <div className="flex-1 relative pl-5 sm:pl-6">
                                            <input
                                                id="register-name"
                                                type="text"
                                                name="name"
                                                value={registerForm.data.name}
                                                autoComplete="name"
                                                required
                                                placeholder="Nama Lengkap"
                                                onChange={(e) => registerForm.setData("name", e.target.value)}
                                                className="w-full pl-7 sm:pl-8 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full border border-[#75441a]/60 text-[#1e0c02] placeholder-[#46280e]/75 focus:outline-none focus:ring-2 focus:ring-[#855424]/50 focus:bg-[rgba(255,238,208,0.72)] transition-all duration-200"
                                                style={{
                                                    background: "linear-gradient(180deg, rgba(235, 205, 160, 0.48) 0%, rgba(255, 235, 200, 0.6) 42%, rgba(230, 195, 150, 0.52) 100%)",
                                                    backdropFilter: "blur(1.5px)",
                                                    boxShadow: "inset 0 3px 5px rgba(45, 20, 5, 0.6), inset 0 1px 2px rgba(30, 10, 0, 0.5), inset 0 -1.5px 2px rgba(255, 255, 255, 0.45), 0 1.5px 2px rgba(255, 255, 255, 0.25)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {registerForm.errors.name && (
                                        <p className="text-xs text-rose-800 font-bold -mt-1 text-left pl-8">{registerForm.errors.name}</p>
                                    )}

                                    {/* Email Field */}
                                    <div className="relative group flex items-center">
                                        <LeafBadge type="mail" />
                                        <TwigFrame />
                                        <div className="flex-1 relative pl-5 sm:pl-6">
                                            <input
                                                id="register-email"
                                                type="email"
                                                name="email"
                                                value={registerForm.data.email}
                                                autoComplete="username"
                                                required
                                                placeholder="Alamat Email"
                                                onChange={(e) => registerForm.setData("email", e.target.value)}
                                                className="w-full pl-7 sm:pl-8 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full border border-[#75441a]/60 text-[#1e0c02] placeholder-[#46280e]/75 focus:outline-none focus:ring-2 focus:ring-[#855424]/50 focus:bg-[rgba(255,238,208,0.72)] transition-all duration-200"
                                                style={{
                                                    background: "linear-gradient(180deg, rgba(235, 205, 160, 0.48) 0%, rgba(255, 235, 200, 0.6) 42%, rgba(230, 195, 150, 0.52) 100%)",
                                                    backdropFilter: "blur(1.5px)",
                                                    boxShadow: "inset 0 3px 5px rgba(45, 20, 5, 0.6), inset 0 1px 2px rgba(30, 10, 0, 0.5), inset 0 -1.5px 2px rgba(255, 255, 255, 0.45), 0 1.5px 2px rgba(255, 255, 255, 0.25)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {registerForm.errors.email && (
                                        <p className="text-xs text-rose-800 font-bold -mt-1 text-left pl-8">{registerForm.errors.email}</p>
                                    )}

                                    {/* Password Field */}
                                    <div className="relative group flex items-center">
                                        <LeafBadge type="lock" />
                                        <TwigFrame />
                                        <div className="flex-1 relative pl-5 sm:pl-6">
                                            <input
                                                id="register-password"
                                                type={showRegisterPassword ? "text" : "password"}
                                                name="password"
                                                value={registerForm.data.password}
                                                autoComplete="new-password"
                                                required
                                                placeholder="Kata Sandi (min 8)"
                                                onChange={(e) => registerForm.setData("password", e.target.value)}
                                                className="w-full pl-7 sm:pl-8 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full border border-[#75441a]/60 text-[#1e0c02] placeholder-[#46280e]/75 focus:outline-none focus:ring-2 focus:ring-[#855424]/50 focus:bg-[rgba(255,238,208,0.72)] transition-all duration-200"
                                                style={{
                                                    background: "linear-gradient(180deg, rgba(235, 205, 160, 0.48) 0%, rgba(255, 235, 200, 0.6) 42%, rgba(230, 195, 150, 0.52) 100%)",
                                                    backdropFilter: "blur(1.5px)",
                                                    boxShadow: "inset 0 3px 5px rgba(45, 20, 5, 0.6), inset 0 1px 2px rgba(30, 10, 0, 0.5), inset 0 -1.5px 2px rgba(255, 255, 255, 0.45), 0 1.5px 2px rgba(255, 255, 255, 0.25)",
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                                className="absolute inset-y-0 right-2 flex items-center text-[#5c3c1e] hover:text-[#1a0a02]"
                                            >
                                                {showRegisterPassword ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    {registerForm.errors.password && (
                                        <p className="text-xs text-rose-800 font-bold -mt-1 text-left pl-8">{registerForm.errors.password}</p>
                                    )}

                                    {/* Password Confirmation Field */}
                                    <div className="relative group flex items-center">
                                        <LeafBadge type="shield" />
                                        <TwigFrame />
                                        <div className="flex-1 relative pl-5 sm:pl-6">
                                            <input
                                                id="register-password-confirmation"
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="password_confirmation"
                                                value={registerForm.data.password_confirmation}
                                                autoComplete="new-password"
                                                required
                                                placeholder="Ulangi Kata Sandi"
                                                onChange={(e) => registerForm.setData("password_confirmation", e.target.value)}
                                                className="w-full pl-7 sm:pl-8 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full border border-[#75441a]/60 text-[#1e0c02] placeholder-[#46280e]/75 focus:outline-none focus:ring-2 focus:ring-[#855424]/50 focus:bg-[rgba(255,238,208,0.72)] transition-all duration-200"
                                                style={{
                                                    background: "linear-gradient(180deg, rgba(235, 205, 160, 0.48) 0%, rgba(255, 235, 200, 0.6) 42%, rgba(230, 195, 150, 0.52) 100%)",
                                                    backdropFilter: "blur(1.5px)",
                                                    boxShadow: "inset 0 3px 5px rgba(45, 20, 5, 0.6), inset 0 1px 2px rgba(30, 10, 0, 0.5), inset 0 -1.5px 2px rgba(255, 255, 255, 0.45), 0 1.5px 2px rgba(255, 255, 255, 0.25)",
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-2 flex items-center text-[#5c3c1e] hover:text-[#1a0a02]"
                                            >
                                                {showConfirmPassword ? (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    {registerForm.errors.password_confirmation && (
                                        <p className="text-xs text-rose-800 font-bold -mt-1 text-left pl-8">{registerForm.errors.password_confirmation}</p>
                                    )}

                                    {/* 3. REALISTIC GREEN LEAF BUTTON "Daftar >" */}
                                    <div className="pt-2 sm:pt-3">
                                        <LeafButton text="Daftar" processing={registerForm.processing} />
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* 3. HIGH-CONTRAST FOOTER GOLDEN CARVED LINKS */}
                        <div>
                            {mode === "login" ? (
                                <p
                                    className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-[#241103]"
                                    style={{
                                        textShadow: "0 1px 0 rgba(255, 255, 255, 0.85)",
                                    }}
                                >
                                    Belum punya akun?{" "}
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchMode("register")}
                                        className="font-black text-[#0f5420] underline decoration-[#0f5420]/70 decoration-2 underline-offset-2 hover:text-[#062c0e] hover:decoration-[#062c0e] transition-colors"
                                        style={{
                                            textShadow: "0 1px 0 rgba(255, 255, 255, 0.9)",
                                        }}
                                    >
                                        Daftar di sini.
                                    </button>
                                </p>
                            ) : (
                                <p
                                    className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-[#241103]"
                                    style={{
                                        textShadow: "0 1px 0 rgba(255, 255, 255, 0.85)",
                                    }}
                                >
                                    Sudah memiliki akun?{" "}
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchMode("login")}
                                        className="font-black text-[#0f5420] underline decoration-[#0f5420]/70 decoration-2 underline-offset-2 hover:text-[#062c0e] hover:decoration-[#062c0e] transition-colors"
                                        style={{
                                            textShadow: "0 1px 0 rgba(255, 255, 255, 0.9)",
                                        }}
                                    >
                                        Masuk di sini.
                                    </button>
                                </p>
                            )}
                        </div>

                    </div>
                </div>
            </main>

            {/* FOOTER: Floating copyright overlay at bottom */}
            <footer className="absolute bottom-0 left-0 right-0 py-2 text-center text-[11px] sm:text-xs text-white/60 z-40 pointer-events-none">
                &copy; {new Date().getFullYear()} AISTELL. Solusi Layanan & Pemeliharaan Lingkungan Hidup.
            </footer>
        </AuthScene>
    );
}
