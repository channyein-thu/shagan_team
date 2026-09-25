"use client";

import { StatusToggleButton } from "@/components/StatusToggleButton";
import { setOrganizationStatusAction } from "./actions";
import type { OrgStatus } from "@/lib/backend/types";

export function OrgStatusControl({
  orgId,
  status,
}: {
  orgId: string;
  status: OrgStatus;
}) {
  return (
    <StatusToggleButton
      currentStatus={status}
      confirmMessage={
        status === "active"
          ? "Suspend this organization? This immediately blocks login for every user in it."
          : undefined
      }
      onToggle={(next) => setOrganizationStatusAction(orgId, next)}
    />
  );
}
