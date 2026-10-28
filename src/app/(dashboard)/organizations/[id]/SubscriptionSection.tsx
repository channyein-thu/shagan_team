import { PlanBadge } from "@/components/PlanBadge";
import type { PlanCatalog, Subscription } from "@/lib/backend/types";
import {
  PLAN_LABELS,
  featureLabel,
  limitLabel,
} from "@/lib/subscription/labels";
import { ChangeTierForm } from "./ChangeTierForm";
import { FeatureOverrideControl } from "./FeatureOverrideControl";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Yangon",
});
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Yangon",
});

/** One line saying how long the plan runs, or what happened to it. */
function planTerm(sub: Subscription): { text: string; tone: string } {
  const { effective, raw } = sub;
  if (effective.expired) {
    return {
      text: `${PLAN_LABELS[raw.plan]}${raw.trial ? " trial" : ""} ended ${raw.expires_at ? dateFormat.format(new Date(raw.expires_at)) : ""} - now on Basic.`,
      tone: "text-warning",
    };
  }
  if (effective.in_grace && effective.expires_at) {
    return {
      text: `Ended ${dateFormat.format(new Date(effective.expires_at))} - in the 7-day grace period, then Basic.`,
      tone: "text-warning",
    };
  }
  if (effective.expires_at) {
    return {
      text: `${effective.trial ? "Trial ends" : "Runs until"} ${dateFormat.format(new Date(effective.expires_at))}.`,
      tone: "text-ink-muted",
    };
  }
  return { text: "No end date.", tone: "text-ink-muted" };
}

function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const over = limit !== null && used > limit;
  const pct = limit === null || limit === 0 ? 0 : Math.min(100, (used / limit) * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-ink-muted">{label}</span>
        <span className={`font-semibold ${over ? "text-danger" : "text-ink"}`}>
          {used} / {limitLabel(limit)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-soft">
        <div
          className={`h-full rounded-full ${over ? "bg-danger" : "bg-primary"}`}
          style={{ width: `${limit === null ? 0 : pct}%` }}
        />
      </div>
    </div>
  );
}

export function SubscriptionSection({
  sub,
  catalog,
}: {
  sub: Subscription;
  catalog: PlanCatalog;
}) {
  const { effective } = sub;
  const term = planTerm(sub);
  const planFeatures = new Set(
    catalog.plans.find((p) => p.code === effective.plan)?.features ?? [],
  );
  const overrides = new Map(sub.overrides.map((o) => [o.feature, o.enabled]));
  const active = new Set(effective.features);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-ink">Subscription</h2>

      <div className="grid items-start gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <PlanBadge plan={effective.plan} trial={effective.trial} />
                {(sub.raw.extra_branches > 0 || sub.raw.extra_devices > 0) && (
                  <span className="text-xs text-ink-muted">
                    + {sub.raw.extra_branches} branches, {sub.raw.extra_devices}{" "}
                    devices extra
                  </span>
                )}
              </div>
              <p className={`mt-2 text-sm ${term.tone}`}>{term.text}</p>
            </div>
            <ChangeTierForm
              orgId={sub.organization_id}
              plans={catalog.plans}
              raw={sub.raw}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <UsageMeter
              label="Active branches"
              used={effective.usage.branches}
              limit={effective.limits.branches}
            />
            <UsageMeter
              label="Active devices"
              used={effective.usage.devices}
              limit={effective.limits.devices}
            />
          </div>

          {sub.over_limit && (
            <p className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">
              Over the plan&apos;s limit. Existing branches and devices keep
              working, but no more can be added or reactivated until the tier
              changes or extras are added.
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-canvas text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-5 py-3">Feature</th>
                <th className="px-5 py-3">Now</th>
                <th className="px-5 py-3 text-right">Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {catalog.features.map((feature) => {
                const override = overrides.get(feature);
                return (
                  <tr key={feature}>
                    <td className="px-5 py-2.5 text-ink">{featureLabel(feature)}</td>
                    <td className="px-5 py-2.5">
                      {active.has(feature) ? (
                        <span className="font-medium text-success">On</span>
                      ) : (
                        <span className="text-ink-muted">Off</span>
                      )}
                    </td>
                    <td className="px-5 py-2.5">
                      <FeatureOverrideControl
                        orgId={sub.organization_id}
                        feature={feature}
                        mode={
                          override === undefined ? "default" : override ? "on" : "off"
                        }
                        inPlan={planFeatures.has(feature)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <details className="rounded-xl border border-border bg-surface shadow-sm">
        <summary className="cursor-pointer px-5 py-3.5 text-sm font-medium text-ink">
          Tier history ({sub.history.length})
        </summary>
        <table className="min-w-full divide-y divide-border border-t border-border text-sm">
          <thead className="bg-canvas text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-5 py-3">When</th>
              <th className="px-5 py-3">Change</th>
              <th className="px-5 py-3">Until</th>
              <th className="px-5 py-3">Note</th>
              <th className="px-5 py-3">By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sub.history.map((change) => (
              <tr key={change.id}>
                <td className="whitespace-nowrap px-5 py-2.5 text-neutral">
                  {dateTimeFormat.format(new Date(change.created_at))}
                </td>
                <td className="whitespace-nowrap px-5 py-2.5 text-ink">
                  {change.from_plan && change.from_plan !== change.to_plan
                    ? `${PLAN_LABELS[change.from_plan]} → `
                    : ""}
                  {PLAN_LABELS[change.to_plan]}
                  {change.trial ? " trial" : ""}
                  {(change.extra_branches > 0 || change.extra_devices > 0) &&
                    ` (+${change.extra_branches} br, +${change.extra_devices} dev)`}
                </td>
                <td className="whitespace-nowrap px-5 py-2.5 text-neutral">
                  {change.expires_at
                    ? dateFormat.format(new Date(change.expires_at))
                    : "—"}
                </td>
                <td className="px-5 py-2.5 text-neutral">{change.note || "—"}</td>
                <td className="px-5 py-2.5 text-ink-muted">{change.changed_by}</td>
              </tr>
            ))}
            {sub.history.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-muted">
                  No changes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </details>
    </section>
  );
}
