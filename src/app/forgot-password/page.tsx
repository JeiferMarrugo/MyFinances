import Link from "next/link";
import { LoginHeader } from "@/components/auth/login-header";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background">
      <LoginHeader />
      <main className="mx-auto flex max-w-md flex-col px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">
          Recuperar contraseña
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Esta función estará disponible pronto. Mientras tanto, crea una nueva
          cuenta o contacta soporte si perdiste el acceso.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Volver al login
        </Link>
      </main>
    </div>
  );
}
