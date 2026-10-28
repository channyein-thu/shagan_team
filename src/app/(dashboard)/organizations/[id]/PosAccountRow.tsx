"use client";

import { useActionState, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusToggleButton } from "@/components/StatusToggleButton";
import { Button } from "@/components/Button";
import { resetPosPasswordAction, setPosAccountStatusAction } from "./actions";
import type { ActionState } from "@/lib/action-state";
import type { AccountStatus, Device } from "@/lib/backend/types";

const initialState: ActionState = {};

export function PosAccountRow({
  accountId,
  orgId,
  email,
  status,
  device,
}: {
  accountId: string;
  orgId: string;
  email: string;
  status: AccountStatus;
  device: Device | undefined;
}) {
  const [resetting, setResetting] = useState(false);

  return (
    <tr className="transition-colors hover:bg-canvas">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar name={email} size="sm" />
          <span className="font-medium text-ink">{email}</span>
        </div>
      </td>
      <td className="px-5 py-3.5 text-ink-muted">{device?.name ?? "—"}</td>
      <td className="px-5 py-3.5">
        <StatusBadge status={status} />
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-2">
          <StatusToggleButton
            currentStatus={status}
            onToggle={(next) =>
              setPosAccountStatusAction(accountId, orgId, next)
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetting((v) => !v)}
          >
            Reset password
          </Button>
        </div>
        {resetting && (
          <ResetPasswordForm
            accountId={accountId}
            orgId={orgId}
            onDone={() => setResetting(false)}
          />
        )}
      </td>
    </tr>
  );
}

function ResetPasswordForm({
  accountId,
  orgId,
  onDone,
}: {
  accountId: string;
  orgId: string;
  onDone: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await resetPosPasswordAction(prevState, formData);
      if (result.success) {
        formRef.current?.reset();
        onDone();
      }
      return result;
    },
    initialState,
  );

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-2 flex items-center justify-end gap-2"
    >
      <input type="hidden" name="account_id" value={accountId} />
      <input type="hidden" name="org_id" value={orgId} />
      <input
        name="password"
        type="password"
        placeholder="New password"
        required
        minLength={8}
        className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Saving…" : "Save"}
      </Button>
      {state.error && (
        <span className="text-xs text-danger">{state.error}</span>
      )}
    </form>
  );
}
