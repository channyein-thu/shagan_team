"use client";

import { StatusToggleButton } from "@/components/StatusToggleButton";
import { toggleMockServiceStatusAction } from "../../actions";

export function ServiceStatusControl({
  serviceId,
  buyerId,
  status,
}: {
  serviceId: string;
  buyerId: string;
  status: "active" | "suspended";
}) {
  return (
    <StatusToggleButton
      currentStatus={status}
      onToggle={(next) =>
        toggleMockServiceStatusAction(serviceId, buyerId, next)
      }
    />
  );
}
