# NADI Pangan

Food Resilience Monitoring, Evaluation & Learning platform for Sulawesi Tengah pilot exploration.

## Product position
NADI Pangan is a MEL layer, not a replacement for FSVA, SKPG, food-price systems, or other official government platforms. The MVP connects vulnerability context → intervention records → beneficiary coverage → follow-up → outcome → learning.

## Data policy
- Public pilot indicators are based on the project research baseline.
- Intervention records included in the repository are **simulation data** and are visibly labelled in the UI.
- No NIK, household identifiers, or individual health data are stored in the MVP.

## Run locally
```bash
npm install
npm run dev
```

Optional Neon connection:
```bash
cp .env.example .env.local
# set DATABASE_URL
npm run dev
```

Without `DATABASE_URL`, the app runs with a safe seed-data fallback.
## Pilot data architecture

NADI Pangan separates verified public indicators from simulation MEL records. The current pilot reads verified IKP 2026 indicators from Neon, uses official BIG administrative boundaries for the spatial view, keeps Gemini/NADI Insight read-only, and labels pilot intervention/monitoring/learning records as simulation until a human verification workflow is added.

Boundary lookup uses the official BIG kabupaten/kota service and resolves Sulawesi Tengah by the published province-name field, with code fallback; if the official service returns no geometry, the app shows an explicit unavailable state instead of drawing synthetic boundaries.
