import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db";
import { getAlerts,getInterventions,getProvinceSnapshot,getRegions } from "@/lib/nadi-data";

export const runtime="nodejs";

export async function GET(){
  try{
    const [regions,interventions,alerts,province]=await Promise.all([getRegions(),getInterventions(),getAlerts(),getProvinceSnapshot()]);
    return NextResponse.json({source:hasDatabaseUrl()?"neon":"seed",databaseConfigured:hasDatabaseUrl(),province,regions,interventions,alerts});
  }catch{
    return NextResponse.json({source:"error",databaseConfigured:hasDatabaseUrl(),error:"NADI data layer unavailable"},{status:500});
  }
}
