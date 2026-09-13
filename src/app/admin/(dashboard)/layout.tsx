import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logoutAction } from "./actions";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-ax-ink-1 text-ax-text-primary">
      <header className="flex items-center justify-between border-b border-ax-border-subtle px-6 py-4">
        <div className="flex items-center gap-8">
          <div>
            <div className="text-sm font-semibold">AXIEONEX Admin</div>
            <div className="text-xs text-ax-text-muted">{session.user?.email}</div>
          </div>
          <nav aria-label="Admin" className="flex gap-5 text-sm">
            <Link href="/admin" className="text-ax-text-muted hover:text-ax-text-primary">
              Submissions
            </Link>
            <Link href="/admin/articles" className="text-ax-text-muted hover:text-ax-text-primary">
              Articles
            </Link>
          </nav>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="min-h-11 rounded-sm border border-ax-border-default px-4 py-2 text-sm text-ax-text-primary hover:border-ax-text-primary">
            Sign out
          </button>
        </form>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
