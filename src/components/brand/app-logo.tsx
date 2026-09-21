import Link from "next/link";
import { appBrand } from "@/lib/branding";

type AppLogoProps = {
  href?: string;
  className?: string;
};

export function AppLogo({ href = "/", className }: AppLogoProps) {
  const content = (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <div className="brand-logo flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white">
        {appBrand.logoLetter}
      </div>
      <div>
        <p className="brand-text font-semibold">{appBrand.name}</p>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {appBrand.tagline}
        </p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
