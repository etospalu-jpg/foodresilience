"use client";
import { AlertTriangle,CheckCircle2 } from "lucide-react";
import { useMemo,useState } from "react";
import type { AlertRecord } from "@/lib/nadi-data";
import { StatusBadge } from "./status-badge";
import { AskNadiButton } from "./ask-nadi-button";

export function AlertBrowser({alerts}:{alerts:AlertRecord[]}){
  const [filter,setFilter]=useState("all");
  const filtered=useMemo(()=>alerts.filter(a=>filter==="all"||a.severity===filter),[alerts,filter]);
  return <>
    <div className="pill-scroll alert-filter">{["all","critical","warning","info"].map(v=><button key={v} className={"filter-pill "+(filter===v?"active":"")} onClick={()=>setFilter(v)}>{v}</button>)}</div>
    <div className="alert-list">{filtered.map(a=><article className="alert-card" key={a.id}><div className={"alert-icon "+a.severity}>{a.severity==="info"?<CheckCircle2 size={19}/>:<AlertTriangle size={19}/>}</div><div><span className="eyebrow">{a.kind.toUpperCase()} · {a.region??"Lintas wilayah"}</span><h2>{a.title}</h2><p>{a.subtitle}</p></div><div className="alert-actions"><StatusBadge tone={a.severity==="critical"?"critical":a.severity==="warning"?"warning":"info"}>{a.status}</StatusBadge><AskNadiButton label="Review with AI" prompt={"Review alert "+a.id+": "+a.title+". Jelaskan rule yang memicu sinyal, data pendukung yang tersedia, keterbatasan, dan langkah verifikasi manusia. Jangan memutuskan kebijakan."}/></div></article>)}</div>
  </>;
}
