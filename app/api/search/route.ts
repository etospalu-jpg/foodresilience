import { NextRequest, NextResponse } from "next/server";
import { getRegions, getInterventions } from "@/lib/nadi-data";

export const runtime="nodejs";

export async function GET(request:NextRequest){
  const q=(request.nextUrl.searchParams.get("q")||"").trim().toLowerCase();
  if(q.length<2) return NextResponse.json({results:[]});
  const [regions,interventions]=await Promise.all([getRegions(),getInterventions()]);
  const results=[
    ...regions.filter(r=>r.name.toLowerCase().includes(q)).slice(0,6).map(r=>({type:"region",title:r.name,subtitle:"IKP 2026 "+(r.ikp2026?.toFixed(2)??"—")+" · "+r.class2026,href:"/regions/"+r.slug})),
    ...interventions.filter(i=>(i.title+" "+i.id+" "+i.region).toLowerCase().includes(q)).slice(0,6).map(i=>({type:"intervention",title:i.title,subtitle:i.id+" · "+i.region+" · "+(i.simulation?"Simulation":"Verified"),href:"/interventions#"+i.id}))
  ].slice(0,10);
  return NextResponse.json({results});
}
