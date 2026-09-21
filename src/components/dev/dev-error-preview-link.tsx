import Link from "next/link";
import { ArrowLeftIcon } from "@/components/errors/error-icons";

export function DevErrorPreviewLink() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="rounded-2xl border border-dashed border-accent/25 bg-linear-to-br from-white to-secondary/20 p-5">
      <p className="text-sm font-semibold text-foreground">Vista previa de errores</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Explora las pantallas 404, 500, 401, mantenimiento y más para ajustar textos,
        colores e iconos antes de publicar.
      </p>
      <Link
        href="/dev/error-preview"
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-accent/20 bg-white px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:border-accent/35 hover:bg-secondary/30"
      >
        Abrir galería de errores
        <span className="rotate-180">
          <ArrowLeftIcon className="size-4" />
        </span>
      </Link>
    </div>
  );
}
