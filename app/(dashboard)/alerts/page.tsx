import { AlertBrowser } from "@/components/alert-browser";
import { StatusBadge } from "@/components/status-badge";
import { getAlerts } from "@/lib/nadi-data";

export const metadata={title:"Alerts"};

export default async function AlertsPage(){
  const alerts=await getAlerts();
  return <div className="page-stack">
    <section className="page-heading"><div><span className="eyebrow">DECISION INTELLIGENCE</span><h1>Attention Inbox</h1><p>Sinyal rule-based untuk coverage, evaluasi, freshness, dan review. Alert adalah pemicu pemeriksaan manusia, bukan keputusan kebijakan.</p></div><StatusBadge tone="info">Rule engine V1 · {alerts.length} open</StatusBadge></section>
    <section className="panel"><AlertBrowser alerts={alerts}/></section>
  </div>;
}
