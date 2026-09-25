import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowRightIcon } from "@/components/icons";
import { SERVICE_COLORS, SERVICE_ICONS, SERVICE_LABELS } from "@/lib/buyer/types";
import type { ServiceType } from "@/lib/buyer/types";

export function ServiceRow({
  serviceType,
  label,
  status,
  contactEmail,
  manageHref,
}: {
  serviceType: ServiceType;
  label: string;
  status: "active" | "suspended";
  contactEmail?: string | null;
  manageHref: string;
}) {
  const Icon = SERVICE_ICONS[serviceType];

  return (
    <tr className="transition-colors hover:bg-slate-50/80">
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${SERVICE_COLORS[serviceType].badge}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {SERVICE_LABELS[serviceType]}
        </span>
      </td>
      <td className="px-5 py-4 font-medium text-slate-900">{label}</td>
      <td className="px-5 py-4 text-slate-500">{contactEmail ?? "—"}</td>
      <td className="px-5 py-4">
        <StatusBadge status={status} />
      </td>
      <td className="px-5 py-4 text-right">
        <Link
          href={manageHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Manage
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </td>
    </tr>
  );
}
