import { Check,Clock3,FileCheck2,ShieldCheck } from "lucide-react";
import { AskNadiButton } from "@/components/ask-nadi-button";
import { StatusBadge } from "@/components/status-badge";
import { getInterventions,getMonitoringOverview } from "@/lib/nadi-data";

export const metadata={title:"Monitoring"};

function stateTone(status:string){return status==="overdue"?"critical":status==="due"?"warning":status==="completed"?"positive":"info" as const;}

export default async function MonitoringPage(){
  const [items,data]=await Promise.all([getInterventions(),getMonitoringOverview()]);
  const cycles=(data.cycles as Array<Record<string,unknown>>);
  const evaluations=(data.evaluations as Array<Record<string,unknown>>);
  const due=cycles.filter(c=>["due","overdue"].includes(String(c.status))).length;
  return <div className="page-stack">
    <section className="page-heading"><div><span className="eyebrow">M&E WORKSPACE · NEON LIVE</span><h1>Monitoring</h1><p>Baseline, follow-up, outcome, dan evidence dibaca dari siklus monitoring database; tidak ada measurement demo buatan pada tampilan ini.</p></div><div className="heading-actions"><StatusBadge tone={due?"warning":"positive"}>{due} review due</StatusBadge><AskNadiButton prompt="Ringkas status monitoring dan evaluasi yang ada di NADI. Sebutkan yang due/overdue, evidence yang tersedia, dan mana yang simulasi." label="AI monitoring brief"/></div></section>
    <div className="monitoring-grid">
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">MONITORING CYCLES</span><h2>Queue & follow-up</h2></div></div>
        <div className="monitor-cycle-list">{cycles.length?cycles.map(c=><article className="monitor-cycle" key={String(c.id)}><span className={"cycle-icon "+String(c.status)}>{String(c.status)==="completed"?<Check size={15}/>:<Clock3 size={15}/>}</span><div><b>{String(c.intervention_title)}</b><small>{String(c.region_name)} · {String(c.stage).replaceAll("_"," ")} · due {c.due_at?new Date(String(c.due_at)).toLocaleDateString("id-ID"):"—"}</small><p>{c.notes?String(c.notes):"Belum ada catatan."}</p></div><StatusBadge tone={stateTone(String(c.status))}>{String(c.status)}</StatusBadge><AskNadiButton className="icon-ai-button" label="" prompt={"Jelaskan monitoring cycle untuk "+String(c.intervention_title)+", stage "+String(c.stage)+", status "+String(c.status)+". Apa yang masih dibutuhkan untuk menutup evaluasi?"}/></article>):<div className="empty-state">Belum ada monitoring cycle.</div>}</div>
      </section>
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">EVALUATIONS</span><h2>Evidence readiness</h2></div></div>
        <div className="evaluation-list">{evaluations.length?evaluations.map(e=><article className="evaluation-card" key={String(e.id)}><div className="evaluation-head"><span><FileCheck2 size={17}/></span><div><b>{String(e.intervention_title)}</b><small>{String(e.region_name)}</small></div></div><p>{e.evidence_summary?String(e.evidence_summary):"Evidence summary belum diisi."}</p><div className="tag-row"><StatusBadge tone="info">{String(e.outcome_status)}</StatusBadge><StatusBadge tone={String(e.verification_status)==="verified"?"positive":"neutral"}>{String(e.verification_status)}</StatusBadge></div></article>):<div className="empty-state">Belum ada evaluation record.</div>}</div>
        <div className="data-note"><ShieldCheck size={14}/> Record pilot yang ada tetap berlabel simulation. NADI tidak mengubahnya menjadi outcome resmi tanpa verification workflow.</div>
      </section>
    </div>
    <section className="panel"><div className="panel-head"><div><span className="eyebrow">INTERVENTION READINESS</span><h2>Registry coverage</h2></div></div><div className="readiness-table">{items.map(i=><div key={i.id}><b>{i.id}</b><span>{i.title}</span><small>{i.region}</small><StatusBadge tone={i.status==="awaiting_evaluation"?"warning":i.status==="active"?"positive":"info"}>{i.status.replaceAll("_"," ")}</StatusBadge></div>)}</div></section>
  </div>;
}
