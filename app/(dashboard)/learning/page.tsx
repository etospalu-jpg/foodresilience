import { LearningBrowser } from "@/components/learning-browser";
import { getLearning } from "@/lib/nadi-data";

export const metadata={title:"Learning"};

export default async function LearningPage(){
  const items=await getLearning();
  return <div className="page-stack">
    <section className="page-heading"><div><span className="eyebrow">INSTITUTIONAL LEARNING · NEON LIVE</span><h1>Learning</h1><p>Catatan tentang apa yang terjadi, apa yang bekerja, apa yang belum bekerja, dan apa yang perlu diverifikasi pada siklus berikutnya.</p></div></section>
    <LearningBrowser items={items}/>
  </div>;
}
