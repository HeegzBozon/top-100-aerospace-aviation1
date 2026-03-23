import { cn } from "@/lib/utils";

export function AdminFormSection({ title, description, children }) {
  return (
    <div className="space-y-3">
      {(title || description) && (
        <div>
          {title && <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>}
          {description && <p className="text-xs text-[var(--muted)]">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export function AdminFormGroup({ label, error, required, children, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-[var(--text)]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function AdminFormGrid({ columns = 2, children }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {children}
    </div>
  );
}