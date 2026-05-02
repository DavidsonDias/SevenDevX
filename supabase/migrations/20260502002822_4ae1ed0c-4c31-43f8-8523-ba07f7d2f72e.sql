-- Enable trigram first
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm ON public.clients USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients (lower(email));
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients (status);
CREATE INDEX IF NOT EXISTS idx_projects_title_trgm ON public.projects USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_pipeline_stage ON public.projects (pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects (status);
CREATE INDEX IF NOT EXISTS idx_contacts_name_trgm ON public.contacts USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts (lower(email));
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_title_trgm ON public.blog_posts USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage_log_project ON public.pipeline_stage_log (project_id, created_at DESC);

-- Global search function (admin-only via internal check)
CREATE OR REPLACE FUNCTION public.search_global(_q text, _limit int DEFAULT 8)
RETURNS TABLE (
  entity text,
  id uuid,
  title text,
  subtitle text,
  url text,
  rank real
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH q AS (SELECT lower(coalesce(_q, '')) AS term)
  (SELECT 'client'::text, c.id, c.name AS title,
         coalesce(c.company, c.email, '') AS subtitle,
         '/admin/clients?id=' || c.id::text AS url,
         similarity(c.name, (SELECT term FROM q)) AS rank
  FROM public.clients c, q
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
    AND (c.name ILIKE '%' || q.term || '%' OR coalesce(c.email,'') ILIKE '%' || q.term || '%' OR coalesce(c.company,'') ILIKE '%' || q.term || '%')
  ORDER BY rank DESC NULLS LAST
  LIMIT _limit)
  UNION ALL
  (SELECT 'project'::text, p.id, p.title,
         coalesce(p.subtitle, p.client_name, '') AS subtitle,
         '/admin/projects/' || p.id::text AS url,
         similarity(p.title, (SELECT term FROM q)) AS rank
  FROM public.projects p, q
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
    AND (p.title ILIKE '%' || q.term || '%' OR coalesce(p.slug,'') ILIKE '%' || q.term || '%' OR coalesce(p.client_name,'') ILIKE '%' || q.term || '%')
  ORDER BY rank DESC NULLS LAST
  LIMIT _limit)
  UNION ALL
  (SELECT 'contact'::text, ct.id, ct.name,
         coalesce(ct.email, '') AS subtitle,
         '/admin?contact=' || ct.id::text AS url,
         similarity(ct.name, (SELECT term FROM q)) AS rank
  FROM public.contacts ct, q
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
    AND (ct.name ILIKE '%' || q.term || '%' OR coalesce(ct.email,'') ILIKE '%' || q.term || '%')
  ORDER BY rank DESC NULLS LAST
  LIMIT _limit)
  UNION ALL
  (SELECT 'service'::text, s.id, s.title,
         coalesce(s.subtitle, '') AS subtitle,
         '/admin/services' AS url,
         similarity(s.title, (SELECT term FROM q)) AS rank
  FROM public.services_cms s, q
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
    AND s.title ILIKE '%' || q.term || '%'
  ORDER BY rank DESC NULLS LAST
  LIMIT _limit)
  UNION ALL
  (SELECT 'post'::text, b.id, b.title,
         coalesce(b.excerpt, '') AS subtitle,
         '/blog/' || b.slug AS url,
         similarity(b.title, (SELECT term FROM q)) AS rank
  FROM public.blog_posts b, q
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
    AND b.title ILIKE '%' || q.term || '%'
  ORDER BY rank DESC NULLS LAST
  LIMIT _limit)
$$;

REVOKE ALL ON FUNCTION public.search_global(text, int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.search_global(text, int) FROM anon;
GRANT EXECUTE ON FUNCTION public.search_global(text, int) TO authenticated;