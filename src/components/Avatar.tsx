const sizeClasses = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: keyof typeof sizeClasses;
}) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "?";

  return (
    <span
      className={`inline-flex flex-none items-center justify-center rounded-lg bg-primary-soft font-semibold text-primary ${sizeClasses[size]}`}
    >
      {initials}
    </span>
  );
}
