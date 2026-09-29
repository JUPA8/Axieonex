import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { parseAuthCredentials } from "@/lib/serverValidation";

/**
 * Auth.js v5, Credentials-only, single flat admin role (no permission
 * tiers; every row in `Admin` has equal access to /admin).
 *
 * Deliberately no @auth/prisma-adapter here: the adapter exists to persist
 * OAuth accounts and database-backed sessions, neither of which applies to
 * a Credentials-only setup. Auth.js's own docs note Credentials always
 * uses JWT sessions regardless of whether an adapter is configured. Prisma
 * is used directly in `authorize()` to look up the Admin row; wiring an
 * unused adapter on top would only add dead schema (User/Account/Session/
 * VerificationToken tables nothing here would ever populate).
 */
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
const secureCookies = process.env.NODE_ENV === "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  jwt: { maxAge: SESSION_MAX_AGE_SECONDS },
  useSecureCookies: secureCookies,
  cookies: {
    sessionToken: {
      name: secureCookies ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: secureCookies, maxAge: SESSION_MAX_AGE_SECONDS },
    },
  },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = parseAuthCredentials(credentials);
        if (!parsed) return null;
        const { email, password } = parsed;

        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin?.active) return null;

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) return null;

        await prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } }).catch(() => {});

        return { id: admin.id, email: admin.email, name: admin.name ?? undefined };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
