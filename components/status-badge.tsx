import type { ReactNode } from "react";
export function StatusBadge({ tone = "neutral", children }: { tone?: "critical" | "warning" | "positive" | "info" | "neutral"; children: ReactNode }) {
  return <span className={`status status-${tone}`}>{children}</span>;
}
