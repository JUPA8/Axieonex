import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuthorization";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Sign In | AXIEONEX",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  let activeAdmin = false;
  try {
    await requireAdmin();
    activeAdmin = true;
  } catch {
    // A missing, expired, deleted, or inactive identity must be allowed to
    // sign in again. Redirecting based only on the JWT creates a loop with
    // the protected dashboard, which correctly revalidates the database row.
  }
  // redirect() throws, so keep it outside the authorization try/catch.
  if (activeAdmin) redirect("/admin");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-ax-ink-1 px-5 py-24 text-ax-text-primary">
      <h1 className="mb-8 text-2xl font-bold">Admin sign in</h1>
      <LoginForm />
    </div>
  );
}
