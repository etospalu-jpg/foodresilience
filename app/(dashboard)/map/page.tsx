import { RegionMap } from "@/components/region-map";
export const metadata = { title: "Intelligence Map" };
export default function MapPage(){ return <div className="page-stack"><section className="page-heading"><div><span className="eyebrow">SPATIAL DECISION VIEW</span><h1>Intelligence Map</h1><p>Switch layers to explore risk, intervention coverage, and evaluation readiness across the pilot regions.</p></div></section><RegionMap /></div>; }
