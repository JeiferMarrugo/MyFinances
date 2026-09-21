"use client";

import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-sign-out";

export function SignOutButton() {
  const { handleSignOut, isLoading } = useSignOut();

  return (
    <Button
      type="button"
      size="lg"
      className="min-w-[148px]"
      onClick={handleSignOut}
      isLoading={isLoading}
      loadingLabel="Cerrando sesión..."
    >
      Cerrar sesión
    </Button>
  );
}
