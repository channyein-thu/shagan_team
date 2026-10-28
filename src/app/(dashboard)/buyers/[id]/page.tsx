import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import * as backend from "@/lib/backend/client";
import type { Organization } from "@/lib/backend/types";
import { Avatar } from "@/components/Avatar";
import {
  ChevronLeftIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/icons";
import { AddOrganizationForm } from "./AddOrganizationForm";
import { OrganizationRow } from "./OrganizationRow";

export default async function BuyerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const buyer = await prisma.buyer.findUnique({
    where: { id },
    include: {
      services: {
        where: { serviceType: "organization" },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!buyer) {
    notFound();
  }

  const liveOrgs = new Map<string, Organization>();
  if (buyer.services.length > 0) {
    const orgIds = buyer.services.map((s) => s.externalId);
    const orgs = await backend.listOrganizations();
    for (const org of orgs) {
      if (orgIds.includes(org.id)) {
        liveOrgs.set(org.id, org);
      }
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Buyers
        </Link>

        <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={buyer.name} size="lg" />
            <div>
              <h1 className="text-xl font-bold text-ink">{buyer.name}</h1>
              {buyer.company && (
                <p className="text-sm text-ink-muted">{buyer.company}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm text-neutral sm:items-end">
            <span className="flex items-center gap-2">
              <MailIcon className="h-3.5 w-3.5 text-ink-muted" />
              {buyer.email}
            </span>
            {buyer.phone && (
              <span className="flex items-center gap-2">
                <PhoneIcon className="h-3.5 w-3.5 text-ink-muted" />
                {buyer.phone}
              </span>
            )}
            {buyer.billingAddress && (
              <span className="flex items-center gap-2">
                <MapPinIcon className="h-3.5 w-3.5 text-ink-muted" />
                {buyer.billingAddress}
              </span>
            )}
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">POS organizations</h2>
          <AddOrganizationForm buyerId={buyer.id} />
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-canvas text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Tier</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {buyer.services.map((service) => (
                <OrganizationRow
                  key={service.id}
                  label={service.label}
                  org={liveOrgs.get(service.externalId)}
                  status={
                    liveOrgs.get(service.externalId)?.status ??
                    (service.status as "active" | "suspended")
                  }
                  manageHref={`/organizations/${service.externalId}`}
                />
              ))}
              {buyer.services.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-ink-muted"
                  >
                    No POS organization yet - add one to start setting up
                    branches and devices.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
