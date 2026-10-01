import { InterventionBrowser } from "@/components/intervention-browser";
import { getInterventions,getRegions } from "@/lib/nadi-data";

export const metadata={title:"Intervensi"};

export default async function InterventionsPage({searchParams}:{searchParams:Promise<{new?:string}>}){
  const [items,regions,params]=await Promise.all([getInterventions(),getRegions(),searchParams]);
  return <div className="page-stack">
    <section className="page-heading"><div><span className="eyebrow">INTERVENTION REGISTRY · NEON LIVE</span><h1>Intervensi</h1><p>Setiap record ditautkan ke wilayah, penerima, status monitoring, dan evidence. Record yang dibuat dari pilot web selalu berlabel simulation sampai diverifikasi.</p></div></section>
    <section className="panel"><InterventionBrowser items={items} regions={regions} autoOpen={params.new==="1"}/></section>
  </div>;
}
