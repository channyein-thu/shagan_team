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
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-900/40">
              <SparklesIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-white">
              Shagan{" "}
              <span className="font-normal text-slate-400">
                Provider Onboarding
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <Avatar name={displayName} size="sm" />
              <span className="text-sm text-slate-300">{displayName}</span>
            </div>
            <span className="h-5 w-px bg-slate-700" />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white"
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
