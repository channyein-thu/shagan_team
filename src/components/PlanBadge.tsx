import type { PlanCode } from "@/lib/backend/types";
import { PLAN_BADGE, PLAN_LABELS } from "@/lib/subscription/labels";

export function PlanBadge({
  plan,
  trial = false,
}: {
  plan: PlanCode;
  trial?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${PLAN_BADGE[plan] ?? PLAN_BADGE.basic}`}
    >
      {PLAN_LABELS[plan] ?? plan}
      {trial && <span className="ml-1 font-normal opacity-80">trial</span>}
    </span>
  );
}
