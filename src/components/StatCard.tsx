import type { ReactNode } from "react";

interface Props {
  icon?: ReactNode;
  label: string;
  value: string;
  badge?: string;
}

export default function StatCard({ icon, label, value, badge }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-start justify-between">
        {icon && <div className="text-primary">{icon}</div>}
        {badge && (
          <span className="text-xs font-semibold text-primary bg-secondary rounded-full px-2 py-0.5">{badge}</span>
        )}
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}
