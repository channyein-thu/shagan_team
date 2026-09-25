import Link from "next/link";
import { notFound } from "next/navigation";
import * as backend from "@/lib/backend/client";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { StatCard } from "@/components/StatCard";
import {
  BuildingIcon,
  ChevronLeftIcon,
  CreditCardIcon,
  MapPinIcon,
  TabletIcon,
} from "@/components/icons";
import { OrgStatusControl } from "./OrgStatusControl";
import { CreateBranchForm } from "./CreateBranchForm";
import { CreateDeviceForm } from "./CreateDeviceForm";
import { CreatePosAccountForm } from "./CreatePosAccountForm";
import { PosAccountRow } from "./PosAccountRow";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const organizations = await backend.listOrganizations();
  const organization = organizations.find((org) => org.id === id);
  if (!organization) {
    notFound();
  }

  const [branches, devices, posAccounts, owningService] = await Promise.all([
    backend.listBranches(id),
    backend.listDevices(id),
    backend.listPosAccounts(id),
    prisma.buyerService.findFirst({
      where: { serviceType: "organization", externalId: id },
      include: { buyer: true },
    }),
  ]);

  const deviceById = new Map(devices.map((device) => [device.id, device]));
  const branchById = new Map(branches.map((branch) => [branch.id, branch]));

  return (
    <div className="flex flex-col gap-8">
      <div>
        {owningService && (
          <Link
            href={`/buyers/${owningService.buyerId}`}
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            {owningService.buyer.name}
          </Link>
        )}

        <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BuildingIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
                Organization (POS)
              </p>
              <h1 className="text-xl font-bold text-slate-900">
                {organization.name}
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={organization.status} />
                <span className="text-xs text-slate-400">
                  Created{" "}
                  {new Date(organization.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <OrgStatusControl
            orgId={organization.id}
            status={organization.status}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Branches"
          value={branches.length}
          icon={<MapPinIcon className="h-5 w-5 text-blue-600" />}
          accent="bg-blue-50"
        />
        <StatCard
          label="Devices"
          value={devices.length}
          icon={<TabletIcon className="h-5 w-5 text-indigo-600" />}
          accent="bg-indigo-50"
        />
        <StatCard
          label="POS accounts"
          value={posAccounts.length}
          icon={<CreditCardIcon className="h-5 w-5 text-violet-600" />}
          accent="bg-violet-50"
        />
      </div>

      <Section title="Branches" icon={<MapPinIcon className="h-4 w-4" />}>
        <Table
          headers={["Name", "Address", "Phone", "Status"]}
          rows={branches.map((branch) => [
            branch.name,
            branch.address,
            branch.phone,
            <StatusBadge key="status" status={branch.status} />,
          ])}
          emptyLabel="No branches yet."
        />
        <CreateBranchForm orgId={organization.id} />
      </Section>

      <Section title="Devices" icon={<TabletIcon className="h-4 w-4" />}>
        <Table
          headers={["Name", "Branch", "Status"]}
          rows={devices.map((device) => [
            device.name,
            branchById.get(device.branch_id)?.name ?? "—",
            <StatusBadge key="status" status={device.status} />,
          ])}
          emptyLabel="No devices yet."
        />
        <CreateDeviceForm
          orgId={organization.id}
          branches={branches.map((b) => ({ id: b.id, name: b.name }))}
        />
      </Section>

      <Section
        title="POS accounts"
        icon={<CreditCardIcon className="h-4 w-4" />}
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Device</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posAccounts.map((account) => (
                <PosAccountRow
                  key={account.id}
                  accountId={account.id}
                  orgId={organization.id}
                  email={account.email}
                  status={account.status}
                  device={
                    account.device_id
                      ? deviceById.get(account.device_id)
                      : undefined
                  }
                />
              ))}
              {posAccounts.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No POS accounts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <CreatePosAccountForm
          orgId={organization.id}
          devices={devices.map((d) => ({ id: d.id, name: d.name }))}
        />
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <span className="text-slate-400">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Table({
  headers,
  rows,
  emptyLabel,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  emptyLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-5 py-3.5">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className="transition-colors hover:bg-slate-50/80">
              {row.map((cell, j) => (
                <td key={j} className="px-5 py-3.5 text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={headers.length}
                className="px-5 py-12 text-center text-slate-500"
              >
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
