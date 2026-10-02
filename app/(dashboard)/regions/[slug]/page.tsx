import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, Database, FileCheck2, ShieldCheck, TrendingUp } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { getRegionBySlug } from "@/lib/nadi-data";

function tone(priority:number|null){
  if(priority===1||priority===2) return "critical" as const;
  if(priority===3) return "warning" as const;
  if(priority===4) return "info" as const;
  return "positive" as const;
}

export default async function RegionDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data=await getRegionBySlug(slug);
  if(!data) notFound();
  const {region,interventions}=data;

  return <div className="page-stack">
    <Link className="back-link" href="/regions"><ArrowLeft size={16}/> Wilayah</Link>
    <section className="region-hero">
      <div><span className="eyebrow">{region.type} · VERIFIED IKP 2026</span><h1>{region.name}</h1><p>{region.notes}</p></div>
      <div className="region-hero-actions"><StatusBadge tone={tone(region.priority2026)}>{region.class2026}</StatusBadge></div>
    </section>

    <div className="region-profile-grid">
      <section className="panel profile-metrics verified-profile">
        <div><span>IKP 2026</span><b>{region.ikp2026?.toFixed(2)??"—"}</b><small>Bapanas · 12 indikator</small></div>
        <div><span>IKP 2025</span><b>{region.ikp2025?.toFixed(2)??"—"}</b><small>Dataset seri 2024–2026</small></div>
        <div><span>Perubahan</span><b>{region.ikpDelta===null?"—":(region.ikpDelta>0?"+":"")+region.ikpDelta.toFixed(2)}</b><small>2026 dibanding 2025</small></div>
        <div><span>Peringkat 2026</span><b>{region.rank2026===null?"—":"#"+Math.round(region.rank2026)}</b><small>Peringkat dalam dataset kab/kota</small></div>
        <div><span>Ketersediaan</span><b>{region.availability2026?.toFixed(2)??"—"}</b><small>Komponen IKP 2026</small></div>
        <div><span>Keterjangkauan</span><b>{region.access2026?.toFixed(2)??"—"}</b><small>Komponen IKP 2026</small></div>
        <div><span>Pemanfaatan</span><b>{region.utilization2026?.toFixed(2)??"—"}</b><small>Komponen IKP 2026</small></div>
        <div><span>Intervensi pilot</span><b>{interventions.length}</b><small>{interventions.length?"Simulation registry":"Belum ada record pilot"}</small></div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><span className="eyebrow">INTERVENTION JOURNEY</span><h2>Traceability</h2></div><span className="source-chip"><ShieldCheck size={14}/> Official indicator + labeled pilot</span></div>
        <div className="timeline">
          <div className="timeline-item done"><span><Database size={16}/></span><div><b>IKP 2026 tersedia</b><small>Official snapshot · Bapanas · source {region.sourceCode}</small></div></div>
          {interventions.map(item=><div className="timeline-item done" key={item.id}><span><FileCheck2 size={16}/></span><div><b>{item.title}</b><small>{item.startedAt?new Date(item.startedAt).toLocaleDateString("id-ID"):"Tanggal belum diisi"} · {item.type} · {item.simulation?"Simulation":"Verified"}</small></div></div>)}
          <div className={"timeline-item "+(region.pendingEvaluations?"current":"done")}><span>{region.pendingEvaluations?<Clock3 size={16}/>:<CheckCircle2 size={16}/>}</span><div><b>{region.pendingEvaluations?"Outcome review pending":"Tidak ada evaluasi tertunda"}</b><small>{region.pendingEvaluations?region.pendingEvaluations+" record memerlukan follow-up":"Berdasarkan registry pilot NADI"}</small></div></div>
        </div>
        <div className="data-note"><TrendingUp size={14}/> NADI tidak menampilkan PoU kabupaten/kota terbaru tanpa sumber resmi terverifikasi pada tingkat kedalaman yang sama. PoU 2025 yang tersedia saat ini digunakan pada agregat Provinsi Sulawesi Tengah.</div>
      </section>
    </div>
  </div>;
}
