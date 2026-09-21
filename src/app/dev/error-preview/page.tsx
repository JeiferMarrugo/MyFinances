import Link from "next/link";
import Image from "next/image";
import {
  errorPageCatalog,
  errorPreviewCodes,
} from "@/lib/errors/catalog";
import { getErrorIllustrationSrc } from "@/lib/errors/assets";

export default function ErrorPreviewGalleryPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#5b21b6] via-[#7c3aed] to-[#4c1d95] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
          Herramientas de diseño
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Galería de pantallas de error
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
          Estilo humorístico con la paleta de MyFinances. Toca una tarjeta para ver
          la pantalla completa y ajustar textos en{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">src/lib/errors/catalog.ts</code>.
        </p>

        <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/85 backdrop-blur-sm">
          Vista de desarrollo · Elimina{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">src/app/dev/error-preview</code>{" "}
          cuando termines.
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {errorPreviewCodes.map((code) => {
            const config = errorPageCatalog[code];

            return (
              <Link
                key={code}
                href={`/dev/error-preview/${code}`}
                className="group overflow-hidden rounded-[24px] border border-white/15 bg-[#2e1065]/45 p-5 shadow-lg backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-[#2e1065]/65"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-3xl font-black">{config.code}</span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold">
                    Preview
                  </span>
                </div>

                <div className="relative mt-4 h-36 overflow-hidden rounded-2xl">
                  <Image
                    src={getErrorIllustrationSrc(config.icon)}
                    alt=""
                    fill
                    className="object-contain p-2"
                    sizes="320px"
                    unoptimized
                  />
                </div>
                <h2 className="mt-4 text-lg font-semibold">{config.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/70">
                  {config.description}
                </p>

                <p className="mt-4 text-sm font-medium text-[#ddd6fe]">
                  Ver pantalla completa →
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
