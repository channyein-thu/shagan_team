import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Avatar } from "@/components/Avatar";
import { LogOutIcon, SparklesIcon } from "@/components/icons";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const displayName = session?.user?.name ?? session?.user?.email ?? "Admin";

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
              <SparklesIcon className="h-4 w-4" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-ink">Shagan</span>
              <span className="text-xs text-ink-muted">Provider Onboarding</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-medium text-ink">{displayName}</span>
              <Avatar name={displayName} />
            </div>
            <span className="h-5 w-px bg-border" />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-primary"
              >
                <LogOutIcon className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
