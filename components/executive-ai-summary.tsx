"use client";

import { RefreshCw, Sparkles, MessageCircleMore, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const CACHE_KEY="nadi-executive-ai-v1";
const TTL=10*60*1000;

type Cache={answer:string;at:number;contextMode?:string};

export function ExecutiveAiSummary(){
  const [answer,setAnswer]=useState("");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [updatedAt,setUpdatedAt]=useState<number|null>(null);
  const [contextMode,setContextMode]=useState("");

  const load=useCallback(async(force=false)=>{
    setError("");
    if(!force){
      try{
        const raw=sessionStorage.getItem(CACHE_KEY);
        if(raw){
          const cached=JSON.parse(raw) as Cache;
          if(cached.answer&&Date.now()-cached.at<TTL){
            setAnswer(cached.answer); setUpdatedAt(cached.at); setContextMode(cached.contextMode??""); setLoading(false); return;
          }
        }
      }catch{}
    }
    setLoading(true);
    try{
      const response=await fetch("/api/insight",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          question:"Buat analisis eksekutif keseluruhan dashboard NADI saat ini. Rangkum kondisi IKP terbaru, variasi antarwilayah, status intervensi pilot, alert MEL, monitoring/evaluasi, learning, serta keterbatasan data. Bedakan tegas data resmi dan data simulasi. Jangan membuat keputusan kebijakan. Tulis ringkas dalam 4-6 butir utama lalu satu kalimat catatan verifikasi."
        })
      });
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Analisis AI belum tersedia.");
      const at=Date.now();
      setAnswer(data.answer||""); setUpdatedAt(at); setContextMode(data.contextMode||"");
      try{sessionStorage.setItem(CACHE_KEY,JSON.stringify({answer:data.answer,at,contextMode:data.contextMode}));}catch{}
    }catch(e){
      setError(e instanceof Error?e.message:"Analisis AI belum tersedia.");
    }finally{setLoading(false);}
  },[]);

  useEffect(()=>{void load(false);},[load]);

  function openChat(){
    window.dispatchEvent(new CustomEvent("nadi:ask",{detail:{}}));
  }

  return <section className="ai-overview-card" aria-label="Analisis AI keseluruhan">
    <div className="ai-overview-top">
      <div className="ai-overview-identity">
        <span className="ai-overview-icon"><Sparkles size={19}/></span>
        <div><span className="eyebrow">NADI AI · EXECUTIVE ANALYSIS</span><h2>Analisis keseluruhan dashboard</h2></div>
      </div>
      <div className="ai-overview-actions">
        <span className="ai-live-chip"><span className="ready-dot good"/> {contextMode==="neon"?"Neon live":"Source-aware"}</span>
        <button className="ai-refresh" onClick={()=>void load(true)} disabled={loading}><RefreshCw size={15} className={loading?"spin":""}/> Perbarui</button>
      </div>
    </div>

    <div className="ai-overview-body">
      {loading&&!answer?<div className="ai-analysis-loading"><span/><span/><span/><span/></div>:null}
      {error?<div className="insight-error">{error} <button onClick={()=>void load(true)}>Coba lagi</button></div>:null}
      {answer?<div className="ai-analysis-text">{answer}</div>:null}
    </div>

    <div className="ai-overview-foot">
      <span><ShieldCheck size={13}/> AI membaca data NADI yang tersedia; verifikasi manusia tetap wajib.{updatedAt?" · diperbarui "+new Date(updatedAt).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}):""}</span>
      <button className="ai-chat-link" onClick={openChat}><MessageCircleMore size={15}/> Tanya lebih lanjut</button>
    </div>
  </section>;
}
