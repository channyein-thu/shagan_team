export function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        isActive
          ? "bg-success-soft text-success ring-success/20"
          : "bg-danger-soft text-danger ring-danger/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-success" : "bg-danger"}`}
      />
      {status}
    </span>
  );
}
