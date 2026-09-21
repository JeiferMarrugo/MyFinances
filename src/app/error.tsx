"use client";

import { useEffect } from "react";
import { ErrorPageScreen } from "@/components/errors/error-page-screen";
import { getErrorPageConfig } from "@/lib/errors/catalog";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPageScreen
      config={getErrorPageConfig("500")}
      onRetry={reset}
    />
  );
}
