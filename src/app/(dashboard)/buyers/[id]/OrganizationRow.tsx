import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { PlanBadge } from "@/components/PlanBadge";
import type { Organization } from "@/lib/backend/types";
import { ArrowRightIcon, BuildingIcon } from "@/components/icons";

export function OrganizationRow({
  label,
  org,
  status,
  manageHref,
}: {
  label: string;
  /** The live organization, for its tier; missing if the backend lost it. */
  org?: Organization;
  status: "active" | "suspended";
  manageHref: string;
}) {
  return (
    <tr className="transition-colors hover:bg-canvas">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary-soft text-primary">
            <BuildingIcon className="h-4 w-4" />
          </span>
          <span className="font-medium text-ink">{label}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        {org ? (
          <div className="flex items-center gap-2">
            <PlanBadge
              plan={org.effective_plan}
              trial={org.plan_trial && org.effective_plan === org.plan}
            />
            {org.over_limit && (
              <span className="text-xs font-medium text-warning">over limit</span>
            )}
          </div>
        ) : (
          <span className="text-ink-muted">—</span>
        )}
      </td>
      <td className="px-5 py-4">
        <StatusBadge status={status} />
      </td>
      <td className="px-5 py-4 text-right">
        <Link
          href={manageHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
        >
          Manage
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>
      </td>
    </tr>
  );
}
