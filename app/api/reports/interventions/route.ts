import { getInterventions } from "@/lib/nadi-data";
import { toCsv } from "@/lib/csv";
export const runtime="nodejs";
export async function GET(){
 const rows=await getInterventions();
 const csv=toCsv(["ID","Intervensi","Jenis","Wilayah","Lokasi","Instansi","Status","Target","Realisasi","Mulai","Evaluasi due","Verification","Simulation"],rows.map(i=>[i.id,i.title,i.type,i.region,i.location,i.agency,i.status,i.beneficiariesTarget,i.beneficiariesActual,i.startedAt,i.evaluationDue,i.verificationStatus,i.simulation?"Ya":"Tidak"]));
 return new Response(csv,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":'attachment; filename="nadi-intervention-registry.csv"'}});
}
