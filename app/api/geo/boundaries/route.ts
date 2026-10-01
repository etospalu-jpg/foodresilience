import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BIG_LAYER = "https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_KABKOTA_AR/MapServer/0";

export async function GET() {
  const params = new URLSearchParams({
    where: "KDPBPS='72'",
    outFields: "NAMOBJ,WADMKK,WADMPR,KDBBPS,KDPBPS,KDPKAB,LUASWH",
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
  });

  try {
    const response = await fetch(`${BIG_LAYER}/query?${params.toString()}`, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "NADI-Pangan/1.0" },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "BIG boundary service unavailable", status: response.status }, { status: 502 });
    }

    const geojson = await response.json();
    const features = Array.isArray(geojson?.features) ? geojson.features : [];
    const filtered = features.filter((feature: { properties?: Record<string, unknown> }) => {
      const p = feature.properties ?? {};
      const province = String(p.WADMPR ?? p.wadmpr ?? "").toUpperCase();
      return province.includes("SULAWESI TENGAH") || String(p.KDPBPS ?? p.kdpbps ?? "") === "72";
    });

    return NextResponse.json({
      type: "FeatureCollection",
      features: filtered,
      nadiSource: {
        code: "BIG-ADMIN-2026",
        name: "Badan Informasi Geospasial — Batas Administrasi Kabupaten/Kota",
        layer: BIG_LAYER,
        retrievedAt: new Date().toISOString(),
      },
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to retrieve BIG boundary data" }, { status: 502 });
  }
}
