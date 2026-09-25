import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { StatCard } from "@/components/StatCard";
import { ChevronLeftIcon, MailIcon, UsersIcon } from "@/components/icons";
import { ServiceStatusControl } from "./ServiceStatusControl";
import { AddStudentForm } from "./AddStudentForm";
import { StudentRow } from "./StudentRow";
import {
  SERVICE_COLORS,
  SERVICE_ICONS,
  SERVICE_LABELS,
  type ServiceType,
} from "@/lib/buyer/types";

function parseContactEmail(metadata: string | null): string | null {
  if (!metadata) return null;
  try {
    const parsed = JSON.parse(metadata) as { contactEmail?: string | null };
    return parsed.contactEmail ?? null;
  } catch {
    return null;
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string; serviceId: string }>;
}) {
  const { id: buyerId, serviceId } = await params;

  const service = await prisma.buyerService.findUnique({
    where: { id: serviceId },
    include: { buyer: true, students: { orderBy: { createdAt: "asc" } } },
  });

  if (!service || service.buyerId !== buyerId) {
    notFound();
  }

  const serviceType = service.serviceType as ServiceType;
  const status = service.status as "active" | "suspended";
  const contactEmail = parseContactEmail(service.metadata);
  const colors = SERVICE_COLORS[serviceType];
  const Icon = SERVICE_ICONS[serviceType];
  const activeStudents = service.students.filter(
    (s) => s.status === "active",
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href={`/buyers/${buyerId}`}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {service.buyer.name}
        </Link>

        <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span
              className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl ${colors.badge}`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p
                className={`mb-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${colors.icon}`}
              >
                {SERVICE_LABELS[serviceType]}
              </p>
              <h1 className="text-xl font-bold text-slate-900">
                {service.label}
              </h1>
              <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                <StatusBadge status={status} />
                {contactEmail && (
                  <span className="flex items-center gap-1.5">
                    <MailIcon className="h-3.5 w-3.5 text-slate-400" />
                    {contactEmail}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ServiceStatusControl
            serviceId={service.id}
            buyerId={buyerId}
            status={status}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total students"
          value={service.students.length}
          icon={<UsersIcon className="h-5 w-5 text-indigo-600" />}
          accent="bg-indigo-50"
        />
        <StatCard
          label="Active"
          value={activeStudents}
          icon={
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          }
          accent="bg-emerald-50"
        />
        <StatCard
          label="Suspended"
          value={service.students.length - activeStudents}
          icon={<span className="h-2.5 w-2.5 rounded-full bg-rose-500" />}
          accent="bg-rose-50"
        />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Students</h2>
          <AddStudentForm buyerId={buyerId} serviceId={service.id} />
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {service.students.map((student) => (
                <StudentRow
                  key={student.id}
                  studentId={student.id}
                  buyerId={buyerId}
                  serviceId={service.id}
                  name={student.name}
                  email={student.email}
                  status={student.status as "active" | "suspended"}
                />
              ))}
              {service.students.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No students yet.
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
