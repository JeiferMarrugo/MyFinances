import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";
import { oneTapClient } from "better-auth/client/plugins";
import { getGoogleClientId } from "@/lib/auth/providers";
import { resolveClientAuthBaseUrl } from "@/lib/app-url";

const googleClientId = getGoogleClientId();

export const authClient = createAuthClient({
  baseURL: resolveClientAuthBaseUrl(),
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
