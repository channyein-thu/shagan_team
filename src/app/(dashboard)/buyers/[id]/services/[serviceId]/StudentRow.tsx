"use client";

import { Avatar } from "@/components/Avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusToggleButton } from "@/components/StatusToggleButton";
import { toggleMockStudentStatusAction } from "./actions";

export function StudentRow({
  studentId,
  buyerId,
  serviceId,
  name,
  email,
  status,
}: {
  studentId: string;
  buyerId: string;
  serviceId: string;
  name: string;
  email: string;
  status: "active" | "suspended";
}) {
  return (
    <tr className="transition-colors hover:bg-slate-50/80">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar name={name} size="sm" />
          <span className="font-medium text-slate-900">{name}</span>
        </div>
      </td>
      <td className="px-5 py-3.5 text-slate-500">{email}</td>
      <td className="px-5 py-3.5">
        <StatusBadge status={status} />
      </td>
      <td className="px-5 py-3.5 text-right">
        <StatusToggleButton
          currentStatus={status}
          onToggle={(next) =>
            toggleMockStudentStatusAction(studentId, buyerId, serviceId, next)
          }
        />
      </td>
    </tr>
  );
}
