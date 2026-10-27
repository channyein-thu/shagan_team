"use client";

import { useActionState, useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import { Field } from "@/components/FormField";
import { Button } from "@/components/Button";
import { PlusIcon } from "@/components/icons";
import { addOrganizationServiceAction } from "./actions";
import type { ActionState } from "@/lib/action-state";

const initialState: ActionState = {};

export function AddOrganizationForm({ buyerId }: { buyerId: string }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await addOrganizationServiceAction(prevState, formData);
      if (result.success) {
        formRef.current?.reset();
        setOpen(false);
      }
      return result;
    },
    initialState,
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon className="h-4 w-4" />
        Add organization
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add POS organization"
        description="Creates a real POS tenant on the Shagan backend and links it to this buyer."
      >
        <form
          ref={formRef}
          action={formAction}
          className="flex flex-col gap-5"
        >
          <input type="hidden" name="buyer_id" value={buyerId} />
          <Field
            label="Organization name"
            name="organization_name"
            type="text"
            required
          />
          <div className="grid grid-cols-2 gap-5">
            <Field
              label="Owner email"
              name="owner_email"
              type="email"
              required
            />
            <Field
              label="Owner password"
              name="owner_password"
              type="password"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Field
              label="Service center email"
              name="service_center_email"
              type="email"
              required
            />
            <Field
              label="Service center password"
              name="service_center_password"
              type="password"
              required
            />
          </div>
          {state.error && (
            <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="mt-1 flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create organization"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
