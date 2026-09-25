import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import * as backend from "@/lib/backend/client";
import { Avatar } from "@/components/Avatar";
import {
  ChevronLeftIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/icons";
import { AddOrganizationForm } from "./AddOrganizationForm";
import { AddMockServiceForm } from "./AddMockServiceForm";
import { ServiceRow } from "./ServiceRow";
import type { ServiceType } from "@/lib/buyer/types";

function parseContactEmail(metadata: string | null): string | null {
  if (!metadata) return null;
  try {
    const parsed = JSON.parse(metadata) as { contactEmail?: string | null };
    return parsed.contactEmail ?? null;
  } catch {
    return null;
  }
}

export default async function BuyerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const buyer = await prisma.buyer.findUnique({
    where: { id },
    include: { services: { orderBy: { createdAt: "asc" } } },
  });
  if (!buyer) {
    notFound();
  }

  const orgExternalIds = buyer.services
    .filter((s) => s.serviceType === "organization")
    .map((s) => s.externalId);

  const liveOrgStatus = new Map<string, "active" | "suspended">();
  if (orgExternalIds.length > 0) {
    const orgs = await backend.listOrganizations();
    for (const org of orgs) {
      if (orgExternalIds.includes(org.id)) {
        liveOrgStatus.set(org.id, org.status);
      }
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Buyers
        </Link>

        <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={buyer.name} size="lg" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {buyer.name}
              </h1>
              {buyer.company && (
                <p className="text-sm text-slate-500">{buyer.company}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm text-slate-600 sm:items-end">
            <span className="flex items-center gap-2">
              <MailIcon className="h-3.5 w-3.5 text-slate-400" />
              {buyer.email}
            </span>
            {buyer.phone && (
              <span className="flex items-center gap-2">
                <PhoneIcon className="h-3.5 w-3.5 text-slate-400" />
                {buyer.phone}
              </span>
            )}
            {buyer.billingAddress && (
              <span className="flex items-center gap-2">
                <MapPinIcon className="h-3.5 w-3.5 text-slate-400" />
                {buyer.billingAddress}
              </span>
            )}
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Purchased services
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buyer.services.map((service) => {
                const serviceType = service.serviceType as ServiceType;
                const isOrganization = serviceType === "organization";
                const status = isOrganization
                  ? (liveOrgStatus.get(service.externalId) ??
                    (service.status as "active" | "suspended"))
                  : (service.status as "active" | "suspended");

                return (
                  <ServiceRow
                    key={service.id}
                    serviceType={serviceType}
                    label={service.label}
                    status={status}
                    contactEmail={
                      isOrganization
                        ? null
                        : parseContactEmail(service.metadata)
                    }
                    manageHref={
                      isOrganization
                        ? `/organizations/${service.externalId}`
                        : `/buyers/${buyer.id}/services/${service.id}`
                    }
                  />
                );
              })}
              {buyer.services.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No services purchased yet - add one below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-3">
          <AddOrganizationForm buyerId={buyer.id} />
          <AddMockServiceForm
            buyerId={buyer.id}
            serviceType="school"
            buttonLabel="Add School"
            modalTitle="Add School service"
            modalDescription="This backend doesn't exist yet - this creates a mock service record so the full buyer flow can be demonstrated."
            nameLabel="School name"
            contactLabel="Admin contact email"
          />
          <AddMockServiceForm
            buyerId={buyer.id}
            serviceType="course"
            buttonLabel="Add Course"
            modalTitle="Add Course service"
            modalDescription="This backend doesn't exist yet - this creates a mock service record so the full buyer flow can be demonstrated."
            nameLabel="Course name"
            contactLabel="Instructor contact email"
          />
        </div>
      </section>
    </div>
  );
}
