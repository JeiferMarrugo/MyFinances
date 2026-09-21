"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  SESSION_IDLE_CHECK_INTERVAL_MS,
  SESSION_INACTIVITY_MS,
  SESSION_REFRESH_INTERVAL_MS,
} from "@/lib/auth/session-policy";

const ACTIVITY_EVENTS = [
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
] as const;

export function SessionInactivityGuard() {
  const router = useRouter();
  const lastActivityRef = useRef(Date.now());
  const lastRefreshRef = useRef(0);
  const isSigningOutRef = useRef(false);

  useEffect(() => {
    function markActive() {
      lastActivityRef.current = Date.now();
    }

    async function signOutForInactivity() {
      if (isSigningOutRef.current) return;
      isSigningOutRef.current = true;

      try {
        await authClient.signOut();
      } finally {
        router.replace("/login?reason=inactivity");
        router.refresh();
      }
    }

    async function checkSession() {
      const idleMs = Date.now() - lastActivityRef.current;

      if (idleMs >= SESSION_INACTIVITY_MS) {
        await signOutForInactivity();
        return;
      }

      if (Date.now() - lastRefreshRef.current >= SESSION_REFRESH_INTERVAL_MS) {
        lastRefreshRef.current = Date.now();
        await authClient.getSession();
      }
    }

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, markActive, { passive: true });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void checkSession();
      }
    });

    lastRefreshRef.current = Date.now();
    void authClient.getSession();

    const interval = window.setInterval(() => {
      void checkSession();
    }, SESSION_IDLE_CHECK_INTERVAL_MS);

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, markActive);
      }
      window.clearInterval(interval);
    };
  }, [router]);

  return null;
}
