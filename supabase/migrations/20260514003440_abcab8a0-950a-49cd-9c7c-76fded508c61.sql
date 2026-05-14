CREATE TABLE IF NOT EXISTS public.vercel_deploy_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  deployment_uid TEXT NOT NULL,
  state TEXT NOT NULL,
  notified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, deployment_uid)
);

ALTER TABLE public.vercel_deploy_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read deploy alerts"
ON public.vercel_deploy_alerts
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_vercel_deploy_alerts_project ON public.vercel_deploy_alerts(project_id);