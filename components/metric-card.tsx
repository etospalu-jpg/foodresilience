import type { LucideIcon } from "lucide-react";
export function MetricCard({ label, value, note, icon: Icon }: { label: string; value: string | number; note: string; icon: LucideIcon }) {
  return <article className="metric-card"><div className="metric-top"><span className="metric-icon"><Icon size={18}/></span><span className="metric-label">{label}</span></div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></article>;
}
