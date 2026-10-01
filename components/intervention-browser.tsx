"use client";
import { Search } from "lucide-react";
import { useMemo,useState } from "react";
import type { InterventionRecord,RegionSnapshot } from "@/lib/nadi-data";
import { StatusBadge } from "./status-badge";
import { AskNadiButton } from "./ask-nadi-button";
import { InterventionCreate } from "./intervention-create";

export function InterventionBrowser({items,regions,autoOpen=false}:{items:InterventionRecord[];regions:RegionSnapshot[];autoOpen?:boolean}){
  const [q,setQ]=useState(""),[filter,setFilter]=useState("all");
  const filtered=useMemo(()=>items.filter(i=>(i.title+" "+i.id+" "+i.region).toLowerCase().includes(q.toLowerCase())&&(filter==="all"||i.status===filter)),[items,q,filter]);
  return <>
    <div className="toolbar intervention-toolbar"><label className="inline-search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari intervensi..."/></label><div className="pill-scroll">{[["all","All"],["active","Active"],["awaiting_evaluation","Awaiting evaluation"],["evaluated","Evaluated"]].map(([v,l])=><button key={v} className={"filter-pill "+(filter===v?"active":"")} onClick={()=>setFilter(v)}>{l}</button>)}</div><InterventionCreate autoOpen={autoOpen} regions={regions.map(r=>({slug:r.slug,name:r.name}))}/></div>
    <div className="intervention-list">{filtered.map(i=><article className="intervention-card" id={i.id} key={i.id}><div className="intervention-main"><div className="intervention-id">{i.id}</div><div><span className="eyebrow">{i.type} · {i.region}</span><h2>{i.title}</h2><p>{i.objective||"Tujuan belum dicatat."}</p><div className="tag-row"><StatusBadge tone={i.status==="active"?"positive":i.status==="awaiting_evaluation"?"warning":"info"}>{i.status.replaceAll("_"," ")}</StatusBadge><StatusBadge tone={i.simulation?"neutral":"positive"}>{i.simulation?"Simulation data":"Verified"}</StatusBadge></div></div></div><div className="intervention-side"><div><span>Coverage</span><b>{i.beneficiariesActual}/{i.beneficiariesTarget}</b></div><div><span>Agency</span><b>{i.agency}</b></div><div><span>Started</span><b>{i.startedAt?new Date(i.startedAt).toLocaleDateString("id-ID"):"—"}</b></div></div><AskNadiButton className="intervention-ai" label="Explain with AI" prompt={"Jelaskan status MEL untuk intervensi "+i.id+". Bedakan field simulasi dengan data resmi wilayah dan sebutkan apa yang belum tersedia untuk evaluasi outcome."}/></article>)}</div>
    {!filtered.length&&<div className="empty-state">Tidak ada intervensi yang cocok.</div>}
  </>;
}
