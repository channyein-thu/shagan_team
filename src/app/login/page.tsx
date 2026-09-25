import {
  BuildingIcon,
  GraduationCapIcon,
  BookOpenIcon,
  SparklesIcon,
} from "@/components/icons";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-slate-900 to-slate-900" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-900/40">
            <SparklesIcon className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Shagan{" "}
            <span className="font-normal text-slate-400">
              Provider Onboarding
            </span>
          </span>
        </div>

        <div className="relative">
          <h1 className="mb-4 text-3xl font-bold leading-tight">
            Provision and manage every customer&apos;s services, in one
            place.
          </h1>
          <p className="mb-8 max-w-sm text-sm text-slate-400">
            Buyers, organizations, schools and courses - track what each
            customer has purchased and manage it end to end.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                <BuildingIcon className="h-4 w-4" />
              </span>
              Organizations (POS)
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                <GraduationCapIcon className="h-4 w-4" />
              </span>
              Schools (Management)
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300">
                <BookOpenIcon className="h-4 w-4" />
              </span>
              Courses
            </div>
          </div>
        </div>

        <p className="relative text-xs text-slate-500">
          Internal tool - Shagan team only
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <SparklesIcon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              Shagan{" "}
              <span className="font-normal text-slate-500">
                Provider Onboarding
              </span>
            </span>
          </div>
          <h1 className="mb-1 text-2xl font-bold text-slate-900">
            Welcome back
          </h1>
          <p className="mb-8 text-sm text-slate-500">
            Sign in with your Shagan team account.
          </p>
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
