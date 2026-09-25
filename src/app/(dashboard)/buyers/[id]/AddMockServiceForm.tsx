"use client";

import { useActionState, useRef, useState } from "react";
import { Modal } from "@/components/Modal";
import { Field } from "@/components/FormField";
import { Button } from "@/components/Button";
import { PlusIcon } from "@/components/icons";
import { addMockServiceAction } from "./actions";
import type { ActionState } from "@/lib/action-state";
import { SERVICE_COLORS, SERVICE_ICONS, type ServiceType } from "@/lib/buyer/types";

const initialState: ActionState = {};

export function AddMockServiceForm({
  buyerId,
  serviceType,
  buttonLabel,
  modalTitle,
  modalDescription,
  nameLabel,
  contactLabel,
}: {
  buyerId: string;
  serviceType: ServiceType;
  buttonLabel: string;
  modalTitle: string;
  modalDescription?: string;
  nameLabel: string;
  contactLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await addMockServiceAction(prevState, formData);
      if (result.success) {
        formRef.current?.reset();
        setOpen(false);
      }
      return result;
    },
    initialState,
  );

  const Icon = SERVICE_ICONS[serviceType];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium transition-colors ${SERVICE_COLORS[serviceType].button}`}
      >
        <Icon className="h-4 w-4" />
        {buttonLabel}
        <PlusIcon className="h-3.5 w-3.5" />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={modalTitle}
        description={modalDescription}
      >
        <form
          ref={formRef}
          action={formAction}
          className="flex flex-col gap-5"
        >
          <input type="hidden" name="buyer_id" value={buyerId} />
          <input type="hidden" name="service_type" value={serviceType} />
          <Field label={nameLabel} name="name" type="text" required />
          <Field
            label={contactLabel}
            name="contact_email"
            type="email"
            required
          />
          {state.error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </p>
          )}
          <div className="mt-1 flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add service"}
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
