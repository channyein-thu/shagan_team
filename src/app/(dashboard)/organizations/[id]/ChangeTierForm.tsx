"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { inlineInputClass } from "@/components/inlineInputClass";
import type { Plan, Subscription } from "@/lib/backend/types";
import { limitCount } from "@/lib/subscription/labels";
import { updateSubscriptionAction, type ActionState } from "./actions";

const initialState: ActionState = {};

/** The yyyy-mm-dd of an ISO timestamp in Myanmar time, for a date input. */
function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yangon" }).format(
    new Date(iso),
  );
}

export function ChangeTierForm({
  orgId,
  plans,
  raw,
}: {
  orgId: string;
  plans: Plan[];
  raw: Subscription["raw"];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await updateSubscriptionAction(prevState, formData);
      if (result.success) setOpen(false);
      return result;
    },
    initialState,
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>Change tier</Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Change tier"
        description="Applies to every login in this organization straight away. Existing branches and devices keep working after a downgrade."
      >
        <form action={formAction} className="flex flex-col gap-5">
          <input type="hidden" name="org_id" value={orgId} />

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1.5 text-sm font-medium text-ink">Tier</legend>
            {plans.map((plan) => (
              <label
                key={plan.code}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3.5 py-2.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
              >
                <input
                  type="radio"
                  name="plan"
                  value={plan.code}
                  defaultChecked={plan.code === raw.plan}
                  className="accent-primary"
                />
                <span className="font-medium text-ink">{plan.name}</span>
                <span className="ml-auto text-xs text-ink-muted">
                  {limitCount(plan.limits.branches, "branch", "branches")} ·{" "}
                  {limitCount(plan.limits.devices, "device", "devices")}
                </span>
              </label>
            ))}
          </fieldset>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
              End date
              <input
                type="date"
                name="expires_on"
                defaultValue={toDateInput(raw.expires_at)}
                className={inlineInputClass}
              />
              <span className="text-xs font-normal text-ink-muted">
                Blank = no end date. A paid plan gets 7 days&apos; grace after it.
              </span>
            </label>
            <label className="flex items-center gap-2 self-start pt-8 text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="trial"
                defaultChecked={raw.trial}
                className="h-4 w-4 accent-primary"
              />
              Trial (no grace period)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
              Extra branches
              <input
                type="number"
                name="extra_branches"
                min={0}
                step={1}
                defaultValue={raw.extra_branches}
                className={inlineInputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
              Extra devices
              <input
                type="number"
                name="extra_devices"
                min={0}
                step={1}
                defaultValue={raw.extra_devices}
                className={inlineInputClass}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Note
            <textarea
              name="note"
              maxLength={500}
              rows={2}
              placeholder="e.g. Paid 3 months, invoice #1042"
              className={inlineInputClass}
            />
          </label>

          {state.error && (
            <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="mt-1 flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save tier"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
