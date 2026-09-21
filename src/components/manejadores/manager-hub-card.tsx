import Link from "next/link";

type ManagerHubCardProps = {
  href: string;
  title: string;
  description: string;
  accent: string;
  icon: string;
};

export function ManagerHubCard({
  href,
  title,
  description,
  accent,
  icon,
}: ManagerHubCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-accent/10 bg-card/95 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-[0_14px_34px_-16px_rgba(124,58,237,0.35)]"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-[0_8px_20px_-10px_rgba(0,0,0,0.35)] ring-1 ring-white/20"
        style={{ backgroundColor: accent }}
      >
        {icon}
      </div>
      <h2 className="brand-text mt-4 text-lg font-semibold transition-opacity group-hover:opacity-90">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </Link>
  );
}
