"use client";

import { useActionState, useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import { Field } from "@/components/FormField";
import { Button } from "@/components/Button";
import { PlusIcon } from "@/components/icons";
import { createBuyerAction, type ActionState } from "./actions";

const initialState: ActionState = {};

export function CreateBuyerForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await createBuyerAction(prevState, formData);
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
        New buyer
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create buyer"
        description="Add a new customer to start tracking what they've purchased."
      >
        <form
          ref={formRef}
          action={formAction}
          className="flex flex-col gap-5"
        >
          <Field label="Name" name="name" type="text" required />
          <div className="grid grid-cols-2 gap-5">
            <Field label="Email" name="email" type="email" required />
            <Field label="Phone" name="phone" type="tel" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Company" name="company" type="text" />
            <Field
              label="Billing address"
              name="billingAddress"
              type="text"
            />
          </div>
          {state.error && (
            <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}
          <div className="mt-1 flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create buyer"}
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
