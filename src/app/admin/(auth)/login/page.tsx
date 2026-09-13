import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Sign In | AXIEONEX",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await auth();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-ax-ink-1 px-5 py-24 text-ax-text-primary">
      <h1 className="mb-8 text-2xl font-bold">Admin sign in</h1>
      <LoginForm />
    </div>
  );
}
