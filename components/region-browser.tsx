"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { RegionSnapshot } from "@/lib/nadi-data";
import { StatusBadge } from "./status-badge";

function tone(priority:number|null){
  if(priority===1||priority===2) return "critical" as const;
  if(priority===3) return "warning" as const;
  if(priority===4) return "info" as const;
  return "positive" as const;
}

export function RegionBrowser({regions}:{regions:RegionSnapshot[]}){
  const [query,setQuery]=useState("");
  const [filter,setFilter]=useState<"all"|"pilot"|"attention">("all");
  const filtered=useMemo(()=>regions.filter(r=>{
    const matches=r.name.toLowerCase().includes(query.toLowerCase());
    const state=filter==="all" || (filter==="pilot"&&r.pilot) || (filter==="attention"&&(r.priority2026??6)<=4);
    return matches&&state;
  }),[regions,query,filter]);

  return <>
    <div className="region-toolbar">
      <label className="inline-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari kabupaten/kota..."/></label>
      <div className="pill-scroll">
        <button className={"filter-pill "+(filter==="all"?"active":"")} onClick={()=>setFilter("all")}>Semua {regions.length}</button>
        <button className={"filter-pill "+(filter==="pilot"?"active":"")} onClick={()=>setFilter("pilot")}>Pilot MEL</button>
        <button className={"filter-pill "+(filter==="attention"?"active":"")} onClick={()=>setFilter("attention")}>Kelas ≤ Agak Tahan</button>
      </div>
    </div>
    <div className="region-grid">
      {filtered.map(r=><article className="region-card" key={r.slug}>
        <Link href={"/regions/"+r.slug} className="region-card-link">
          <div className="region-card-top"><div><span className="eyebrow">{r.type} · IKP 2026</span><h2>{r.name}</h2></div><StatusBadge tone={tone(r.priority2026)}>{r.class2026}</StatusBadge></div>
          <div className="region-metrics">
            <div><small>IKP 2026</small><strong>{r.ikp2026?.toFixed(2)??"—"}</strong></div>
            <div><small>Δ vs 2025</small><strong>{r.ikpDelta===null?"—":(r.ikpDelta>0?"+":"")+r.ikpDelta.toFixed(2)}</strong></div>
            <div><small>PoU 2025</small><strong>{r.pou2025===null?"—":r.pou2025.toFixed(2)+"%"}</strong></div>
          </div>
          <p>{r.notes}</p>
          <div className="region-card-foot"><span>{r.pilot?"Pilot MEL + official indicators":"Official indicators"}</span><span>Open →</span></div>
        </Link>
      </article>)}
    </div>
    {!filtered.length&&<div className="empty-state">Tidak ada wilayah yang cocok dengan pencarian/filter.</div>}
  </>;
}
