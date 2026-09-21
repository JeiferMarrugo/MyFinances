import Image from "next/image";
import type { ErrorPageIcon } from "@/lib/errors/types";
import { getErrorIllustrationSrc } from "@/lib/errors/assets";

type ErrorIllustrationProps = {
  name: ErrorPageIcon;
  className?: string;
  priority?: boolean;
};

export function ErrorIllustration({
  name,
  className = "h-56 w-full max-w-lg sm:h-64",
  priority = false,
}: ErrorIllustrationProps) {
  const src = getErrorIllustrationSrc(name);

  return (
    <div className={`relative mx-auto ${className}`}>
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        unoptimized
        sizes="(max-width: 768px) 90vw, 512px"
        className="object-contain drop-shadow-[0_24px_48px_rgba(15,7,32,0.35)]"
      />
    </div>
  );
}
