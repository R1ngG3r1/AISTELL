import AuthLayoutUnified from "@/Layouts/AuthLayoutUnified";

export default function Login({
    status,
    canResetPassword = true,
}: {
    status?: string;
    canResetPassword?: boolean;
}) {
    return (
        <AuthLayoutUnified
            initialMode="login"
            status={status}
            canResetPassword={canResetPassword}
        />
    );
}
