import { AppLogo } from "@/components/brand/app-logo";
import { authCopy } from "@/lib/branding";

export function LoginHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-5 lg:px-10">
      <AppLogo />
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-success" />
        {authCopy.login.secureBadge}
      </span>
    </header>
  );
}
