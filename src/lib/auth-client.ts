"use client";

import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";
import { oneTapClient } from "better-auth/client/plugins";
import { getGoogleClientId } from "@/lib/auth/providers";

const googleClientId = getGoogleClientId();

function getAuthClientBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getAuthClientBaseUrl(),
  plugins: [
    passkeyClient(),
    ...(googleClientId
      ? [
          oneTapClient({
            clientId: googleClientId,
            autoSelect: false,
            cancelOnTapOutside: true,
            context: "signin",
            promptOptions: {
              fedCM: true,
            },
          }),
        ]
      : []),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
