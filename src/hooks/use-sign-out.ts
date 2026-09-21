"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";

export function useSignOut() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    const toastId = appToast.loading(toastCopy.logout.loading);

    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            appToast.success(toastCopy.logout.successTitle, {
              id: toastId,
              description: toastCopy.logout.successDescription,
            });
            router.push("/login");
            router.refresh();
          },
          onError: () => {
            appToast.error(toastCopy.logout.errorTitle, { id: toastId });
          },
        },
      });
    } catch {
      appToast.error(toastCopy.logout.errorTitle, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }

  return { handleSignOut, isLoading };
}
