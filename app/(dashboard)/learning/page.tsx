import { BookOpenCheck, Search } from "lucide-react";
import { learningCards } from "@/lib/data";
import { StatusBadge } from "@/components/status-badge";
export const metadata = { title: "Learning" };
export default function LearningPage(){ return <div className="page-stack"><section className="page-heading"><div><span className="eyebrow">INSTITUTIONAL LEARNING</span><h1>Learning</h1><p>Capture what worked, what did not, and what should inform the next intervention cycle.</p></div><label className="inline-search"><Search size={17}/><input placeholder="Search learning..."/></label></section><div className="learning-grid">{learningCards.map((card,i) => <article className="learning-card" key={card.title}><div className="learning-icon"><BookOpenCheck size={20}/></div><StatusBadge tone="neutral">{card.tag}</StatusBadge><h2>{card.title}</h2><p>{card.body}</p><div className="learning-foot"><span>{card.region}</span><span>Simulation note {i+1}</span></div></article>)}</div></div>; }
