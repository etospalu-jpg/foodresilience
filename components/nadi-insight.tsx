"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Database, LoaderCircle, Send, ShieldCheck, Sparkles, X } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string };
type Source = { id: string; label: string; kind: string };

const quickPrompts = [
  "Ringkas kondisi dashboard saat ini",
  "Wilayah mana yang punya evaluasi tertunda?",
  "Jelaskan coverage gap yang terdeteksi",
  "Bandingkan IKP dan PoU wilayah pilot",
];

export function NadiInsight() {
  const [open,setOpen]=useState(false);
  const [question,setQuestion]=useState("");
  const [messages,setMessages]=useState<Message[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [sources,setSources]=useState<Source[]>([]);
  const [contextMode,setContextMode]=useState<"neon" | "seed" | "">("");
  const endRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{ if(open) setTimeout(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),60); },[open,messages,loading]);

  async function ask(text: string) {
    const value=text.trim();
    if(!value || loading) return;
    setOpen(true);
    setError("");
    const previous=messages.slice(-6);
    setMessages(current=>[...current,{role:"user",text:value}]);
    setQuestion("");
    setLoading(true);
    try{
      const response=await fetch("/api/insight",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({question:value,history:previous}),
      });
      const data=await response.json();
      if(!response.ok) throw new Error(data.error || "NADI Insight gagal memproses pertanyaan.");
      setMessages(current=>[...current,{role:"assistant",text:data.answer}]);
      setSources(Array.isArray(data.sources)?data.sources:[]);
      setContextMode(data.contextMode || "");
    }catch(err){
      setError(err instanceof Error?err.message:"NADI Insight sedang tidak tersedia.");
    }finally{
      setLoading(false);
    }
  }

  function submit(event:FormEvent){ event.preventDefault(); void ask(question); }

  return <>
    <button className="insight-trigger" onClick={()=>setOpen(true)} aria-label="Buka NADI Insight">
      <Sparkles size={16}/><span>Ask NADI</span><i>AI</i>
    </button>
    <button className="insight-trigger-mobile" onClick={()=>setOpen(true)} aria-label="Buka NADI Insight">
      <Sparkles size={17}/><span>AI</span>
    </button>

    {open&&<div className="insight-backdrop" onClick={()=>setOpen(false)}>
      <aside className="insight-drawer" onClick={e=>e.stopPropagation()} aria-label="NADI Insight">
        <header className="insight-head">
          <div className="insight-mark"><Sparkles size={18}/></div>
          <div className="insight-title"><b>NADI Insight</b><span>Gemini-powered MEL analyst</span></div>
          <button className="insight-close" onClick={()=>setOpen(false)} aria-label="Tutup NADI Insight"><X size={19}/></button>
        </header>

        <div className="insight-trust">
          <span><ShieldCheck size={13}/> Read-only</span>
          <span><Database size={13}/> {contextMode==="neon"?"Neon context":contextMode==="seed"?"Demo context":"Source-aware"}</span>
          <span>Human decision</span>
        </div>

        <div className="insight-body">
          {messages.length===0&&<div className="insight-welcome">
            <div className="insight-orb"><Sparkles size={24}/></div>
            <h2>Apa yang ingin Anda pahami?</h2>
            <p>Saya membaca wilayah, intervensi, alert, dan learning NADI. Data simulasi akan selalu dibedakan dari data resmi.</p>
            <div className="insight-prompts">{quickPrompts.map(prompt=><button key={prompt} onClick={()=>void ask(prompt)}>{prompt}</button>)}</div>
          </div>}

          <div className="insight-messages">
            {messages.map((message,index)=><article className={`insight-message ${message.role}`} key={`${message.role}-${index}`}>
              {message.role==="assistant"&&<div className="message-avatar"><Sparkles size={14}/></div>}
              <div className="message-bubble">{message.text}</div>
            </article>)}
            {loading&&<article className="insight-message assistant"><div className="message-avatar"><Sparkles size={14}/></div><div className="message-bubble loading"><LoaderCircle className="spin" size={16}/> Membaca data NADI...</div></article>}
            {error&&<div className="insight-error">{error}</div>}
            <div ref={endRef}/>
          </div>

          {sources.length>0&&messages.some(m=>m.role==="assistant")&&<details className="insight-sources">
            <summary>Sumber konteks jawaban</summary>
            <div>{sources.map(source=><p key={source.id}><b>[{source.id}]</b> {source.label}</p>)}</div>
          </details>}
        </div>

        <form className="insight-composer" onSubmit={submit}>
          <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Tanya tentang wilayah, intervensi, outcome..." rows={1} maxLength={1200} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(question.trim())void ask(question);}}}/>
          <button type="submit" disabled={!question.trim()||loading} aria-label="Kirim pertanyaan"><Send size={17}/></button>
          <small>NADI Insight dapat keliru. Verifikasi sumber sebelum keputusan.</small>
        </form>
      </aside>
    </div>}
  </>;
}
