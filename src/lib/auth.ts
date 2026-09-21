import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { passkey } from "@better-auth/passkey";
import { oneTap } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { appBrand } from "@/lib/branding";
import { isGoogleAuthConfigured } from "@/lib/auth/providers";

const appUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const passkeyRpId =
  process.env.BETTER_AUTH_PASSKEY_RP_ID ??
  (appUrl.includes("localhost") ? "localhost" : new URL(appUrl).hostname);

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: appUrl,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  ...(isGoogleAuthConfigured()
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          },
        },
      }
    : {}),
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },
  session: {
    expiresIn: 60 * 30,
    updateAge: 60,
  },
  plugins: [
    passkey({
      rpID: passkeyRpId,
      rpName: appBrand.name,
      origin: appUrl,
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "preferred",
      },
    }),
    ...(isGoogleAuthConfigured() ? [oneTap()] : []),
  ],
  advanced: {
    database: {
      joins: true,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
