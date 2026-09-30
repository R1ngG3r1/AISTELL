import AuthLayoutUnified from "@/Layouts/AuthLayoutUnified";

export default function Register({ status }: { status?: string }) {
    return (
        <AuthLayoutUnified
            initialMode="register"
            status={status}
        />
    );
}
