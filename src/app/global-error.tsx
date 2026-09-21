"use client";

import { ErrorPageScreen } from "@/components/errors/error-page-screen";
import { getErrorPageConfig } from "@/lib/errors/catalog";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <ErrorPageScreen
          config={getErrorPageConfig("500")}
          onRetry={reset}
          showLogo={false}
        />
      </body>
    </html>
  );
}
