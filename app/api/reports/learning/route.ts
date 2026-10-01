import { getLearning } from "@/lib/nadi-data";
import { toCsv } from "@/lib/csv";
export const runtime="nodejs";
export async function GET(){
 const rows=await getLearning();
 const csv=toCsv(["Judul","Tag","Wilayah","Intervention ID","What happened","What worked","What did not work","Replication note","Simulation"],rows.map(i=>[i.title,i.tag,i.region,i.interventionId,i.whatHappened,i.whatWorked,i.whatDidNotWork,i.replicationNote,i.simulation?"Ya":"Tidak"]));
 return new Response(csv,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":'attachment; filename="nadi-learning-digest.csv"'}});
}
