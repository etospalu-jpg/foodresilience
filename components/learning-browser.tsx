"use client";
import { BookOpenCheck,Search } from "lucide-react";
import { useMemo,useState } from "react";
import type { LearningRecord } from "@/lib/nadi-data";
import { StatusBadge } from "./status-badge";
import { AskNadiButton } from "./ask-nadi-button";

export function LearningBrowser({items}:{items:LearningRecord[]}){
  const [q,setQ]=useState("");
  const filtered=useMemo(()=>items.filter(i=>(i.title+" "+(i.region??"")+" "+(i.tag??"")).toLowerCase().includes(q.toLowerCase())),[items,q]);
  return <><label className="inline-search learning-search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari learning..."/></label><div className="learning-grid">{filtered.map(card=><article className="learning-card" key={card.id}><div className="learning-icon"><BookOpenCheck size={20}/></div><StatusBadge tone="neutral">{card.tag??"Learning"}</StatusBadge><h2>{card.title}</h2><p>{card.whatHappened??card.whatWorked??"Catatan belum lengkap."}</p>{card.whatWorked&&<div className="learning-highlight"><b>Worked</b><span>{card.whatWorked}</span></div>}<div className="learning-foot"><span>{card.region??"Lintas wilayah"}</span><span>{card.simulation?"Simulation":"Verified"}</span></div><AskNadiButton className="secondary-button full" label="Ask NADI" prompt={"Jelaskan learning note '"+card.title+"' dan hubungannya dengan siklus MEL. Pastikan menyebut status simulasi atau verifikasi."}/></article>)}</div></>;
}
