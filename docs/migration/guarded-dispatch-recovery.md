# Guarded dispatch and scheduler recovery
The four previously empty trigger functions now prepare calls to the current backend. Delivery remains disabled until each channel is deliberately configured and accepted.
## Gates (public.system_settings boolean JSON)
- migration_dispatch_lead_enabled: push for new leads.
- migration_dispatch_contact_enabled: push for contact messages.
- migration_dispatch_incident_enabled: configured incident channels.
- migration_dispatch_automation_enabled: active automation definitions.
Missing or false means disabled. Do not enable all gates to certify migration.
## Authentication
Use the production legacy service_role credential only in server-side Vault under `sevendevx_scheduler_service_role_key`. Do not put its value in chat or source. Do not use a publishable key.
The helper is in migration_admin, uses fixed target allowlists, bounded payloads and fixed search_path, and denies direct execution to public API roles.
## Managed queue boundary
pg_net stores outbound Authorization headers temporarily. Its managed queue tables belong to supabase_admin, with PUBLIC privileges. postgres could not change those privileges; a REVOKE attempt did not take effect and is NOT a security fix. The net schema is currently not exposed through the Data API (anonymous request returned 406), but SQL roles with access can read pending requests. Review with Supabase support or use an approved service-to-service dispatcher before provisioning the scheduler credential/activating deliveries. Do not expose net or Vault through the Data API.
## Scheduler
Three operational schedules exist but are inactive: health every five minutes, webhook retry every minute, digest at 11:00 UTC (08:00 BRT). No historical replay was performed. Review pending retries and actual recipients before activation. Keep AI/retention jobs excluded from this acceptance phase.
## Validation
The SQL fixture test runs only on the isolated recovery database, inside a rolled-back transaction, with no scheduler credential. Disabled/enabled gates with a missing credential, trigger row preservation, fixed target allowlist and helper ACL were tested. Zero HTTP requests were enqueued. Production tested disabled gates with temporary fixtures and rollback.
No external delivery has been certified by these tests. Backups, previous deployments and source environment are preserved.
## Environment handling
The migration version is copied from the actual production migration history, not a newly invented timestamp. The helper URL explicitly targets production. When restoring into an isolated backend, replace that URL with the isolated project BEFORE applying; keep gates disabled and do not copy production credentials.
