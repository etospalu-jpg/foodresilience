import Link from "next/link";
import { Activity, AlertTriangle, ClipboardCheck, MapPinned, MoveRight, ShieldCheck } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { RegionMap } from "@/components/region-map";
import { alerts, interventions, regions } from "@/lib/data";
import { StatusBadge } from "@/components/status-badge";

export const metadata = { title: "Overview" };

export default function OverviewPage() {
  const pending = interventions.filter(i => i.status === "awaiting_evaluation").length;
  const coverage = regions.filter(r => r.coverageGap).length;
  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><span className="eyebrow">EXECUTIVE INTELLIGENCE</span><h1>Overview</h1><p>One view of vulnerability, intervention coverage, follow-up, and learning readiness.</p></div>
        <div className="heading-actions"><span className="source-chip"><ShieldCheck size={15}/> Public indicators + simulation interventions</span><button className="primary-button"><Activity size={17}/> New intervention</button></div>
      </section>

      <div className="metric-strip">
        <MetricCard label="Wilayah dipantau" value={regions.length} note="Pilot coverage" icon={MapPinned}/>
        <MetricCard label="Coverage gaps" value={coverage} note="Needs intervention review" icon={AlertTriangle}/>
        <MetricCard label="Evaluasi tertunda" value={pending} note="Follow-up required" icon={ClipboardCheck}/>
        <MetricCard label="Intervensi aktif" value={interventions.filter(i => i.status === "active").length} note="Across pilot areas" icon={Activity}/>
      </div>

      <div className="overview-grid">
        <section className="panel attention-panel">
          <div className="panel-head"><div><span className="eyebrow">ATTENTION QUEUE</span><h2>Perlu perhatian</h2></div><Link href="/alerts" className="text-link">See all <MoveRight size={15}/></Link></div>
          <div className="attention-list">
            {alerts.slice(0,3).map(alert => <Link href="/alerts" className="attention-row" key={alert.id}>
              <span className={`attention-dot ${alert.severity}`}/>
              <div><b>{alert.title}</b><span>{alert.region} · {alert.subtitle}</span></div>
              <StatusBadge tone={alert.severity === "critical" ? "critical" : alert.severity === "warning" ? "warning" : "info"}>{alert.age}</StatusBadge>
            </Link>)}
          </div>
        </section>

        <section className="panel resilience-panel">
          <div className="panel-head"><div><span className="eyebrow">OUTCOME READINESS</span><h2>Intervention loop</h2></div><StatusBadge tone="positive">MEL active</StatusBadge></div>
          <div className="loop-visual">
            {[["Detect","5 regions"],["Intervene","4 records"],["Measure","2 pending"],["Learn","3 notes"]].map(([a,b],i) => <div className="loop-step" key={a}><span>{i+1}</span><div><b>{a}</b><small>{b}</small></div></div>)}
          </div>
          <div className="loop-note">The prototype prioritizes traceability: every intervention should be connected to an initial condition, a follow-up, and a learning record.</div>
        </section>
      </div>

      <RegionMap compact />

      <section className="panel">
        <div className="panel-head"><div><span className="eyebrow">INTERVENTION REGISTRY</span><h2>Aktivitas terbaru</h2></div><Link href="/interventions" className="text-link">Open registry <MoveRight size={15}/></Link></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Intervensi</th><th>Wilayah</th><th>Coverage</th><th>Status</th><th>Source</th></tr></thead>
            <tbody>{interventions.map(i => <tr key={i.id}><td><b>{i.title}</b><span>{i.id} · {i.type}</span></td><td>{i.region}</td><td>{i.beneficiariesActual}/{i.beneficiariesTarget} KK</td><td><StatusBadge tone={i.status === "active" ? "positive" : i.status === "awaiting_evaluation" ? "warning" : "info"}>{i.status.replaceAll("_"," ")}</StatusBadge></td><td><StatusBadge tone="neutral">Simulation</StatusBadge></td></tr>)}</tbody>
          </table>
        </div>
        <div className="mobile-card-list">{interventions.map(i => <article className="mobile-data-card" key={i.id}><div><span className="eyebrow">{i.id} · {i.type}</span><h3>{i.title}</h3><p>{i.region}</p></div><div className="mobile-data-meta"><span><small>Coverage</small><b>{i.beneficiariesActual}/{i.beneficiariesTarget} KK</b></span><StatusBadge tone={i.status === "active" ? "positive" : "warning"}>{i.status.replaceAll("_"," ")}</StatusBadge></div></article>)}</div>
      </section>
    </div>
  );
}
