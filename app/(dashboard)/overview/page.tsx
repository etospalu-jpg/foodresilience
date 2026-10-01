import Link from "next/link";
import { Activity, AlertTriangle, ClipboardCheck, MapPinned, MoveRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { RegionMap } from "@/components/region-map";
import { StatusBadge } from "@/components/status-badge";
import { AskNadiButton } from "@/components/ask-nadi-button";
import { InterventionCreate } from "@/components/intervention-create";
import { getAlerts, getInterventions, getProvinceSnapshot, getRegions } from "@/lib/nadi-data";

export const metadata = { title: "Overview" };

function tone(severity:string){ return severity==="critical"?"critical":severity==="warning"?"warning":"info" as const; }

export default async function OverviewPage() {
  const [regions,interventions,alerts,province]=await Promise.all([getRegions(),getInterventions(),getAlerts(),getProvinceSnapshot()]);
  const pending=interventions.filter(i=>i.status==="awaiting_evaluation").length;
  const pilots=regions.filter(r=>r.pilot).length;
  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <span className="eyebrow">EXECUTIVE INTELLIGENCE</span>
          <h1>Overview</h1>
          <p>Indikator resmi terbaru dipisahkan dari record pilot MEL. IKP memakai rilis Bapanas 2026; PoU yang terverifikasi di dashboard ini ditampilkan pada tingkat provinsi untuk 2025.</p>
        </div>
        <div className="heading-actions">
          <span className="source-chip"><ShieldCheck size={15}/> Verified sources + labeled simulation</span>
          <AskNadiButton prompt="Berikan ringkasan eksekutif dashboard NADI saat ini. Gunakan IKP 2026 resmi, PoU provinsi 2025, status intervensi, alert, dan jelaskan mana yang simulasi." label="AI summary"/>
          <InterventionCreate regions={regions.map(r=>({slug:r.slug,name:r.name}))}/>
        </div>
      </section>

      <div className="metric-strip">
        <MetricCard label="Kab/kota terverifikasi" value={regions.length} note="Bapanas IKP 2026" icon={MapPinned}/>
        <MetricCard label="IKP Sulteng 2026" value={province.ikp2026?.toFixed(2) ?? "—"} note={province.class2026} icon={TrendingUp}/>
        <MetricCard label="PoU Sulteng 2025" value={province.pou2025===null?"—":province.pou2025.toFixed(2)+"%"} note="BPS · agregat provinsi" icon={AlertTriangle}/>
        <MetricCard label="Evaluasi pilot tertunda" value={pending} note={pilots+" wilayah punya record pilot"} icon={ClipboardCheck}/>
      </div>

      <div className="overview-grid">
        <section className="panel attention-panel">
          <div className="panel-head"><div><span className="eyebrow">ATTENTION QUEUE</span><h2>Perlu review MEL</h2></div><Link href="/alerts" className="text-link">See all <MoveRight size={15}/></Link></div>
          <div className="attention-list">
            {alerts.length?alerts.slice(0,3).map(alert=><div className="attention-row" key={alert.id}>
              <span className={"attention-dot "+alert.severity}/>
              <div><b>{alert.title}</b><span>{alert.region ?? "Lintas wilayah"} · {alert.subtitle}</span></div>
              <AskNadiButton className="mini-ai-button" label="Explain" prompt={"Jelaskan alert "+alert.id+" ("+alert.title+") di "+(alert.region??"lintas wilayah")+". Gunakan hanya konteks NADI dan jelaskan rule, bukti yang tersedia, serta data yang masih kurang."}/>
            </div>):<div className="empty-state">Tidak ada alert terbuka.</div>}
          </div>
        </section>

        <section className="panel resilience-panel">
          <div className="panel-head"><div><span className="eyebrow">CLOSED-LOOP MEL</span><h2>Intervention loop</h2></div><StatusBadge tone="positive">Neon live</StatusBadge></div>
          <div className="loop-visual">
            {[["Detect",regions.length+" kab/kota"],["Intervene",interventions.length+" records"],["Measure",pending+" pending"],["Learn","Neon repository"]].map(([a,b],i)=><div className="loop-step" key={a}><span>{i+1}</span><div><b>{a}</b><small>{b}</small></div></div>)}
          </div>
          <div className="loop-note">NADI tidak menyamakan indikator kerentanan dengan outcome intervensi. Record pilot harus ditautkan ke baseline, follow-up, bukti, dan learning sebelum dianggap selesai.</div>
        </section>
      </div>

      <RegionMap regions={regions} compact />

      <section className="panel">
        <div className="panel-head"><div><span className="eyebrow">INTERVENTION REGISTRY</span><h2>Aktivitas pilot terbaru</h2></div><Link href="/interventions" className="text-link">Open registry <MoveRight size={15}/></Link></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Intervensi</th><th>Wilayah</th><th>Coverage</th><th>Status</th><th>Source</th><th>AI</th></tr></thead>
            <tbody>{interventions.map(i=><tr key={i.id}>
              <td><b>{i.title}</b><span>{i.id} · {i.type}</span></td>
              <td>{i.region}</td>
              <td>{i.beneficiariesActual}/{i.beneficiariesTarget}</td>
              <td><StatusBadge tone={i.status==="active"?"positive":i.status==="awaiting_evaluation"?"warning":"info"}>{i.status.replaceAll("_"," ")}</StatusBadge></td>
              <td><StatusBadge tone={i.simulation?"neutral":"positive"}>{i.simulation?"Simulation":"Verified"}</StatusBadge></td>
              <td><AskNadiButton className="icon-ai-button" label="" prompt={"Jelaskan record intervensi "+i.id+" dan apa yang sudah/belum tersedia untuk monitoring dan evaluasi. Jangan anggap outcome simulasi sebagai fakta."}/></td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="mobile-card-list">{interventions.map(i=><article className="mobile-data-card" key={i.id}><div><span className="eyebrow">{i.id} · {i.type}</span><h3>{i.title}</h3><p>{i.region}</p></div><div className="mobile-data-meta"><span><small>Coverage</small><b>{i.beneficiariesActual}/{i.beneficiariesTarget}</b></span><StatusBadge tone={i.status==="active"?"positive":"warning"}>{i.status.replaceAll("_"," ")}</StatusBadge></div><AskNadiButton className="secondary-button full" label="Jelaskan dengan AI" prompt={"Jelaskan intervensi "+i.id+" secara MEL, termasuk status evaluasi dan keterbatasan data."}/></article>)}</div>
      </section>
    </div>
  );
}
