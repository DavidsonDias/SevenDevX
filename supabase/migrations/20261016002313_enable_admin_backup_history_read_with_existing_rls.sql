-- Applied to production through Supabase migration API; existing admin RLS remains authoritative.
GRANT SELECT ON public.tenant_backups, public.restore_jobs TO authenticated;
