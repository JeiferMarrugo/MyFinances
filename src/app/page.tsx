import Link from "next/link";
import { AppLogo } from "@/components/brand/app-logo";
import { appBrand, homeCopy } from "@/lib/branding";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <main className="w-full max-w-3xl rounded-2xl border border-border bg-card p-10 shadow-sm">
        <div className="mb-8">
          <AppLogo />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {homeCopy.title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          {homeCopy.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {homeCopy.features.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {homeCopy.cta}
          </Link>
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Crear cuenta
          </Link>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">{appBrand.description}</p>
      </main>
    </div>
  );
}
