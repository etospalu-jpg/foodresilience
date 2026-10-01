import { getRegions } from "@/lib/nadi-data";
import { toCsv } from "@/lib/csv";
export const runtime="nodejs";
export async function GET(){
 const rows=await getRegions();
 const csv=toCsv(["Wilayah","IKP 2026","IKP 2025","Delta","Ketersediaan 2026","Keterjangkauan 2026","Pemanfaatan 2026","Prioritas","Kelas","Peringkat","Pilot MEL","Source"],rows.map(r=>[r.name,r.ikp2026,r.ikp2025,r.ikpDelta,r.availability2026,r.access2026,r.utilization2026,r.priority2026,r.class2026,r.rank2026,r.pilot?"Ya":"Tidak",r.sourceCode]));
 return new Response(csv,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":'attachment; filename="nadi-wilayah-ikp-2026.csv"'}});
}
