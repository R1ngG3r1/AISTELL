import { useState, useEffect, useRef, FormEventHandler } from "react";
import { Head, Link, useForm } from "@inertiajs/react";

interface AuthLayoutUnifiedProps {
    initialMode: "login" | "register";
    status?: string;
    canResetPassword?: boolean;
}

/*
 * Tampilan per perangkat (sesuai rancangan Figma):
 * - Desktop (lg+)    : layout terbelah, ilustrasi di satu sisi dengan lengkungan organik.
 * - Tablet & mobile  : ilustrasi memenuhi layar, form berada di atas panel transparan.
 *   Login memakai lanskap terang (teks gelap), register memakai dedaunan gelap (teks putih).
 */

function Spinner() {
    return (
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
    );
}

// Tombol "Continue with Google": navigasi penuh ke backend (redirect OAuth), bukan Inertia.
function GoogleButton({ className = "" }: { className?: string }) {
    return (
        <a
            href={route("auth.google")}
            className={`w-full h-11 sm:h-12 rounded-full border text-sm sm:text-base font-medium flex items-center justify-center gap-2.5 shadow-sm transition-all duration-200 active:scale-[0.99] focus:outline-none focus:ring-2 ${className}`}
        >
            <GoogleIcon />
            <span>Continue with Google</span>
        </a>
    );
}

function OrDivider({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-3 text-xs ${className}`}>
            <span className="h-px flex-1 bg-current opacity-40" />
            <span>Or</span>
            <span className="h-px flex-1 bg-current opacity-40" />
        </div>
    );
}

// Kelas bersama untuk form register (putih di atas dedaunan, gelap di desktop)
const registerLabel =
    "block text-xs sm:text-sm font-bold text-white lg:text-[#18231f] mb-1.5 ml-2";
const registerInput =
    "w-full h-11 sm:h-12 px-5 rounded-full border text-sm sm:text-base font-normal transition-all shadow-sm focus:outline-none focus:ring-2 " +
    "bg-white/10 border-white/60 text-white placeholder-white/60 focus:ring-white/40 focus:border-white " +
    "sm:bg-white sm:border-white sm:text-[#18231f] " +
    "lg:border-[#7ba794] lg:focus:ring-[#3b9270]/40 lg:focus:border-[#2e7d5b]";
const registerError = "mt-1 ml-3 text-[11px] font-semibold text-rose-200 lg:text-rose-700";

// Kelas bersama untuk input login
const loginInput =
    "w-full h-12 sm:h-[50px] rounded-full border text-[#18231f] text-sm sm:text-base font-normal placeholder-[#4d6357] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3b9270]/40 focus:border-[#2e7d5b] " +
    "bg-white/70 border-white/80 lg:bg-[#c5ddd1] lg:border-[#7ba794] lg:placeholder-[#647f72]";
// Tambahan saat input login bermasalah (ditaruh setelah loginInput agar menimpa warna border)
const loginInputError = " !border-rose-500 ring-2 ring-rose-500/25";

export default function AuthLayoutUnified({
    initialMode,
    status,
    canResetPassword = true,
}: AuthLayoutUnifiedProps) {
    const [mode, setMode] = useState<"login" | "register">(initialMode);
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Login Form State
    const loginForm = useForm({
        email: "",
        password: "",
        remember: true as boolean,
    });

    // Kunci error tambahan dari LoginRequest::authenticate():
    //   account → akun belum terdaftar, password → password salah, login → terlalu banyak percobaan
    const loginErrors = loginForm.errors as typeof loginForm.errors & { account?: string; login?: string };
    const loginPasswordRef = useRef<HTMLInputElement>(null);

    // Hitung mundur saat login dikunci sementara (angka detik diambil dari pesan backend).
    const [lockSeconds, setLockSeconds] = useState(0);
    useEffect(() => {
        const match = loginErrors.login?.match(/(\d+)\s*detik/);
        setLockSeconds(match ? Number(match[1]) : 0);
    }, [loginErrors.login]);
    useEffect(() => {
        if (lockSeconds <= 0) return;
        const id = window.setTimeout(() => setLockSeconds((s) => s - 1), 1000);
        return () => window.clearTimeout(id);
    }, [lockSeconds]);

    // Register Form State
    const registerForm = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        terms: false as boolean, // dicek juga di backend (RegisteredUserController)
    });

    // Smooth Switch Mode Handler
    const handleSwitchMode = (targetMode: "login" | "register") => {
        if (targetMode === mode) return;
        setMode(targetMode);
        const newUrl = targetMode === "login" ? "/login" : "/register";
        window.history.pushState(null, "", newUrl);
        window.scrollTo({ top: 0 });
    };

    // Keep mode synced with initialMode or browser back/forward buttons
    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname;
            if (path.includes("register")) {
                setMode("register");
            } else {
                setMode("login");
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const submitLogin: FormEventHandler = (e) => {
        e.preventDefault();
        loginForm.post(route("login"), {
            onFinish: () => loginForm.reset("password"),
            // Password salah → langsung fokus ke kolom password untuk mencoba lagi.
            onError: (errors) => {
                if (errors.password) window.setTimeout(() => loginPasswordRef.current?.focus(), 0);
            },
        });
    };

    // Akun belum terdaftar → pindah ke form daftar dengan email/nama yang sudah diketik.
    const registerFromLogin = () => {
        const typed = loginForm.data.email.trim();
        registerForm.setData((d) => (typed.includes("@") ? { ...d, email: typed } : { ...d, name: typed }));
        loginForm.clearErrors();
        handleSwitchMode("register");
    };

    const submitRegister: FormEventHandler = (e) => {
        e.preventDefault();
        registerForm.post(route("register"), {
            onFinish: () => registerForm.reset("password", "password_confirmation"),
        });
    };

    const isLogin = mode === "login";

    return (
        <div className="relative min-h-screen lg:h-screen w-full bg-[#f5f7f2] flex flex-col lg:flex-row overflow-x-hidden lg:overflow-hidden font-sans text-[#18231f]">
            <Head title={isLogin ? "Welcome Back - AISTEL" : "Selamat Datang - AISTEL"} />

            {/* ========================================================
                TABLET & MOBILE: FULL-SCREEN BACKGROUND WITH CROSSFADE
                ======================================================== */}
            <div className="lg:hidden fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
                <img
                    src="/login/gambar1.jpeg"
                    alt=""
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                        isLogin ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ objectPosition: "50% 20%" }}
                />
                <img
                    src="/login/gambar2.jpeg"
                    alt=""
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
                        !isLogin ? "opacity-100" : "opacity-0"
                    }`}
                />
                {/* Overlay agar teks tetap terbaca */}
                <div
                    className={`absolute inset-0 transition-colors duration-700 ${
                        isLogin ? "bg-white/10" : "bg-[#06241a]/45"
                    }`}
                />
            </div>

            {/* ========================================================
                DESKTOP BACKGROUND LAYERS WITH CINEMATIC CROSSFADE
                ======================================================== */}
            {/* 1. LOGIN BACKGROUND LAYER: Landscape illustration on left */}
            <div
                className={`hidden lg:block absolute inset-0 w-full h-full pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isLogin ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-[1.02]"
                }`}
                aria-hidden="true"
            >
                <div className="absolute inset-y-0 left-0 w-[48%] xl:w-[47%] h-full overflow-hidden">
                    <img
                        src="/login/gambar1.jpeg"
                        alt=""
                        className="w-full h-full"
                        style={{ objectFit: "cover", objectPosition: "50% 5%" }}
                    />
                </div>
                <svg
                    viewBox="0 0 1000 1000"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full"
                >
                    <path
                        d="M 1000 0 L 1000 1000 L 415 1000 C 390 940, 365 840, 370 680 C 375 520, 465 380, 465 280 C 465 180, 440 60, 415 0 Z"
                        fill="#f5f7f2"
                    />
                </svg>
            </div>

            {/* 2. REGISTER BACKGROUND LAYER: Lush foliage on right */}
            <div
                className={`hidden lg:block absolute inset-0 w-full h-full pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    !isLogin ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-[1.02]"
                }`}
                aria-hidden="true"
            >
                <div className="absolute inset-y-0 right-0 w-[52%] xl:w-[50%] h-full overflow-hidden">
                    <img
                        src="/login/gambar2.jpeg"
                        alt=""
                        className="w-full h-full object-cover object-center"
                    />
                </div>
                <svg
                    viewBox="0 0 1000 1000"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full"
                >
                    <path
                        d="M 0 0 L 0 1000 L 580 1000 C 560 920, 525 800, 530 720 C 535 640, 595 560, 595 480 C 595 400, 525 320, 535 200 C 545 100, 620 40, 690 0 Z"
                        fill="#f5f7f2"
                    />
                </svg>
            </div>

            {/* ========================================================
                BRAND (AISTEL LOGO) - ALL DEVICES
                ======================================================== */}
            <header className="absolute top-5 left-5 sm:top-7 sm:left-8 lg:left-10 xl:top-9 xl:left-14 z-30 flex items-center">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 sm:gap-2.5 group transition-transform duration-200 hover:scale-105 focus:outline-none"
                >
                    <img
                        src="/landingpage/LOGO.png"
                        alt=""
                        aria-hidden="true"
                        className="w-6 h-6 sm:w-7 sm:h-7 object-contain group-hover:rotate-6 transition-transform"
                    />
                    <span
                        className={`text-lg sm:text-2xl font-black tracking-tight transition-colors duration-500 ${
                            isLogin ? "text-[#18231f]" : "text-white lg:text-[#18231f]"
                        }`}
                    >
                        AISTEL
                    </span>
                </Link>
            </header>

            {/* ========================================================
                LEFT COLUMN: REGISTER FORM
                Desktop: positioned on left half, smoothly fades & slides in
                Tablet/Mobile: displayed when mode is 'register'
                ======================================================== */}
            <div
                className={`relative w-full ${
                    isLogin ? "lg:w-[44%] xl:w-[43%]" : "lg:w-[54%] xl:w-[55%]"
                } flex-shrink-0 min-h-screen lg:h-screen flex items-center justify-center lg:justify-start px-5 sm:px-10 lg:pr-0 lg:pl-14 xl:pl-20 pt-24 pb-10 sm:py-28 lg:py-0 z-20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    !isLogin
                        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto block"
                        : "lg:opacity-0 lg:translate-y-4 lg:scale-[0.98] lg:pointer-events-none hidden lg:block lg:invisible"
                }`}
                aria-hidden={isLogin}
            >
                <div className="w-full max-w-[440px] sm:max-w-[560px] lg:max-w-[460px] xl:max-w-[480px] flex flex-col justify-center my-auto rounded-3xl bg-[#06241a]/30 border border-white/15 backdrop-blur-[3px] p-6 sm:p-10 lg:bg-transparent lg:border-0 lg:backdrop-blur-none lg:p-0 lg:rounded-none">

                    {status && (
                        <div className="mb-5 rounded-2xl bg-[#c5ddd1]/80 border border-[#3b9270]/50 px-4 py-2 text-center text-xs sm:text-sm font-semibold text-[#18231f] shadow-sm">
                            {status}
                        </div>
                    )}

                    {/* Header */}
                    <div className="text-center lg:text-left mb-6 sm:mb-8">
                        <h1 className="text-3xl sm:text-5xl lg:text-[44px] font-black tracking-tight leading-tight text-white lg:text-[#18231f] drop-shadow-sm lg:drop-shadow-none">
                            <span className="sm:hidden">Welcome to AISTEL</span>
                            <span className="hidden sm:inline">Selamat Datang!</span>
                        </h1>
                        <p className="mt-2 text-xs sm:text-sm text-white/85 lg:text-[#4d6357] font-normal leading-relaxed">
                            Mulai langkah mewujudkan hunian asri dan{" "}
                            <span className="italic font-medium text-[#9fe0bf] lg:text-[#38916d]">
                                lingkungan bersih
                            </span>
                            &nbsp;bersama AISTEL
                        </p>
                    </div>

                    {/* Google */}
                    {/* Tablet & desktop: di atas form. Mobile: di bawah tombol Sign Up (lihat bawah). */}
                    <div className="mb-5 space-y-4 hidden sm:block">
                        <GoogleButton className="bg-white border-white text-[#18231f] hover:bg-[#f1f8f4] focus:ring-white/40 lg:border-[#7ba794] lg:focus:ring-[#3b9270]/40" />
                        <OrDivider className="text-white/80 lg:text-[#38916d]" />
                    </div>

                    <form onSubmit={submitRegister} className="space-y-4">
                        {/* Row 1: Name & Email Address */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                            <div>
                                <label htmlFor="register-name" className={registerLabel}>
                                    Name
                                </label>
                                <input
                                    id="register-name"
                                    type="text"
                                    name="name"
                                    value={registerForm.data.name}
                                    autoComplete="name"
                                    required
                                    onChange={(e) => registerForm.setData("name", e.target.value)}
                                    className={registerInput}
                                />
                                {registerForm.errors.name && (
                                    <p className={registerError}>{registerForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="register-email" className={registerLabel}>
                                    Email Address
                                </label>
                                <input
                                    id="register-email"
                                    type="email"
                                    name="email"
                                    value={registerForm.data.email}
                                    autoComplete="email"
                                    required
                                    onChange={(e) => registerForm.setData("email", e.target.value)}
                                    className={registerInput}
                                />
                                {registerForm.errors.email && (
                                    <p className={registerError}>{registerForm.errors.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Row 2: Password & Confirm Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                            <div>
                                <label htmlFor="register-password" className={registerLabel}>
                                    Password
                                </label>
                                <input
                                    id="register-password"
                                    type="password"
                                    name="password"
                                    value={registerForm.data.password}
                                    autoComplete="new-password"
                                    required
                                    onChange={(e) => registerForm.setData("password", e.target.value)}
                                    className={registerInput}
                                />
                                {registerForm.errors.password && (
                                    <p className={registerError}>{registerForm.errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="register-confirm-password" className={registerLabel}>
                                    Confirm Password
                                </label>
                                <input
                                    id="register-confirm-password"
                                    type="password"
                                    name="password_confirmation"
                                    value={registerForm.data.password_confirmation}
                                    autoComplete="new-password"
                                    required
                                    onChange={(e) => registerForm.setData("password_confirmation", e.target.value)}
                                    className={registerInput}
                                />
                                {registerForm.errors.password_confirmation && (
                                    <p className={registerError}>{registerForm.errors.password_confirmation}</p>
                                )}
                            </div>
                        </div>

                        {/* Terms & Conditions Checkbox */}
                        <div className="flex items-start gap-2.5 pt-1">
                            <input
                                id="terms-checkbox"
                                type="checkbox"
                                checked={registerForm.data.terms}
                                onChange={(e) => registerForm.setData("terms", e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded-[5px] border border-white/70 bg-white/20 lg:border-[#7ba794] lg:bg-[#c5ddd1] text-[#3b9270] focus:ring-[#3b9270]/40 cursor-pointer"
                            />
                            <label
                                htmlFor="terms-checkbox"
                                className="text-xs text-white/90 lg:text-[#18231f] leading-snug cursor-pointer select-none"
                            >
                                Saya menyetujui{" "}
                                <span className="font-bold">Syarat dan Ketentuan</span> serta{" "}
                                <span className="font-bold">Kebijakan Privasi</span> AISTEL.
                            </label>
                        </div>
                        {registerForm.errors.terms && (
                            <p className={registerError}>{registerForm.errors.terms}</p>
                        )}

                        {/* Sign Up Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={registerForm.processing || !registerForm.data.terms}
                                className="w-full h-11 sm:h-12 rounded-full border text-sm sm:text-base font-bold tracking-wide active:scale-[0.99] disabled:opacity-60 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow bg-[#06241a]/80 border-[#06241a] text-white hover:bg-[#06241a] sm:bg-[#0d3a2a]/60 sm:border-[#3b9270]/60 sm:hover:bg-[#0d3a2a]/80 lg:bg-[#c5ddd1] lg:border-[#7ba794] lg:text-[#18231f] lg:hover:bg-[#b6d4c5]"
                            >
                                {registerForm.processing ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner />
                                        <span>Signing Up...</span>
                                    </span>
                                ) : (
                                    "Sign Up"
                                )}
                            </button>
                        </div>

                        {/* Google khusus mobile (di bawah Sign Up, sesuai desain) */}
                        <div className="sm:hidden space-y-4 pt-1">
                            <OrDivider className="text-white/80" />
                            <GoogleButton className="bg-transparent border-white/70 text-white hover:bg-white/10 focus:ring-white/40" />
                        </div>

                        {/* Footer link */}
                        <div className="pt-5 text-center">
                            <p className="text-xs sm:text-sm text-white lg:text-[#18231f]">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => handleSwitchMode("login")}
                                    className="font-bold text-[#9fe0bf] lg:text-[#38916d] hover:underline focus:outline-none transition-colors"
                                >
                                    Login
                                </button>
                            </p>
                        </div>
                    </form>

                </div>
            </div>

            {/* ========================================================
                RIGHT COLUMN: LOGIN FORM
                Desktop: positioned on right half, smoothly fades & slides in
                Tablet/Mobile: displayed when mode is 'login'
                ======================================================== */}
            <div
                className={`relative w-full ${
                    isLogin ? "lg:w-[56%] xl:w-[57%]" : "lg:w-[46%] xl:w-[45%]"
                } flex-shrink-0 min-h-screen lg:h-screen flex items-center justify-center px-5 sm:px-10 lg:px-8 xl:px-14 pt-24 pb-10 sm:py-28 lg:py-0 z-20 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isLogin
                        ? "opacity-100 translate-y-0 scale-100 pointer-events-auto block"
                        : "lg:opacity-0 lg:translate-y-4 lg:scale-[0.98] lg:pointer-events-none hidden lg:block lg:invisible"
                }`}
                aria-hidden={!isLogin}
            >
                <div className="w-full max-w-[400px] sm:max-w-[480px] lg:max-w-[420px] flex flex-col justify-center my-auto rounded-3xl bg-white/35 border border-white/50 backdrop-blur-md shadow-xl shadow-[#06241a]/10 p-6 sm:p-10 lg:bg-transparent lg:border-0 lg:backdrop-blur-none lg:shadow-none lg:p-0 lg:rounded-none">

                    {status && (
                        <div className="mb-6 rounded-2xl bg-[#c5ddd1]/80 border border-[#3b9270]/50 px-4 py-2.5 text-center text-xs sm:text-sm font-semibold text-[#18231f] shadow-sm">
                            {status}
                        </div>
                    )}

                    {/* Header */}
                    <div className="text-center lg:text-left mb-6 sm:mb-8">
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-[#18231f]">
                            <span className="sm:hidden">
                                Hello,
                                <br />
                                Welcome Back!
                            </span>
                            <span className="hidden sm:inline">Welcome Back!</span>
                        </h1>
                        <p className="mt-2.5 text-xs sm:text-sm text-[#2f4a3d] lg:text-[#4d6357] font-normal leading-relaxed">
                            Mewujudkan lingkungan asri dan{" "}
                            <span className="italic font-medium text-[#2e7d5b] lg:text-[#38916d]">
                                lingkungan bersih
                            </span>
                            &nbsp;bersama AISTEL
                        </p>
                    </div>

                    <form onSubmit={submitLogin} className="space-y-4">
                        {loginErrors.login && lockSeconds > 0 && (
                            <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50/90 px-4 py-3 text-xs sm:text-sm text-rose-800 shadow-sm">
                                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>
                                    <span className="block font-bold">Login dikunci sementara</span>
                                    Terlalu banyak percobaan gagal. Coba lagi dalam{" "}
                                    <span className="font-bold tabular-nums">
                                        {Math.floor(lockSeconds / 60)}:{String(lockSeconds % 60).padStart(2, "0")}
                                    </span>
                                    .
                                </span>
                            </div>
                        )}

                        {/* Username / Email Field */}
                        <div>
                            <label
                                htmlFor="login-username"
                                className="block sm:sr-only text-xs font-bold text-[#18231f] mb-1.5 ml-2"
                            >
                                Username
                            </label>
                            <input
                                id="login-username"
                                type="text"
                                name="email"
                                value={loginForm.data.email}
                                autoComplete="username"
                                required
                                placeholder="Username atau email"
                                onChange={(e) => {
                                    loginForm.setData("email", e.target.value);
                                    if (loginErrors.account || loginErrors.email) loginForm.clearErrors();
                                }}
                                aria-invalid={!!(loginErrors.account || loginErrors.email)}
                                className={`${loginInput} px-6${loginErrors.account || loginErrors.email ? loginInputError : ""}`}
                            />
                            {loginErrors.email && (
                                <p className="mt-1.5 ml-4 text-xs font-semibold text-rose-700">
                                    {loginErrors.email}
                                </p>
                            )}
                            {loginErrors.account && (
                                <div role="alert" className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-2.5">
                                    <p className="text-xs font-semibold text-rose-700">{loginErrors.account}</p>
                                    <button
                                        type="button"
                                        onClick={registerFromLogin}
                                        className="rounded-full bg-[#14432f] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#1c5a40]"
                                    >
                                        Buat akun
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="login-password"
                                className="block sm:sr-only text-xs font-bold text-[#18231f] mb-1.5 ml-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    ref={loginPasswordRef}
                                    id="login-password"
                                    type={showLoginPassword ? "text" : "password"}
                                    name="password"
                                    value={loginForm.data.password}
                                    autoComplete="current-password"
                                    required
                                    placeholder="Password"
                                    onChange={(e) => {
                                        loginForm.setData("password", e.target.value);
                                        if (loginErrors.password) loginForm.clearErrors("password");
                                    }}
                                    aria-invalid={!!loginErrors.password}
                                    className={`${loginInput} pl-6 pr-12${loginErrors.password ? loginInputError : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#355345] hover:text-[#18231f] p-1.5 transition-colors focus:outline-none"
                                    tabIndex={-1}
                                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                                >
                                    {showLoginPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {loginErrors.password && (
                                <div role="alert" className="mt-2 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-2.5 text-xs">
                                    <p className="font-semibold text-rose-700">{loginErrors.password}</p>
                                    {canResetPassword && (
                                        <Link href={route("password.request")} className="mt-1 inline-block font-bold text-[#14432f] hover:underline">
                                            Lupa password? Atur ulang di sini
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Forgot Password */}
                        {canResetPassword && (
                            <div className="flex justify-end pt-0.5">
                                <Link
                                    href={route("password.request")}
                                    className="text-xs sm:text-sm text-[#2f4a3d] lg:text-[#5d7c6e] hover:text-[#18231f] transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        )}

                        {/* Login Button: hijau tua di mobile, putih di tablet & desktop */}
                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={loginForm.processing || lockSeconds > 0}
                                className="w-full h-12 sm:h-[50px] rounded-full border-[1.5px] text-base font-bold tracking-wide active:scale-[0.99] disabled:opacity-60 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow bg-[#14432f] border-[#14432f] text-white hover:bg-[#1c5a40] sm:bg-white sm:border-[#3b9270] sm:text-[#18231f] sm:hover:bg-[#f1f8f4]"
                            >
                                {loginForm.processing ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner />
                                        <span>Logging in...</span>
                                    </span>
                                ) : (
                                    "Login"
                                )}
                            </button>
                        </div>

                        {/* Google */}
                        <OrDivider className="pt-2 text-white/80 sm:text-[#18231f]/70 lg:text-[#38916d]" />
                        <GoogleButton className="bg-[#0b3a28]/35 border-white/30 text-white backdrop-blur-sm hover:bg-[#0b3a28]/50 focus:ring-white/40 lg:bg-[#c5ddd1] lg:border-[#7ba794] lg:text-[#18231f] lg:backdrop-blur-none lg:hover:bg-[#b6d4c5] lg:focus:ring-[#3b9270]/40" />

                        {/* Footer link */}
                        <div className="pt-4 sm:pt-6 text-center">
                            <p className="text-xs sm:text-sm text-[#18231f]">
                                Not a member?{" "}
                                <button
                                    type="button"
                                    onClick={() => handleSwitchMode("register")}
                                    className="font-extrabold text-[#113d29] hover:underline focus:outline-none transition-colors"
                                >
                                    Register now!
                                </button>
                            </p>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
}
