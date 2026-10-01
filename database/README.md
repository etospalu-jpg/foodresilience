# Neon database

Project: `cool-bird-28857700`
Branch: `production` (`br-twilight-firefly-b5wiwhve`)
Schema: `nadi`

The MVP database has been provisioned with the following domain tables:

- `nadi.data_sources`
- `nadi.regions`
- `nadi.indicators`
- `nadi.indicator_measurements`
- `nadi.interventions`
- `nadi.beneficiary_summaries`
- `nadi.monitoring_cycles`
- `nadi.evaluations`
- `nadi.learning_notes`
- `nadi.alerts`
- `nadi.audit_logs`

Seed state:
- 5 pilot regions
- 4 simulation intervention records
- 4 rule-engine alert records

The application reads from Neon when `DATABASE_URL` is present. Without it, the UI intentionally falls back to the repository seed dataset so competition demo builds remain safe and deterministic.

Never commit a real Neon connection string.
