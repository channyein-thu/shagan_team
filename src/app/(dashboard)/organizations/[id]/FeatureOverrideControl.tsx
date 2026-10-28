"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setFeatureOverrideAction } from "./actions";

type Mode = "default" | "on" | "off";

/** Per-org switch for one feature: follow the plan, or force it on / off. */
export function FeatureOverrideControl({
  orgId,
  feature,
  mode,
  inPlan,
}: {
  orgId: string;
  feature: string;
  mode: Mode;
  /** Whether the plan includes the feature, for the "Plan default" label. */
  inPlan: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Shows the new choice while the page re-renders with it.
  const [shown, setShown] = useOptimistic(mode);

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-danger">{error}</span>}
      <select
        aria-label="Override"
        value={shown}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value as Mode;
          setError(null);
          startTransition(async () => {
            setShown(next);
            try {
              await setFeatureOverrideAction(orgId, feature, next);
            } catch {
              setError("Failed to update.");
            }
          });
        }}
        className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
      >
        <option value="default">Plan default ({inPlan ? "on" : "off"})</option>
        <option value="on">Force on</option>
        <option value="off">Force off</option>
      </select>
    </div>
  );
}
