import "server-only";
import { getAlerts, getInterventions, getLearning, getProvinceSnapshot, getRegions, getSources } from "./nadi-data";

export type InsightContext = {
  mode: "neon" | "seed";
  generatedAt: string;
  sources: Array<{ id: string; label: string; kind: "official" | "simulation" | "rule" | "learning" | "spatial" }>;
  province: unknown;
  regions: unknown[];
  interventions: unknown[];
  alerts: unknown[];
  learning: unknown[];
};

export async function buildInsightContext(): Promise<InsightContext> {
  try {
    const [regions,province,interventions,alerts,learning,dbSources]=await Promise.all([
      getRegions(),getProvinceSnapshot(),getInterventions(),getAlerts(),getLearning(),getSources()
    ]);

    const sourceIndex = new Map(dbSources.map(s=>[s.code,s]));
    const official=(code:string,fallback:string)=>{
      const s=sourceIndex.get(code);
      return s ? `${s.name} · periode ${s.period ?? "-"}` : fallback;
    };

    return {
      mode:"neon",
      generatedAt:new Date().toISOString(),
      sources:[
        {id:"S1",label:official("BAPANAS-IKP-2026","Open Data Bapanas — IKP 2024–2026"),kind:"official"},
        {id:"S2",label:official("BPS-POU-2025","BPS — Prevalence of Undernourishment 2025"),kind:"official"},
        {id:"S3",label:"NADI Intervention Registry — record pilot berlabel simulasi kecuali dinyatakan terverifikasi",kind:"simulation"},
        {id:"S4",label:"NADI rule engine — alert MEL transparan, bukan keputusan kebijakan",kind:"rule"},
        {id:"S5",label:"NADI Learning Repository — catatan pembelajaran pilot",kind:"learning"},
        {id:"S6",label:official("BIG-ADMIN-2026","BIG — batas administrasi kabupaten/kota"),kind:"spatial"},
      ],
      province:{...province,source:"S1/S2"},
      regions:regions.map(r=>({...r,source:"S1"})),
      interventions:interventions.map(i=>({...i,source:"S3"})),
      alerts:alerts.map(a=>({...a,source:"S4"})),
      learning:learning.map(l=>({...l,source:"S5"})),
    };
  } catch {
    return {
      mode:"seed",
      generatedAt:new Date().toISOString(),
      sources:[
        {id:"S1",label:"Fallback context — database tidak dapat dibaca",kind:"simulation"},
      ],
      province:{},
      regions:[],
      interventions:[],
      alerts:[],
      learning:[],
    };
  }
}
