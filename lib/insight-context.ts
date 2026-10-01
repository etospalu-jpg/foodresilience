import "server-only";
import { alerts, interventions, learningCards, regions } from "./data";
import { getSql } from "./db";

export type InsightContext = {
  mode: "neon" | "seed";
  generatedAt: string;
  sources: Array<{ id: string; label: string; kind: "official" | "simulation" | "rule" | "learning" }>;
  regions: unknown[];
  interventions: unknown[];
  alerts: unknown[];
  learning: unknown[];
};

export async function buildInsightContext(): Promise<InsightContext> {
  const sources: InsightContext["sources"] = [
    { id: "S1", label: "RENSTRA Dinas Pangan Provinsi Sulawesi Tengah 2025–2029 — indikator wilayah pilot", kind: "official" },
    { id: "S2", label: "NADI Intervention Registry — data intervensi simulasi MVP", kind: "simulation" },
    { id: "S3", label: "NADI Alert Engine — sinyal berbasis rule engine", kind: "rule" },
    { id: "S4", label: "NADI Learning Repository — catatan pembelajaran simulasi MVP", kind: "learning" },
  ];

  const sql = getSql();
  if (!sql) {
    return {
      mode: "seed",
      generatedAt: new Date().toISOString(),
      sources,
      regions: regions.map(r => ({
        name: r.name,
        type: r.type,
        ikp_2024: r.ikp,
        pou_2024: r.pou,
        risk_status: r.risk,
        pending_evaluations: r.pendingEvaluations,
        coverage_gap: r.coverageGap,
        last_updated: r.lastUpdated,
        notes: r.notes,
        source: "S1",
      })),
      interventions: interventions.map(i => ({ ...i, source: "S2" })),
      alerts: alerts.map(a => ({ ...a, source: "S3" })),
      learning: learningCards.map(l => ({ ...l, source: "S4" })),
    };
  }

  try {
    const dbRegions = await sql`
      select id, name, region_type, ikp_2024, pou_2024, risk_status, last_updated, notes, source_code
      from nadi.regions
      order by name
      limit 30
    `;
    const dbInterventions = await sql`
      select id, title, intervention_type, region_id, location_label, agency, collaborators,
             status, objective, beneficiaries_target, beneficiaries_actual,
             started_at, ended_at, evaluation_due, verification_status, is_simulation
      from nadi.interventions
      order by started_at desc nulls last
      limit 40
    `;
    const dbAlerts = await sql`
      select id, alert_kind, severity, region_id, intervention_id, title, subtitle, status, created_at
      from nadi.alerts
      where status = 'open'
      order by created_at desc
      limit 30
    `;
    const dbLearning = await sql`
      select id, intervention_id, region_id, title, tag, what_happened, what_worked,
             what_did_not_work, replication_note, is_simulation, created_at
      from nadi.learning_notes
      order by created_at desc
      limit 30
    `;

    return {
      mode: "neon",
      generatedAt: new Date().toISOString(),
      sources,
      regions: dbRegions.map((r: Record<string, unknown>) => ({ ...r, source: "S1" })),
      interventions: dbInterventions.map((r: Record<string, unknown>) => ({ ...r, source: "S2" })),
      alerts: dbAlerts.map((r: Record<string, unknown>) => ({ ...r, source: "S3" })),
      learning: dbLearning.map((r: Record<string, unknown>) => ({ ...r, source: "S4" })),
    };
  } catch {
    return {
      mode: "seed",
      generatedAt: new Date().toISOString(),
      sources,
      regions: regions.map(r => ({
        name: r.name, type: r.type, ikp_2024: r.ikp, pou_2024: r.pou,
        risk_status: r.risk, pending_evaluations: r.pendingEvaluations,
        coverage_gap: r.coverageGap, last_updated: r.lastUpdated, notes: r.notes, source: "S1",
      })),
      interventions: interventions.map(i => ({ ...i, source: "S2" })),
      alerts: alerts.map(a => ({ ...a, source: "S3" })),
      learning: learningCards.map(l => ({ ...l, source: "S4" })),
    };
  }
}
