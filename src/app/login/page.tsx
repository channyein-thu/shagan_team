import { SparklesIcon } from "@/components/icons";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/";

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand to-primary p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <SparklesIcon className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Shagan</span>
            <span className="text-xs text-white/70">Provider Onboarding</span>
          </span>
        </div>

        <div className="relative">
          <span className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium">
            Secure admin workspace
          </span>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight">
            Onboard buyers and set up POS in minutes.
          </h1>
          <p className="max-w-sm text-sm text-white/75">
            Create customers, connect their branches, and get every device
            ready to trade.
          </p>
        </div>

        <p className="relative text-xs text-white/60">
          Internal tool - Shagan team only
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
              <SparklesIcon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-ink">
              Shagan{" "}
              <span className="font-normal text-ink-muted">
                Provider Onboarding
              </span>
            </span>
          </div>
          <h1 className="mb-1 text-2xl font-bold text-ink">
            Welcome back
          </h1>
          <p className="mb-8 text-sm text-ink-muted">
            Sign in with your Shagan team account.
          </p>
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
