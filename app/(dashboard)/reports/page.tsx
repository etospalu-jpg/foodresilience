import { Download, FileBarChart, FileText, MapPinned } from "lucide-react";
import { AskNadiButton } from "@/components/ask-nadi-button";

export const metadata={title:"Reports"};

const reports=[
  {title:"Regional IKP 2026",desc:"13 kabupaten/kota dengan IKP, komponen, kelas, peringkat, dan status pilot.",type:"CSV",href:"/api/reports/regions",Icon:MapPinned},
  {title:"Intervention Registry",desc:"Registry intervensi pilot lengkap dengan verification dan simulation status.",type:"CSV",href:"/api/reports/interventions",Icon:FileBarChart},
  {title:"Learning Digest",desc:"Catatan learning dari Neon untuk review dan dokumentasi MEL.",type:"CSV",href:"/api/reports/learning",Icon:FileText},
];

export default function ReportsPage(){
 return <div className="page-stack">
  <section className="page-heading"><div><span className="eyebrow">REPORTING · WORKING EXPORTS</span><h1>Reports</h1><p>Export terstruktur memakai data Neon saat ini. File memisahkan indikator resmi dari record pilot berlabel simulation.</p></div><AskNadiButton prompt="Ringkas data yang tersedia untuk laporan MEL saat ini, termasuk indikator resmi, intervensi pilot, learning, dan keterbatasan sumber." label="AI report brief"/></section>
  <div className="report-grid">{reports.map(({title,desc,type,href,Icon})=><article className="report-card" key={title}><span><Icon size={20}/></span><div><h2>{title}</h2><p>{desc}</p><small>Live export · {type}</small></div><a href={href} className="icon-button" aria-label={"Download "+title}><Download size={18}/></a></article>)}</div>
  <section className="panel"><div className="data-note">Export ini adalah data operasional dashboard, bukan policy brief atau kesimpulan kebijakan otomatis. Review manusia tetap diperlukan sebelum publikasi.</div></section>
 </div>;
}
