"use client";

import { useActionState, useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import { Field } from "@/components/FormField";
import { Button } from "@/components/Button";
import { PlusIcon } from "@/components/icons";
import { addMockStudentAction } from "./actions";
import type { ActionState } from "@/lib/action-state";

const initialState: ActionState = {};

export function AddStudentForm({
  buyerId,
  serviceId,
}: {
  buyerId: string;
  serviceId: string;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await addMockStudentAction(prevState, formData);
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
        Add student
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add student">
        <form
          ref={formRef}
          action={formAction}
          className="flex flex-col gap-5"
        >
          <input type="hidden" name="buyer_id" value={buyerId} />
          <input type="hidden" name="service_id" value={serviceId} />
          <Field label="Name" name="name" type="text" required />
          <Field label="Email" name="email" type="email" required />
          {state.error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </p>
          )}
          <div className="mt-1 flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add student"}
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
