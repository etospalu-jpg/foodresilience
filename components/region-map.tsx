"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import { ExternalLink, Layers3, MapPinned, RefreshCw } from "lucide-react";
import type { RegionSnapshot } from "@/lib/nadi-data";
import { AskNadiButton } from "./ask-nadi-button";
import { StatusBadge } from "./status-badge";

type LayerKey = "class" | "ikp" | "availability" | "access" | "utilization" | "pilot";

const layerOptions: Array<{key:LayerKey;label:string}> = [
  {key:"class",label:"Kelas IKP 2026"},
  {key:"ikp",label:"IKP 2026"},
  {key:"availability",label:"Ketersediaan"},
  {key:"access",label:"Keterjangkauan"},
  {key:"utilization",label:"Pemanfaatan"},
  {key:"pilot",label:"Pilot MEL"},
];

function normalizeName(value:string) {
  return value.toUpperCase().replace(/KABUPATEN|KOTA/g,"").replace(/[^A-Z0-9]/g,"");
}

function toneForPriority(priority:number|null) {
  if(priority===1||priority===2) return "critical" as const;
  if(priority===3) return "warning" as const;
  if(priority===4) return "info" as const;
  return "positive" as const;
}

function valueFor(region:RegionSnapshot,layer:LayerKey) {
  if(layer==="class") return region.priority2026;
  if(layer==="ikp") return region.ikp2026;
  if(layer==="availability") return region.availability2026;
  if(layer==="access") return region.access2026;
  if(layer==="utilization") return region.utilization2026;
  return region.pilot ? 1 : 0;
}

function metricLabel(layer:LayerKey) {
  if(layer==="class") return "Prioritas komposit";
  if(layer==="ikp") return "IKP 2026";
  if(layer==="availability") return "Indeks ketersediaan";
  if(layer==="access") return "Indeks keterjangkauan";
  if(layer==="utilization") return "Indeks pemanfaatan";
  return "Status pilot MEL";
}

function fillExpression(layer:LayerKey): maplibregl.ExpressionSpecification {
  if(layer==="class"){
    return ["match",["get","priority"],
      1,"#8E3A36",2,"#A74742",3,"#B77929",4,"#6E8799",5,"#4E8068",6,"#2F6F55","#D9E1DD"
    ];
  }
  if(layer==="pilot"){
    return ["case",["==",["get","pilot"],true],"#275F4D","#DDE4E0"];
  }
  return ["interpolate",["linear"],["coalesce",["get","metricValue"],0],
    25,"#A74742",55,"#B77929",70,"#6E8799",80,"#39775B",95,"#1D5144"
  ];
}

function withMetric(geojson:any,regions:RegionSnapshot[],layer:LayerKey){
  const index=new Map(regions.map(r=>[normalizeName(r.name),r]));
  return {
    ...geojson,
    features:(geojson.features??[]).map((feature:any)=>{
      const raw=String(feature.properties?.WADMKK ?? feature.properties?.NAMOBJ ?? "");
      const region=index.get(normalizeName(raw));
      return {
        ...feature,
        properties:{
          ...feature.properties,
          slug:region?.slug ?? "",
          displayName:region?.name ?? raw,
          metricValue:region ? valueFor(region,layer) : null,
          priority:region?.priority2026 ?? null,
          classLabel:region?.class2026 ?? "Belum tersedia",
          pilot:region?.pilot ?? false,
          ikp:region?.ikp2026 ?? null,
        }
      };
    })
  };
}

export function RegionMap({ regions, compact=false }: { regions: RegionSnapshot[]; compact?: boolean }) {
  const containerRef=useRef<HTMLDivElement>(null);
  const mapRef=useRef<MapLibreMap|null>(null);
  const rawGeoRef=useRef<any>(null);
  const [layer,setLayer]=useState<LayerKey>("class");
  const [selectedSlug,setSelectedSlug]=useState(regions.find(r=>r.pilot)?.slug ?? regions[0]?.slug ?? "");
  const [boundaryStatus,setBoundaryStatus]=useState<"loading"|"live"|"error">("loading");
  const [sourceTimestamp,setSourceTimestamp]=useState<string|null>(null);

  const selected=useMemo(()=>regions.find(r=>r.slug===selectedSlug) ?? regions[0],[regions,selectedSlug]);

  useEffect(()=>{
    if(!containerRef.current || mapRef.current) return;
    const map=new maplibregl.Map({
      container:containerRef.current,
      center:[121.35,-1.25],
      zoom:5.35,
      minZoom:4.6,
      maxZoom:11,
      attributionControl:false,
      style:{
        version:8,
        sources:{
          osm:{
            type:"raster",
            tiles:["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize:256,
            attribution:"© OpenStreetMap contributors",
          }
        },
        layers:[{id:"osm",type:"raster",source:"osm",paint:{"raster-opacity":0.72}}],
      }
    });
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),"top-right");
    map.addControl(new maplibregl.AttributionControl({compact:true}),"bottom-right");
    mapRef.current=map;

    map.on("load",async()=>{
      try{
        const response=await fetch("/api/geo/boundaries");
        if(!response.ok) throw new Error("boundary unavailable");
        const geojson=await response.json();
        rawGeoRef.current=geojson;
        setSourceTimestamp(geojson?.nadiSource?.retrievedAt ?? null);
        const joined=withMetric(geojson,regions,layer);
        map.addSource("sulteng-boundaries",{type:"geojson",data:joined});
        map.addLayer({
          id:"sulteng-fill",type:"fill",source:"sulteng-boundaries",
          paint:{"fill-color":fillExpression(layer),"fill-opacity":0.72}
        });
        map.addLayer({
          id:"sulteng-line",type:"line",source:"sulteng-boundaries",
          paint:{"line-color":"#24483d","line-width":1.15,"line-opacity":0.85}
        });
        map.addLayer({
          id:"sulteng-hover",type:"line",source:"sulteng-boundaries",
          filter:["==",["get","slug"],""],
          paint:{"line-color":"#ffffff","line-width":3}
        });

        map.on("mousemove","sulteng-fill",e=>{
          map.getCanvas().style.cursor="pointer";
          const slug=String(e.features?.[0]?.properties?.slug ?? "");
          map.setFilter("sulteng-hover",["==",["get","slug"],slug]);
        });
        map.on("mouseleave","sulteng-fill",()=>{
          map.getCanvas().style.cursor="";
          map.setFilter("sulteng-hover",["==",["get","slug"],""]);
        });
        map.on("click","sulteng-fill",e=>{
          const props=e.features?.[0]?.properties as any;
          const slug=String(props?.slug ?? "");
          if(slug) setSelectedSlug(slug);
          const coordinates=e.lngLat;
          const metric=props?.metricValue;
          const text=layer==="pilot" ? (props?.pilot ? "Pilot MEL" : "Cakupan resmi") : metric!==null&&metric!==undefined ? Number(metric).toFixed(layer==="class"?0:2) : "N/A";
          new maplibregl.Popup({closeButton:false,offset:8})
            .setLngLat(coordinates)
            .setHTML("<div class='nadi-map-popup'><b>"+String(props?.displayName ?? "Wilayah")+"</b><span>"+metricLabel(layer)+": "+text+"</span></div>")
            .addTo(map);
        });
        map.fitBounds([[119.0,-3.9],[124.1,1.55]],{padding:compact?20:34,duration:0});
        setBoundaryStatus("live");
      }catch{
        setBoundaryStatus("error");
      }
    });

    return()=>{ map.remove(); mapRef.current=null; };
  },[]);

  useEffect(()=>{
    const map=mapRef.current;
    const geo=rawGeoRef.current;
    if(!map || !geo || !map.getSource("sulteng-boundaries")) return;
    const joined=withMetric(geo,regions,layer);
    (map.getSource("sulteng-boundaries") as GeoJSONSource).setData(joined);
    map.setPaintProperty("sulteng-fill","fill-color",fillExpression(layer));
  },[layer,regions]);

  const metric=selected ? valueFor(selected,layer) : null;

  return <section className={"map-panel verified-map "+(compact?"map-compact":"")}>
    <div className="panel-head map-head">
      <div><div className="eyebrow">VERIFIED SPATIAL VIEW</div><h2>Peta Ketahanan Pangan Sulawesi Tengah</h2></div>
      <div className="map-source-state">
        <span className={boundaryStatus==="live"?"ready-dot good":boundaryStatus==="error"?"ready-dot warn":"ready-dot"}/>
        <span>{boundaryStatus==="live"?"BIG boundary live":boundaryStatus==="error"?"BIG unavailable":"Memuat BIG..."}</span>
      </div>
    </div>

    <div className="map-toolbar">
      <div className="pill-scroll">{layerOptions.map(item=><button key={item.key} onClick={()=>setLayer(item.key)} className={"filter-pill "+(layer===item.key?"active":"")}>{item.label}</button>)}</div>
      <span className="map-verified-chip"><Layers3 size={14}/> Bapanas IKP 2026</span>
    </div>

    <div ref={containerRef} className="real-map-stage" aria-label="Peta administratif Sulawesi Tengah berbasis BIG"/>
    {boundaryStatus==="error"&&<div className="map-error"><RefreshCw size={15}/><span>Boundary service BIG tidak dapat dimuat. Data tabular tetap tersedia dan tidak diganti dengan geometri buatan.</span></div>}

    {selected&&<div className="map-detail verified-detail">
      <div>
        <div className="map-region-title">{selected.name}</div>
        <div className="map-region-meta">{selected.type} · data indikator 2026 · {selected.pilot?"pilot MEL":"cakupan indikator resmi"}</div>
      </div>
      <div className="map-mini-metrics">
        <div><span>{metricLabel(layer)}</span><b>{layer==="pilot" ? (selected.pilot?"Ya":"Tidak") : metric===null ? "—" : Number(metric).toFixed(layer==="class"?0:2)}</b></div>
        <div><span>Kelas resmi</span><b>{selected.class2026}</b></div>
      </div>
      <StatusBadge tone={toneForPriority(selected.priority2026)}>{selected.class2026}</StatusBadge>
      <div className="map-actions">
        <AskNadiButton prompt={"Jelaskan profil data terbaru untuk "+selected.name+": IKP 2026, komponen IKP, status pilot, intervensi, alert, dan keterbatasan data. Bedakan data resmi dan simulasi."} label="Jelaskan dengan AI"/>
        <Link className="text-link" href={"/regions/"+selected.slug}>Detail <ExternalLink size={14}/></Link>
      </div>
    </div>}

    <div className="map-provenance">
      <MapPinned size={14}/>
      <span>Batas wilayah: Badan Informasi Geospasial. Indikator: Open Data Badan Pangan Nasional, IKP 12 indikator 2026. {sourceTimestamp?"Boundary fetched "+new Date(sourceTimestamp).toLocaleDateString("id-ID")+".":""}</span>
    </div>
    {layer!=="class"&&layer!=="pilot"&&<div className="data-note">Warna pada layer komponen adalah skala visual untuk eksplorasi, bukan kategori kebijakan. Klasifikasi resmi tetap ditampilkan sebagai kelas IKP.</div>}
  </section>;
}
