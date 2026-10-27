import Link from "next/link";
import { prisma } from "@/lib/prisma";
import * as backend from "@/lib/backend/client";
import type { Organization, PlanCode } from "@/lib/backend/types";
import { PLAN_LABELS } from "@/lib/subscription/labels";
import { PlanBadge } from "@/components/PlanBadge";
import { Avatar } from "@/components/Avatar";
import { StatCard } from "@/components/StatCard";
import {
  ArrowRightIcon,
  BuildingIcon,
  UsersIcon,
} from "@/components/icons";
import { CreateBuyerForm } from "./CreateBuyerForm";

// "24 Jun 2025" (en-GB would print "Sept").
const createdFormat = {
  format(date: Date) {
    const parts = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).formatToParts(date);
    const part = (type: string) => parts.find((p) => p.type === type)?.value;
    return `${part("day")} ${part("month")} ${part("year")}`;
  },
};

const TIERS: PlanCode[] = ["basic", "pro", "enterprise"];

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier: tierParam } = await searchParams;
  const tier = TIERS.find((t) => t === tierParam);

  const [allBuyers, orgs] = await Promise.all([
    prisma.buyer.findMany({
      orderBy: { createdAt: "desc" },
      include: { services: { where: { serviceType: "organization" } } },
    }),
    // Tiers live in the backend; the list still works (without them) when it's down.
    backend.listOrganizations().catch(() => null),
  ]);
  const orgById = new Map<string, Organization>(
    (orgs ?? []).map((org) => [org.id, org]),
  );
  const orgsOf = (buyer: (typeof allBuyers)[number]) =>
    buyer.services.flatMap((s) => orgById.get(s.externalId) ?? []);
  const buyers = tier
    ? allBuyers.filter((b) => orgsOf(b).some((o) => o.effective_plan === tier))
    : allBuyers;

  const organizations = allBuyers.reduce((n, b) => n + b.services.length, 0);
  const notStarted = allBuyers.filter((b) => b.services.length === 0).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Customer operations
          </p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Buyers</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Customers who&apos;ve purchased Shagan POS.
          </p>
        </div>
        <CreateBuyerForm />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total buyers"
          value={allBuyers.length}
          icon={<UsersIcon className="h-5 w-5" />}
        />
        <StatCard
          label="POS organizations"
          value={organizations}
          icon={<BuildingIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Not started"
          value={notStarted}
          icon={<ArrowRightIcon className="h-5 w-5" />}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3 text-sm">
          <span className="mr-1 text-ink-muted">Tier</span>
          {[undefined, ...TIERS].map((t) => (
            <Link
              key={t ?? "all"}
              href={t ? `/?tier=${t}` : "/"}
              className={`rounded-full px-3 py-1 font-medium transition-colors ${
                t === tier
                  ? "bg-primary text-white"
                  : "text-neutral hover:bg-primary-soft hover:text-primary"
              }`}
            >
              {t ? PLAN_LABELS[t] : "All"}
            </Link>
          ))}
          {orgs === null && (
            <span className="ml-auto text-xs text-warning">
              Backend unreachable - tiers not shown.
            </span>
          )}
        </div>
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-canvas text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-5 py-3.5">Buyer</th>
              <th className="px-5 py-3.5">Company</th>
              <th className="px-5 py-3.5">Phone</th>
              <th className="px-5 py-3.5">Organizations</th>
              <th className="px-5 py-3.5">Tier</th>
              <th className="px-5 py-3.5">Created</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {buyers.map((buyer) => (
              <tr key={buyer.id} className="transition-colors hover:bg-canvas">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={buyer.name} />
                    <div>
                      <p className="font-medium text-ink">{buyer.name}</p>
                      <p className="text-xs text-ink-muted">{buyer.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-neutral">
                  {buyer.company ?? "—"}
                </td>
                <td className="px-5 py-4 text-neutral">{buyer.phone ?? "—"}</td>
                <td className="px-5 py-4">
                  {buyer.services.length === 0 ? (
                    <span className="text-ink-muted">Not started</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary-border">
                      <BuildingIcon className="h-3 w-3" />
                      {buyer.services.length}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <TierCell orgs={orgsOf(buyer)} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-neutral">
                  {createdFormat.format(buyer.createdAt)}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/buyers/${buyer.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:text-primary"
                  >
                    View
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
            {buyers.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-ink-muted"
                >
                  {tier
                    ? `No buyers on ${PLAN_LABELS[tier]}.`
                    : "No buyers yet. Create your first buyer to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TierCell({ orgs }: { orgs: Organization[] }) {
  if (orgs.length === 0) return <span className="text-ink-muted">—</span>;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {orgs.map((org) => (
        <PlanBadge
          key={org.id}
          plan={org.effective_plan}
          trial={org.plan_trial && org.effective_plan === org.plan}
        />
      ))}
      {orgs.some((org) => org.over_limit) && (
        <span className="text-xs font-medium text-warning">over limit</span>
      )}
    </div>
  );
}
