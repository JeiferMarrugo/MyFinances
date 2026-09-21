"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { appToast } from "@/lib/toast";
import { toastCopy } from "@/lib/toast-messages";

type GoogleOneTapPromptProps = {
  enabled: boolean;
};

export function GoogleOneTapPrompt({ enabled }: GoogleOneTapPromptProps) {
  const router = useRouter();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled || startedRef.current) return;
    startedRef.current = true;

    void authClient.oneTap({
      callbackURL: "/dashboard",
      cancelOnTapOutside: true,
      autoSelect: false,
      context: "signin",
      fetchOptions: {
        onSuccess: () => {
          appToast.success(toastCopy.login.successTitle, {
            description: toastCopy.login.successDescription,
          });
          router.push("/dashboard");
          router.refresh();
        },
        onError: (context) => {
          const message = context.error?.message?.toLowerCase() ?? "";

          if (
            !message ||
            message.includes("dismiss") ||
            message.includes("cancel") ||
            message.includes("skipped") ||
            message.includes("suppressed")
          ) {
            return;
          }

          if (message.includes("account_not_linked") || message.includes("not linked")) {
            appToast.error(toastCopy.auth.googleAccountNotLinkedTitle, {
              description: toastCopy.auth.googleAccountNotLinkedDescription,
            });
            return;
          }

          appToast.error(toastCopy.auth.googleErrorTitle, {
            description: toastCopy.auth.googleErrorDescription,
          });
        },
      },
    });
  }, [enabled, router]);

  return null;
}
