"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPosAccountAction } from "./actions";
import type { ActionState } from "@/lib/action-state";
import { Button } from "@/components/Button";
import { PlusIcon } from "@/components/icons";
import { inlineInputClass } from "@/components/inlineInputClass";

const initialState: ActionState = {};

export function CreatePosAccountForm({
  orgId,
  devices,
}: {
  orgId: string;
  devices: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    createPosAccountAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  if (devices.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-primary-border bg-primary-soft/40 p-4 text-sm text-ink-muted">
        Add a device before creating POS accounts.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-dashed border-primary-border bg-primary-soft/40 p-4"
    >
      <input type="hidden" name="org_id" value={orgId} />
      <h3 className="text-sm font-semibold text-ink">
        Add POS account
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <select
          name="device_id"
          required
          defaultValue=""
          className={inlineInputClass}
        >
          <option value="" disabled>
            Select device
          </option>
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name}
            </option>
          ))}
        </select>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className={inlineInputClass}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={8}
          className={inlineInputClass}
        />
      </div>
      {state.error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} size="sm" className="self-start">
        <PlusIcon className="h-3.5 w-3.5" />
        {pending ? "Adding…" : "Add POS account"}
      </Button>
    </form>
  );
}
