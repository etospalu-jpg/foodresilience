import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getInterventions } from "@/lib/nadi-data";

export const runtime = "nodejs";

const WINDOW_MS=60*60*1000;
const MAX_WRITES=8;
const writes=new Map<string,{count:number;resetAt:number}>();

function clientKey(request:NextRequest){
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
}
function blocked(key:string){
  const now=Date.now();
  const state=writes.get(key);
  if(!state||state.resetAt<=now){writes.set(key,{count:1,resetAt:now+WINDOW_MS});return false;}
  state.count+=1;writes.set(key,state);return state.count>MAX_WRITES;
}
function text(value:unknown,max=240){
  return typeof value==="string" ? value.trim().slice(0,max) : "";
}
function integer(value:unknown){
  const n=Number(value);
  return Number.isFinite(n)&&n>=0 ? Math.round(n) : 0;
}

export async function GET(){
  return NextResponse.json({interventions:await getInterventions()});
}

export async function POST(request:NextRequest){
  if(blocked(clientKey(request))) return NextResponse.json({error:"Batas penambahan record demo tercapai. Coba lagi nanti."},{status:429});
  const sql=getSql();
  if(!sql) return NextResponse.json({error:"Database belum tersedia."},{status:503});

  let body:Record<string,unknown>;
  try{body=await request.json();}catch{return NextResponse.json({error:"Payload tidak valid."},{status:400});}

  const title=text(body.title,160);
  const type=text(body.type,100);
  const regionSlug=text(body.regionSlug,100);
  const location=text(body.location,140);
  const agency=text(body.agency,120)||"Dinas Pangan";
  const objective=text(body.objective,600);
  const startedAt=text(body.startedAt,20);
  const evaluationDue=text(body.evaluationDue,20);
  const beneficiariesTarget=integer(body.beneficiariesTarget);
  const beneficiariesActual=integer(body.beneficiariesActual);

  if(!title||!type||!regionSlug) return NextResponse.json({error:"Judul, jenis intervensi, dan wilayah wajib diisi."},{status:400});

  const regions=await sql`select id,name from nadi.regions where slug=${regionSlug} and region_type<>'Provinsi' limit 1`;
  if(!regions.length) return NextResponse.json({error:"Wilayah tidak ditemukan."},{status:400});
  const region=regions[0] as Record<string,unknown>;
  const id="SIM-"+Date.now().toString(36).toUpperCase();

  const inserted=await sql`
    insert into nadi.interventions(
      id,title,intervention_type,region_id,location_label,agency,status,objective,
      beneficiaries_target,beneficiaries_actual,started_at,evaluation_due,source_code,verification_status,is_simulation
    ) values(
      ${id},${title},${type},${String(region.id)},${location||null},${agency},'active',${objective||null},
      ${beneficiariesTarget},${beneficiariesActual},${startedAt||null},${evaluationDue||null},'DEMO-INTERVENTION','simulation',true
    )
    returning id,title,region_id,status,is_simulation,created_at
  `;
  const saved=inserted[0] as Record<string,unknown>;
  await sql`
    insert into nadi.audit_logs(actor,action,entity_type,entity_id,after_data)
    values('pilot-web','create','intervention',${id},${JSON.stringify(saved)}::jsonb)
  `;

  return NextResponse.json({ok:true,id,simulation:true,region:String(region.name)},{status:201});
}
