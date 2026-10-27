import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
  accent = "bg-primary-soft text-primary",
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  /** Background and text colour of the icon tile. */
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm">
      <span
        className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg ${accent}`}
      >
        {icon}
      </span>
      <div>
        <p className="text-2xl font-bold text-ink">{value}</p>
        <p className="text-sm text-ink-muted">{label}</p>
      </div>
    </div>
  );
}
