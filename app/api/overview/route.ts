import { NextResponse } from "next/server";
import { alerts, interventions, regions } from "@/lib/data";
import { getSql, hasDatabaseUrl } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const configured = hasDatabaseUrl();
  const sql = getSql();

  if (!sql) {
    return NextResponse.json({
      source: "seed",
      databaseConfigured: configured,
      regions,
      interventions,
      alerts,
    });
  }

  try {
    const dbRegions = await sql`
      select slug, name, region_type as type, ikp_2024 as ikp,
             pou_2024 as pou, risk_status as risk, last_updated
      from nadi.regions
      order by name
    `;

    return NextResponse.json({
      source: "neon",
      databaseConfigured: true,
      regions: dbRegions,
      interventions,
      alerts,
    });
  } catch {
    return NextResponse.json({
      source: "seed-fallback",
      databaseConfigured: true,
      regions,
      interventions,
      alerts,
    });
  }
}
