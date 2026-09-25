"use client";

import { useActionState, useEffect, useRef } from "react";
import { createDeviceAction } from "./actions";
import type { ActionState } from "@/lib/action-state";
import { Button } from "@/components/Button";
import { PlusIcon } from "@/components/icons";
import { inlineInputClass } from "@/components/inlineInputClass";

const initialState: ActionState = {};

export function CreateDeviceForm({
  orgId,
  branches,
}: {
  orgId: string;
  branches: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    createDeviceAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  if (branches.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-500">
        Add a branch before creating devices.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4"
    >
      <input type="hidden" name="org_id" value={orgId} />
      <h3 className="text-sm font-semibold text-slate-700">Add device</h3>
      <div className="grid grid-cols-2 gap-3">
        <input
          name="name"
          placeholder="Device name"
          required
          className={inlineInputClass}
        />
        <select
          name="branch_id"
          required
          defaultValue=""
          className={inlineInputClass}
        >
          <option value="" disabled>
            Select branch
          </option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>
      {state.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} size="sm" className="self-start">
        <PlusIcon className="h-3.5 w-3.5" />
        {pending ? "Adding…" : "Add device"}
      </Button>
    </form>
  );
}
