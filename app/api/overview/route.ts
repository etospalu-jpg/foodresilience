import { NextResponse } from "next/server";
import { alerts, interventions, regions } from "@/lib/data";
import { getSql } from "@/lib/db";

export async function GET() {
  const sql = getSql();
  if (!sql) return NextResponse.json({ source: "seed", regions, interventions, alerts });
  try {
    const dbRegions = await sql`select slug, name, region_type as type, ikp_2024 as ikp, pou_2024 as pou, risk_status as risk, last_updated from nadi.regions order by name`;
    return NextResponse.json({ source: "neon", regions: dbRegions, interventions, alerts });
  } catch {
    return NextResponse.json({ source: "seed-fallback", regions, interventions, alerts });
  }
}
