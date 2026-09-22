"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { getClientIp } from "@/lib/security/getClientIp";
import { checkRateLimit, shouldFailClosedForAntiAbuse } from "@/lib/security/rateLimit";
import { parseLoginForm } from "@/lib/serverValidation";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const credentials = parseLoginForm(formData);
  if (!credentials.ok) return { error: "Invalid email or password." };
  const ipAddress = await getClientIp();
  const rateLimit = await checkRateLimit(`admin-login:${ipAddress}`);
  if (rateLimit.status === "limited" || (rateLimit.status === "unavailable" && shouldFailClosedForAntiAbuse(rateLimit.reason))) {
    return { error: "Too many login attempts. Please wait a few minutes and try again." };
  }

  try {
    await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirectTo: "/admin",
    });
    return {};
  } catch (error) {
    // next/navigation's redirect() (which a successful signIn triggers)
    // throws an internal NEXT_REDIRECT error that must propagate, not be
    // swallowed as a login failure.
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}
