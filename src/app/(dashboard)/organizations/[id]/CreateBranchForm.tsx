"use client";

import { useActionState, useEffect, useRef } from "react";
import { createBranchAction } from "./actions";
import type { ActionState } from "@/lib/action-state";
import { Button } from "@/components/Button";
import { PlusIcon } from "@/components/icons";
import { inlineInputClass } from "@/components/inlineInputClass";

const initialState: ActionState = {};

export function CreateBranchForm({ orgId }: { orgId: string }) {
  const [state, formAction, pending] = useActionState(
    createBranchAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4"
    >
      <input type="hidden" name="org_id" value={orgId} />
      <h3 className="text-sm font-semibold text-slate-700">Add branch</h3>
      <div className="grid grid-cols-3 gap-3">
        <input
          name="name"
          placeholder="Name"
          required
          className={inlineInputClass}
        />
        <input
          name="address"
          placeholder="Address"
          required
          className={inlineInputClass}
        />
        <input
          name="phone"
          placeholder="Phone"
          required
          className={inlineInputClass}
        />
      </div>
      {state.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} size="sm" className="self-start">
        <PlusIcon className="h-3.5 w-3.5" />
        {pending ? "Adding…" : "Add branch"}
      </Button>
    </form>
  );
}
