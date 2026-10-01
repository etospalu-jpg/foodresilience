"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Layers3 } from "lucide-react";
import { regions } from "@/lib/data";
import { StatusBadge } from "./status-badge";

const layers = ["Risk","IKP","PoU","Intervention","Outcome","Coverage"];

export function RegionMap({ compact = false }: { compact?: boolean }) {
  const [layer,setLayer]=useState("Risk");
  const [selected,setSelected]=useState(regions[0].slug);
  const region=useMemo(()=>regions.find(r=>r.slug===selected)??regions[0],[selected]);
  return <section className={`map-panel ${compact?"map-compact":""}`}>
    <div className="panel-head map-head"><div><div className="eyebrow">SPATIAL INTELLIGENCE</div><h2>Intelligence Map</h2></div><button className="icon-button" aria-label="Layer settings"><Layers3 size={18}/></button></div>
    <div className="pill-scroll">{layers.map(item=><button key={item} onClick={()=>setLayer(item)} className={`filter-pill ${layer===item?"active":""}`}>{item}</button>)}</div>
    <div className="map-stage" aria-label={`Pilot spatial view, layer ${layer}`}><div className="map-topography"/><div className="map-watermark">SULAWESI TENGAH · PILOT COVERAGE</div>{regions.map(r=><button key={r.slug} className={`map-pin pin-${r.risk} ${selected===r.slug?"selected":""}`} style={{left:`${r.x}%`,top:`${r.y}%`}} onClick={()=>setSelected(r.slug)}><span/><b>{r.name}</b></button>)}</div>
    <div className="map-detail"><div><div className="map-region-title">{region.name}</div><div className="map-region-meta">{region.type} · Updated {region.lastUpdated}</div></div><div className="map-mini-metrics"><div><span>IKP</span><b>{region.ikp.toFixed(2)}</b></div><div><span>PoU</span><b>{region.pou.toFixed(2)}%</b></div></div><StatusBadge tone={region.risk==="critical"?"critical":region.risk==="high"?"warning":"positive"}>{region.risk==="stable"?"Relatif stabil":"Priority attention"}</StatusBadge><Link className="text-link" href={`/regions/${region.slug}`}>Open region <ChevronRight size={15}/></Link></div>
  </section>;
}
