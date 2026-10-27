"use client";

import { useState, useTransition } from "react";

export function StatusToggleButton({
  currentStatus,
  onToggle,
  confirmMessage,
}: {
  currentStatus: "active" | "suspended";
  onToggle: (nextStatus: "active" | "suspended") => Promise<void>;
  confirmMessage?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const nextStatus = currentStatus === "active" ? "suspended" : "active";
  const isSuspending = nextStatus === "suspended";

  function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await onToggle(nextStatus);
      } catch {
        setError("Failed to update status.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={pending}
        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
          isSuspending
            ? "border-danger/30 text-danger hover:bg-danger-soft"
            : "border-success/30 text-success hover:bg-success-soft"
        }`}
      >
        {pending ? "Updating…" : isSuspending ? "Suspend" : "Reactivate"}
      </button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
