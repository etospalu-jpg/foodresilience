export type RiskStatus = "critical" | "high" | "moderate" | "stable";
export type InterventionStatus = "active" | "awaiting_evaluation" | "evaluated" | "planned";

export interface Region {
  id: string;
  slug: string;
  name: string;
  type: "Kabupaten" | "Kota";
  ikp: number;
  pou: number;
  risk: RiskStatus;
  interventions: number;
  pendingEvaluations: number;
  coverageGap: boolean;
  lastUpdated: string;
  x: number;
  y: number;
  notes: string;
}

export interface Intervention {
  id: string;
  title: string;
  type: string;
  region: string;
  location: string;
  agency: string;
  collaborators: string[];
  status: InterventionStatus;
  beneficiariesTarget: number;
  beneficiariesActual: number;
  startedAt: string;
  endedAt?: string;
  evaluationDue?: string;
  simulation: boolean;
  objective: string;
}

export interface AlertItem {
  id: string;
  kind: "coverage" | "evaluation" | "persistent" | "overlap" | "freshness";
  severity: "critical" | "warning" | "info";
  title: string;
  subtitle: string;
  region: string;
  age: string;
}
