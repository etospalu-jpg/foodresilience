import { RegionMap } from "@/components/region-map";
import { getRegions } from "@/lib/nadi-data";

export const metadata = { title: "Intelligence Map" };

export default async function MapPage(){
  const regions=await getRegions();
  return <div className="page-stack">
    <section className="page-heading">
      <div>
        <span className="eyebrow">SPATIAL DECISION VIEW</span>
        <h1>Intelligence Map</h1>
        <p>Peta administratif nyata berbasis BIG dengan indikator IKP 2026 terverifikasi dari Badan Pangan Nasional. Intervensi pilot tetap ditandai terpisah sebagai data simulasi.</p>
      </div>
    </section>
    <RegionMap regions={regions}/>
  </div>;
}
