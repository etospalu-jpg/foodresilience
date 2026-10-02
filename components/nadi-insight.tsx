"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Database, LoaderCircle, MessageCircleMore, Send, ShieldCheck, Sparkles, X } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string };
type Source = { id: string; label: string; kind: string };

const quickPrompts = [
  "Ringkas kondisi ketahanan pangan terbaru yang tersedia di NADI",
  "Bandingkan IKP 2026 seluruh kabupaten/kota Sulawesi Tengah",
  "Jelaskan alert MEL yang masih terbuka",
  "Apa perbedaan data resmi dan data simulasi di dashboard ini?",
];

export function NadiInsight() {
  const [open,setOpen]=useState(false);
  const [question,setQuestion]=useState("");
  const [messages,setMessages]=useState<Message[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [sources,setSources]=useState<Source[]>([]);
  const [contextMode,setContextMode]=useState<"neon" | "seed" | "">("");
  const [health,setHealth]=useState<{configured:boolean;model:string}|null>(null);
  const endRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    fetch("/api/insight").then(r=>r.json()).then(data=>setHealth(data)).catch(()=>setHealth(null));
  },[]);

  useEffect(()=>{
    const handler=(event:Event)=>{
      const detail=(event as CustomEvent<{prompt?:string}>).detail;
      const prompt=detail?.prompt?.trim();
      setOpen(true);
      if(prompt) setTimeout(()=>void ask(prompt),0);
    };
    window.addEventListener("nadi:ask",handler as EventListener);
    return()=>window.removeEventListener("nadi:ask",handler as EventListener);
  });

  useEffect(()=>{ if(open) setTimeout(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),60); },[open,messages,loading]);

  async function ask(text:string){
    const value=text.trim();
    if(!value||loading) return;
    setOpen(true); setError("");
    const previous=messages.slice(-6);
    setMessages(current=>[...current,{role:"user",text:value}]);
    setQuestion(""); setLoading(true);
    try{
      const response=await fetch("/api/insight",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({question:value,history:previous}),
      });
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"NADI AI gagal memproses pertanyaan.");
      setMessages(current=>[...current,{role:"assistant",text:data.answer}]);
      setSources(Array.isArray(data.sources)?data.sources:[]);
      setContextMode(data.contextMode||"");
    }catch(err){
      setError(err instanceof Error?err.message:"NADI AI sedang tidak tersedia.");
    }finally{setLoading(false);}
  }

  function submit(event:FormEvent){event.preventDefault();void ask(question);}

  return <>
    {!open&&<button className="nadi-ai-fab" onClick={()=>setOpen(true)} aria-label="Buka chatbot NADI AI">
      <span className="nadi-ai-fab-icon"><Sparkles size={18}/></span>
      <span className="nadi-ai-fab-copy"><b>NADI AI</b><small>Tanya semua data</small></span>
      <MessageCircleMore size={17}/>
    </button>}

    {open&&<div className="insight-backdrop" onClick={()=>setOpen(false)}>
      <aside className="insight-drawer" onClick={e=>e.stopPropagation()} aria-label="Chatbot NADI AI">
        <header className="insight-head">
          <div className="insight-mark"><Sparkles size={18}/></div>
          <div className="insight-title"><b>NADI AI</b><span>Chatbot analisis MEL · Gemini + Neon</span></div>
          <button className="insight-close" onClick={()=>setOpen(false)} aria-label="Tutup chatbot"><X size={19}/></button>
        </header>

        <div className="insight-trust">
          <span><ShieldCheck size={13}/> Read-only</span>
          <span><Database size={13}/> {contextMode==="neon"?"Neon live context":contextMode==="seed"?"Fallback context":"Neon connected"}</span>
          <span><Bot size={13}/> {health?.configured ? health.model : "Gemini status"}</span>
          <span>Human decision</span>
        </div>

        <div className="insight-body">
          {messages.length===0&&<div className="insight-welcome">
            <div className="insight-orb"><Sparkles size={24}/></div>
            <h2>Tanya seluruh data NADI</h2>
            <p>Satu chatbot untuk membaca indikator resmi, wilayah, intervensi, alert MEL, monitoring, evaluasi, learning, dan sumber data. Data resmi dan simulasi selalu dibedakan.</p>
            <div className="insight-ready"><span className={health?.configured?"ready-dot good":"ready-dot warn"}/><b>{health?.configured?"Gemini siap digunakan":"Memeriksa koneksi Gemini"}</b></div>
            <div className="insight-prompts">{quickPrompts.map(prompt=><button key={prompt} onClick={()=>void ask(prompt)}>{prompt}</button>)}</div>
          </div>}

          <div className="insight-messages">
            {messages.map((message,index)=><article className={`insight-message ${message.role}`} key={`${message.role}-${index}`}>
              {message.role==="assistant"&&<div className="message-avatar"><Sparkles size={14}/></div>}
              <div className="message-bubble">{message.text}</div>
            </article>)}
            {loading&&<article className="insight-message assistant"><div className="message-avatar"><Sparkles size={14}/></div><div className="message-bubble loading"><LoaderCircle className="spin" size={16}/> Membaca Neon dan sumber NADI...</div></article>}
            {error&&<div className="insight-error">{error}</div>}
            <div ref={endRef}/>
          </div>

          {sources.length>0&&messages.some(m=>m.role==="assistant")&&<details className="insight-sources">
            <summary>Sumber konteks jawaban</summary>
            <div>{sources.map(source=><p key={source.id}><b>[{source.id}]</b> {source.label}</p>)}</div>
          </details>}
        </div>

        <form className="insight-composer" onSubmit={submit}>
          <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Tanya IKP, wilayah, intervensi, evaluasi, learning, atau sumber data..." rows={1} maxLength={1200} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(question.trim())void ask(question);}}}/>
          <button type="submit" disabled={!question.trim()||loading} aria-label="Kirim pertanyaan"><Send size={17}/></button>
          <small>AI membantu membaca data. Keputusan dan verifikasi tetap oleh manusia.</small>
        </form>
      </aside>
    </div>}
  </>;
}
