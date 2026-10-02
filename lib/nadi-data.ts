import "server-only";
import { getSql } from "./db";
import { alerts as seedAlerts, interventions as seedInterventions, learningCards, regions as seedRegions } from "./data";

export type RegionSnapshot = {
  id: string;
  slug: string;
  name: string;
  type: string;
  ikp2026: number | null;
  ikp2025: number | null;
  ikpDelta: number | null;
  pou2025: number | null;
  availability2026: number | null;
  access2026: number | null;
  utilization2026: number | null;
  priority2026: number | null;
  rank2026: number | null;
  class2026: string;
  interventionCount: number;
  pendingEvaluations: number;
  coverageGap: boolean;
  lastUpdated: string | null;
  notes: string | null;
  pilot: boolean;
  sourceCode: string | null;
};

export type InterventionRecord = {
  id: string;
  title: string;
  type: string;
  regionId: string;
  region: string;
  regionSlug: string;
  location: string | null;
  agency: string;
  collaborators: string[];
  status: string;
  objective: string | null;
  beneficiariesTarget: number;
  beneficiariesActual: number;
  startedAt: string | null;
  endedAt: string | null;
  evaluationDue: string | null;
  verificationStatus: string;
  simulation: boolean;
};

export type AlertRecord = {
  id: string;
  kind: string;
  severity: string;
  title: string;
  subtitle: string | null;
  status: string;
  regionId: string | null;
  region: string | null;
  interventionId: string | null;
  createdAt: string | null;
};

export type LearningRecord = {
  id: string;
  title: string;
  tag: string | null;
  region: string | null;
  regionSlug: string | null;
  interventionId: string | null;
  whatHappened: string | null;
  whatWorked: string | null;
  whatDidNotWork: string | null;
  replicationNote: string | null;
  simulation: boolean;
  createdAt: string | null;
};

export type SourceRecord = {
  code: string;
  name: string;
  reference: string | null;
  period: string | null;
  verified: boolean;
  sourceType: string;
};

export type ProvinceSnapshot = {
  ikp2026: number | null;
  ikp2025: number | null;
  pou2025: number | null;
  availability2026: number | null;
  access2026: number | null;
  utilization2026: number | null;
  rank2026: number | null;
  priority2026: number | null;
  class2026: string;
};

const priorityLabels: Record<number, string> = {
  1: "Sangat Rentan",
  2: "Rentan",
  3: "Agak Rentan",
  4: "Agak Tahan",
  5: "Tahan",
  6: "Sangat Tahan",
};

export function ikpClass(priority: number | null | undefined) {
  if (!priority) return "Belum tersedia";
  return priorityLabels[priority] ?? "Belum tersedia";
}

function n(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function iso(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export async function getRegions(): Promise<RegionSnapshot[]> {
  const sql = getSql();
  if (!sql) {
    return seedRegions.map(r => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      type: r.type,
      ikp2026: null,
      ikp2025: null,
      ikpDelta: null,
      pou2025: null,
      availability2026: null,
      access2026: null,
      utilization2026: null,
      priority2026: null,
      rank2026: null,
      class2026: "Fallback seed",
      interventionCount: r.interventions,
      pendingEvaluations: r.pendingEvaluations,
      coverageGap: r.coverageGap,
      lastUpdated: r.lastUpdated,
      notes: r.notes,
      pilot: true,
      sourceCode: "SEED",
    }));
  }

  const rows = await sql`
    select
      r.id, r.slug, r.name, r.region_type, r.last_updated, r.notes, r.source_code,
      (select im.value from nadi.indicator_measurements im where im.region_id=r.id and im.indicator_code='IKP' and im.period='2026' limit 1) ikp_2026,
      (select im.value from nadi.indicator_measurements im where im.region_id=r.id and im.indicator_code='IKP' and im.period='2025' limit 1) ikp_2025,
      (select im.value from nadi.indicator_measurements im where im.region_id=r.id and im.indicator_code='POU' and im.period='2025' limit 1) pou_2025,
      (select im.value from nadi.indicator_measurements im where im.region_id=r.id and im.indicator_code='IKP_AVAIL' and im.period='2026' limit 1) availability_2026,
      (select im.value from nadi.indicator_measurements im where im.region_id=r.id and im.indicator_code='IKP_ACCESS' and im.period='2026' limit 1) access_2026,
      (select im.value from nadi.indicator_measurements im where im.region_id=r.id and im.indicator_code='IKP_UTIL' and im.period='2026' limit 1) utilization_2026,
      (select im.value from nadi.indicator_measurements im where im.region_id=r.id and im.indicator_code='IKP_PRIORITY' and im.period='2026' limit 1) priority_2026,
      (select im.value from nadi.indicator_measurements im where im.region_id=r.id and im.indicator_code='IKP_RANK' and im.period='2026' limit 1) rank_2026,
      (select count(*)::int from nadi.interventions i where i.region_id=r.id) intervention_count,
      (select count(*)::int from nadi.interventions i where i.region_id=r.id and i.status='awaiting_evaluation') pending_evaluations,
      exists(select 1 from nadi.alerts a where a.region_id=r.id and a.alert_kind='coverage' and a.status='open') coverage_gap
    from nadi.regions r
    where r.region_type <> 'Provinsi'
    order by r.name
  `;

  return rows.map((r: Record<string, unknown>) => {
    const current=n(r.ikp_2026);
    const previous=n(r.ikp_2025);
    const priority=n(r.priority_2026);
    return {
      id:String(r.id), slug:String(r.slug), name:String(r.name), type:String(r.region_type),
      ikp2026:current, ikp2025:previous,
      ikpDelta:current !== null && previous !== null ? Number((current-previous).toFixed(2)) : null,
      pou2025:n(r.pou_2025),
      availability2026:n(r.availability_2026), access2026:n(r.access_2026), utilization2026:n(r.utilization_2026),
      priority2026:priority, rank2026:n(r.rank_2026), class2026:ikpClass(priority),
      interventionCount:Number(r.intervention_count ?? 0), pendingEvaluations:Number(r.pending_evaluations ?? 0),
      coverageGap:Boolean(r.coverage_gap), lastUpdated:iso(r.last_updated), notes:r.notes ? String(r.notes) : null,
      pilot:Number(r.intervention_count ?? 0)>0, sourceCode:r.source_code ? String(r.source_code) : null,
    };
  });
}

export async function getProvinceSnapshot(): Promise<ProvinceSnapshot> {
  const sql=getSql();
  if(!sql) return {ikp2026:null,ikp2025:null,pou2025:null,availability2026:null,access2026:null,utilization2026:null,rank2026:null,priority2026:null,class2026:"Belum tersedia"};
  const rows=await sql`
    select
      (select value from nadi.indicator_measurements where region_id='r-sulteng' and indicator_code='IKP' and period='2026' limit 1) ikp_2026,
      (select value from nadi.indicator_measurements where region_id='r-sulteng' and indicator_code='IKP' and period='2025' limit 1) ikp_2025,
      (select value from nadi.indicator_measurements where region_id='r-sulteng' and indicator_code='POU' and period='2025' limit 1) pou_2025,
      (select value from nadi.indicator_measurements where region_id='r-sulteng' and indicator_code='IKP_AVAIL' and period='2026' limit 1) availability_2026,
      (select value from nadi.indicator_measurements where region_id='r-sulteng' and indicator_code='IKP_ACCESS' and period='2026' limit 1) access_2026,
      (select value from nadi.indicator_measurements where region_id='r-sulteng' and indicator_code='IKP_UTIL' and period='2026' limit 1) utilization_2026,
      (select value from nadi.indicator_measurements where region_id='r-sulteng' and indicator_code='IKP_RANK' and period='2026' limit 1) rank_2026,
      (select value from nadi.indicator_measurements where region_id='r-sulteng' and indicator_code='IKP_PRIORITY' and period='2026' limit 1) priority_2026
  `;
  const r=rows[0] as Record<string,unknown>;
  const priority=n(r.priority_2026);
  return {ikp2026:n(r.ikp_2026),ikp2025:n(r.ikp_2025),pou2025:n(r.pou_2025),availability2026:n(r.availability_2026),access2026:n(r.access_2026),utilization2026:n(r.utilization_2026),rank2026:n(r.rank_2026),priority2026:priority,class2026:ikpClass(priority)};
}

export async function getInterventions(): Promise<InterventionRecord[]> {
  const sql=getSql();
  if(!sql) return seedInterventions.map(i=>({id:i.id,title:i.title,type:i.type,regionId:"",region:i.region,regionSlug:"",location:i.location,agency:i.agency,collaborators:i.collaborators,status:i.status,objective:i.objective,beneficiariesTarget:i.beneficiariesTarget,beneficiariesActual:i.beneficiariesActual,startedAt:i.startedAt,endedAt:i.endedAt ?? null,evaluationDue:i.evaluationDue ?? null,verificationStatus:"simulation",simulation:i.simulation}));
  const rows=await sql`
    select i.*, r.name region_name, r.slug region_slug
    from nadi.interventions i join nadi.regions r on r.id=i.region_id
    order by i.started_at desc nulls last, i.id
  `;
  return rows.map((r:Record<string,unknown>)=>({
    id:String(r.id),title:String(r.title),type:String(r.intervention_type),regionId:String(r.region_id),region:String(r.region_name),regionSlug:String(r.region_slug),
    location:r.location_label?String(r.location_label):null,agency:String(r.agency),collaborators:Array.isArray(r.collaborators)?r.collaborators.map(String):[],
    status:String(r.status),objective:r.objective?String(r.objective):null,beneficiariesTarget:Number(r.beneficiaries_target??0),beneficiariesActual:Number(r.beneficiaries_actual??0),
    startedAt:iso(r.started_at),endedAt:iso(r.ended_at),evaluationDue:iso(r.evaluation_due),verificationStatus:String(r.verification_status),simulation:Boolean(r.is_simulation)
  }));
}

export async function getAlerts(): Promise<AlertRecord[]> {
  const sql=getSql();
  if(!sql) return seedAlerts.map(a=>({id:a.id,kind:a.kind,severity:a.severity,title:a.title,subtitle:a.subtitle,status:"open",regionId:null,region:a.region,interventionId:null,createdAt:null}));
  const rows=await sql`
    select a.id,a.alert_kind,a.severity,a.title,a.subtitle,a.status,a.region_id,a.intervention_id,a.created_at,r.name region_name
    from nadi.alerts a left join nadi.regions r on r.id=a.region_id
    where a.status='open'
    order by case a.severity when 'critical' then 1 when 'warning' then 2 else 3 end, a.created_at desc
  `;
  return rows.map((r:Record<string,unknown>)=>({id:String(r.id),kind:String(r.alert_kind),severity:String(r.severity),title:String(r.title),subtitle:r.subtitle?String(r.subtitle):null,status:String(r.status),regionId:r.region_id?String(r.region_id):null,region:r.region_name?String(r.region_name):null,interventionId:r.intervention_id?String(r.intervention_id):null,createdAt:iso(r.created_at)}));
}

export async function getLearning(): Promise<LearningRecord[]> {
  const sql=getSql();
  if(!sql) return learningCards.map((l,i)=>({id:String(i),title:l.title,tag:l.tag,region:l.region,regionSlug:null,interventionId:null,whatHappened:l.body,whatWorked:null,whatDidNotWork:null,replicationNote:null,simulation:true,createdAt:null}));
  const rows=await sql`
    select l.*, r.name region_name, r.slug region_slug
    from nadi.learning_notes l left join nadi.regions r on r.id=l.region_id
    order by l.created_at desc
  `;
  return rows.map((r:Record<string,unknown>)=>({id:String(r.id),title:String(r.title),tag:r.tag?String(r.tag):null,region:r.region_name?String(r.region_name):null,regionSlug:r.region_slug?String(r.region_slug):null,interventionId:r.intervention_id?String(r.intervention_id):null,whatHappened:r.what_happened?String(r.what_happened):null,whatWorked:r.what_worked?String(r.what_worked):null,whatDidNotWork:r.what_did_not_work?String(r.what_did_not_work):null,replicationNote:r.replication_note?String(r.replication_note):null,simulation:Boolean(r.is_simulation),createdAt:iso(r.created_at)}));
}

export async function getSources(): Promise<SourceRecord[]> {
  const sql=getSql();
  if(!sql) return [];
  const rows=await sql`select code,name,reference,period,verified,source_type from nadi.data_sources order by verified desc, source_type, code`;
  return rows.map((r:Record<string,unknown>)=>({code:String(r.code),name:String(r.name),reference:r.reference?String(r.reference):null,period:r.period?String(r.period):null,verified:Boolean(r.verified),sourceType:String(r.source_type)}));
}

export async function getRegionBySlug(slug:string) {
  const all=await getRegions();
  const region=all.find(r=>r.slug===slug) ?? null;
  if(!region) return null;
  const interventions=(await getInterventions()).filter(i=>i.regionSlug===slug);
  return {region,interventions};
}

export async function getMonitoringOverview() {
  const sql=getSql();
  if(!sql) return {cycles:[],evaluations:[]};
  const cycles=await sql`
    select m.*,i.title intervention_title,r.name region_name
    from nadi.monitoring_cycles m join nadi.interventions i on i.id=m.intervention_id join nadi.regions r on r.id=i.region_id
    order by case m.status when 'overdue' then 1 when 'due' then 2 when 'in_progress' then 3 else 4 end, m.due_at nulls last
  `;
  const evaluations=await sql`
    select e.*,i.title intervention_title,r.name region_name
    from nadi.evaluations e join nadi.interventions i on i.id=e.intervention_id join nadi.regions r on r.id=i.region_id
    order by e.evaluated_at desc nulls last
  `;
  return {cycles,evaluations};
}
