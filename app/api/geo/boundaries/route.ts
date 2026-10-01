import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BIG_LAYER = "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_KABKOTA_AR/MapServer/0";
const WHERE_CANDIDATES = [
  "WADMPR='Sulawesi Tengah'",
  "WADMPR='SULAWESI TENGAH'",
  "KDPBPS='72'",
];

async function queryBig(where:string){
  const params=new URLSearchParams({
    where,
    outFields:"NAMOBJ,WADMKK,WADMPR,KDBBPS,KDPBPS,KDPKAB,LUASWH",
    returnGeometry:"true",
    outSR:"4326",
    f:"geojson",
  });
  const response=await fetch(BIG_LAYER+"/query?"+params.toString(),{
    next:{revalidate:86400},
    headers:{"User-Agent":"NADI-Pangan/1.0"},
  });
  if(!response.ok) return null;
  const json=await response.json();
  const features=Array.isArray(json?.features)?json.features:[];
  return {json,features};
}

export async function GET() {
  try {
    for(const where of WHERE_CANDIDATES){
      const result=await queryBig(where);
      if(!result||!result.features.length) continue;
      const filtered=result.features.filter((feature:{properties?:Record<string,unknown>})=>{
        const p=feature.properties??{};
        const province=String(p.WADMPR??p.wadmpr??"").toUpperCase();
        const provinceCode=String(p.KDPBPS??p.kdpbps??"");
        return province.includes("SULAWESI TENGAH")||provinceCode==="72";
      });
      if(!filtered.length) continue;
      return NextResponse.json({
        type:"FeatureCollection",
        features:filtered,
        nadiSource:{
          code:"BIG-ADMIN-2026",
          name:"Badan Informasi Geospasial — Batas Administrasi Kabupaten/Kota",
          layer:BIG_LAYER,
          query:where,
          featureCount:filtered.length,
          retrievedAt:new Date().toISOString(),
        },
      },{headers:{"Cache-Control":"public, s-maxage=86400, stale-while-revalidate=604800"}});
    }
    return NextResponse.json({error:"BIG returned no Sulawesi Tengah boundaries",featureCount:0},{status:502});
  } catch {
    return NextResponse.json({error:"Unable to retrieve BIG boundary data"},{status:502});
  }
}
