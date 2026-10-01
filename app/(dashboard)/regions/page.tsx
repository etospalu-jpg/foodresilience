import { RegionBrowser } from "@/components/region-browser";
import { getRegions } from "@/lib/nadi-data";

export const metadata = { title: "Wilayah" };

export default async function RegionsPage(){
  const regions=await getRegions();
  return <div className="page-stack">
    <section className="page-heading">
      <div><span className="eyebrow">REGION PROFILES · VERIFIED 2026</span><h1>Wilayah</h1><p>Seluruh 13 kabupaten/kota memakai IKP 2026 resmi Badan Pangan Nasional. Record intervensi pilot ditampilkan terpisah dan tetap berlabel simulasi.</p></div>
    </section>
    <RegionBrowser regions={regions}/>
  </div>;
}
