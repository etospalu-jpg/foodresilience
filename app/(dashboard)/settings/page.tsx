import { Database, KeyRound, SlidersHorizontal, Users, ExternalLink, ShieldCheck, Bot } from "lucide-react";
import { getSources } from "@/lib/nadi-data";
import { hasDatabaseUrl } from "@/lib/db";
import { StatusBadge } from "@/components/status-badge";

export const metadata={title:"Settings"};

export default async function SettingsPage(){
 const sources=await getSources();
 const db=hasDatabaseUrl();
 const ai=Boolean(process.env.GEMINI_API_KEY);
 return <div className="page-stack">
  <section className="page-heading"><div><span className="eyebrow">SYSTEM CONFIGURATION</span><h1>Settings</h1><p>Status koneksi, provenance sumber, dan batas aman pilot.</p></div></section>
  <div className="settings-grid">{[[SlidersHorizontal,"Indicators & rules","Threshold dan rule alert tetap transparan dan terpisah dari keputusan manusia."],[Database,"Data sources",sources.length+" source record tersimpan di Neon."],[Users,"Users & roles","UI role switch masih mode demo; auth/RBAC wajib sebelum implementasi resmi."],[KeyRound,"Security","Secret berada server-side; write API pilot selalu simulation + audit log."]].map(([Icon,title,desc])=>{const I=Icon as typeof Database;return <article className="settings-card" key={String(title)}><span><I size={20}/></span><div><h2>{String(title)}</h2><p>{String(desc)}</p></div></article>})}</div>

  <section className="panel" id="sources"><div className="panel-head"><div><span className="eyebrow">DATA PROVENANCE</span><h2>Verified & pilot sources</h2></div><StatusBadge tone="positive">{sources.filter(s=>s.verified).length} verified</StatusBadge></div>
   <div className="source-list">{sources.map(s=><article key={s.code}><div><b>{s.name}</b><small>{s.code} · {s.period??"periode tidak dicatat"} · {s.sourceType}</small></div><StatusBadge tone={s.verified?"positive":"neutral"}>{s.verified?"Verified":"Not verified"}</StatusBadge>{s.reference&&<a href={s.reference} target="_blank" rel="noreferrer" className="icon-button" aria-label="Buka sumber"><ExternalLink size={16}/></a>}</article>)}</div>
  </section>

  <section className="panel"><div className="panel-head"><div><span className="eyebrow">ENVIRONMENT</span><h2>Connection status</h2></div></div><div className="connection-list">
    <div><span className="ready-dot good"/><div><b>GitHub repository</b><small>etospalu-jpg/foodresilience</small></div></div>
    <div><span className={"ready-dot "+(db?"good":"warn")}/><div><b>Neon runtime</b><small>{db?"Database URL available to server runtime":"Database variable missing"}</small></div></div>
    <div><span className={"ready-dot "+(ai?"good":"warn")}/><div><b>NADI Insight</b><small>{ai?"Gemini API configured server-side":"Gemini key missing"}</small></div></div>
    <div><span className="ready-dot good"/><div><b>Data safety</b><small><ShieldCheck size={12}/> Official and simulation records are labeled separately.</small></div></div>
  </div></section>

  <section className="panel security-note"><Bot size={18}/><div><b>Before institutional production use</b><p>Tambahkan authentication/RBAC, approval workflow, operator identity, dan stricter write permissions. MVP ini sengaja membatasi AI menjadi read-only.</p></div></section>
 </div>;
}
