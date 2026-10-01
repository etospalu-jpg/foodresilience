"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Activity, Bell, BookOpenCheck, ChevronDown, ClipboardCheck, FileBarChart, Home, Map, Menu, Plus, Search, Settings, ShieldCheck, X, MapPinned } from "lucide-react";
import { Brand, LogoMark } from "./logo";
import { NadiInsight } from "./nadi-insight";

const nav=[
{href:"/overview",label:"Overview",icon:Home},
{href:"/map",label:"Intelligence Map",icon:Map},
{href:"/regions",label:"Wilayah",icon:MapPinned},
{href:"/interventions",label:"Intervensi",icon:Activity},
{href:"/monitoring",label:"Monitoring",icon:ClipboardCheck},
{href:"/learning",label:"Learning",icon:BookOpenCheck},
{href:"/alerts",label:"Alerts",icon:Bell},
{href:"/reports",label:"Reports",icon:FileBarChart},
];

export function AppShell({children}:{children:React.ReactNode}){
 const pathname=usePathname();
 const [collapsed,setCollapsed]=useState(false);
 const [mobileMore,setMobileMore]=useState(false);
 const [role,setRole]=useState("Executive");
 const current=useMemo(()=>nav.find(item=>pathname.startsWith(item.href)),[pathname]);

 useEffect(()=>setMobileMore(false),[pathname]);

 useEffect(()=>{
   const root=document.documentElement;
   const syncVisualViewport=()=>{
     const viewport=window.visualViewport;
     const visualHeight=viewport?.height ?? window.innerHeight;
     const visualTop=viewport?.offsetTop ?? 0;
     const bottomGap=Math.max(0, window.innerHeight-visualHeight-visualTop);

     root.style.setProperty("--visual-height",`${Math.round(visualHeight)}px`);
     root.style.setProperty("--visual-top",`${Math.max(0,Math.round(visualTop))}px`);
     root.style.setProperty("--visual-bottom",`${Math.max(0,Math.round(bottomGap))}px`);
   };

   syncVisualViewport();
   window.addEventListener("resize",syncVisualViewport,{passive:true});
   window.addEventListener("orientationchange",syncVisualViewport,{passive:true});
   window.visualViewport?.addEventListener("resize",syncVisualViewport,{passive:true});
   window.visualViewport?.addEventListener("scroll",syncVisualViewport,{passive:true});

   return ()=>{
     window.removeEventListener("resize",syncVisualViewport);
     window.removeEventListener("orientationchange",syncVisualViewport);
     window.visualViewport?.removeEventListener("resize",syncVisualViewport);
     window.visualViewport?.removeEventListener("scroll",syncVisualViewport);
   };
 },[]);

 return <div className={`app-shell ${collapsed?"sidebar-collapsed":""}`}>
   <aside className="sidebar"><div className="sidebar-brand">{collapsed?<LogoMark/>:<Brand/>}</div><button className="collapse-button" onClick={()=>setCollapsed(v=>!v)}><Menu size={17}/></button>
   <nav className="side-nav">{nav.map(item=>{const active=pathname.startsWith(item.href);return <Link key={item.href} href={item.href} className={`nav-item ${active?"active":""}`}><item.icon size={19}/><span>{item.label}</span>{item.label==="Alerts"&&<i>4</i>}</Link>})}</nav>
   <div className="sidebar-footer"><Link className={`nav-item ${pathname.startsWith("/settings")?"active":""}`} href="/settings"><Settings size={19}/><span>Settings</span></Link>{!collapsed&&<div className="demo-badge"><ShieldCheck size={15}/><div><b>Demo environment</b><span>Simulation data is clearly marked</span></div></div>}</div></aside>
   <div className="workspace"><header className="topbar"><div className="mobile-brand"><LogoMark size={32}/><div><b>NADI Pangan</b><span>{current?.label??"Workspace"}</span></div></div><button className="search-command"><Search size={17}/><span>Search regions, interventions...</span><kbd>⌘ K</kbd></button><div className="topbar-actions"><NadiInsight/><button className="top-icon"><Bell size={18}/><span/></button><div className="role-switcher"><span className="avatar">EP</span><div><b>Demo User</b><small>{role}</small></div><ChevronDown size={15}/><select value={role} onChange={e=>setRole(e.target.value)}><option>Executive</option><option>Evaluator</option><option>Operator</option><option>Admin</option></select></div></div></header><main className="content">{children}</main></div>
   <nav className="mobile-nav" aria-label="Navigasi utama"><Link href="/overview" className={pathname.startsWith("/overview")?"active":""}><Home size={21}/><span>Home</span></Link><Link href="/regions" className={pathname.startsWith("/regions")?"active":""}><MapPinned size={21}/><span>Wilayah</span></Link><button className="mobile-add" onClick={()=>setMobileMore(true)} aria-label="Buka aksi cepat"><Plus size={22}/></button><Link href="/interventions" className={pathname.startsWith("/interventions")?"active":""}><Activity size={21}/><span>Intervensi</span></Link><button className={mobileMore?"active":""} onClick={()=>setMobileMore(true)} aria-label="Buka menu lainnya"><Menu size={21}/><span>More</span></button></nav>
   {mobileMore&&<div className="mobile-sheet-backdrop" onClick={()=>setMobileMore(false)}><div className="mobile-sheet" onClick={e=>e.stopPropagation()}><div className="sheet-handle"/><div className="sheet-head"><div><span className="eyebrow">WORKSPACE</span><h3>Quick navigation</h3></div><button onClick={()=>setMobileMore(false)} aria-label="Tutup menu"><X size={20}/></button></div><div className="sheet-grid">{nav.slice(3).map(item=><Link key={item.href} href={item.href}><item.icon size={20}/><span>{item.label}</span></Link>)}<Link href="/settings"><Settings size={20}/><span>Settings</span></Link></div></div></div>}
 </div>;
}
