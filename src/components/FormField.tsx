export function Field({
  label,
  name,
  type,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        minLength={type === "password" ? 8 : undefined}
        className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
    </div>
  );
}
