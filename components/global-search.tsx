"use client";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect,useRef,useState } from "react";

type Result={type:string;title:string;subtitle:string;href:string};

export function GlobalSearch(){
  const [open,setOpen]=useState(false),[q,setQ]=useState(""),[results,setResults]=useState<Result[]>([]);
  const input=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setOpen(true);}};
    window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);
  },[]);
  useEffect(()=>{if(open)setTimeout(()=>input.current?.focus(),50)},[open]);
  useEffect(()=>{
    if(q.trim().length<2){setResults([]);return;}
    const controller=new AbortController();
    const timer=setTimeout(()=>fetch("/api/search?q="+encodeURIComponent(q),{signal:controller.signal}).then(r=>r.json()).then(d=>setResults(d.results??[])).catch(()=>{}),180);
    return()=>{clearTimeout(timer);controller.abort();}
  },[q]);
  return <>
    <button className="search-command" onClick={()=>setOpen(true)}><Search size={17}/><span>Search regions, interventions...</span><kbd>⌘ K</kbd></button>
    {open&&<div className="search-overlay" onClick={()=>setOpen(false)}>
      <div className="search-dialog" onClick={e=>e.stopPropagation()}>
        <div className="search-input-row"><Search size={18}/><input ref={input} value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari wilayah, ID, atau intervensi..."/><button onClick={()=>setOpen(false)}><X size={17}/></button></div>
        <div className="search-results">
          {q.length<2&&<div className="search-hint">Ketik minimal 2 karakter. Data diambil dari Neon.</div>}
          {q.length>=2&&!results.length&&<div className="search-hint">Tidak ada hasil yang cocok.</div>}
          {results.map((r,i)=><Link href={r.href} key={r.href+i} onClick={()=>setOpen(false)}><span className="search-result-type">{r.type}</span><div><b>{r.title}</b><small>{r.subtitle}</small></div></Link>)}
        </div>
      </div>
    </div>}
  </>;
}
