import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-8">
      <p className="eyebrow">AFL Imports Studio</p>
      <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
    </header>
  );
}

export function Panel({ label, title, children }: { label?: string; title?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      {label && <p className="eyebrow">{label}</p>}
      {title && <h3 className="mt-1 mb-3 text-base font-semibold">{title}</h3>}
      <div className={label || title ? "mt-3 space-y-4" : "space-y-4"}>{children}</div>
    </section>
  );
}

export function ChipGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Button
          key={o.value}
          type="button"
          size="sm"
          variant="chip"
          data-active={value === o.value}
          onClick={() => onChange(o.value)}
          title={o.hint}
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs font-medium text-muted-foreground">{children}</p>;
}
