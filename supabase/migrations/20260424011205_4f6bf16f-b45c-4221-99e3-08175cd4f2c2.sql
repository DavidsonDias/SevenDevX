-- 1. Enum de níveis de destaque
DO $$ BEGIN
  CREATE TYPE public.featured_level AS ENUM ('none', 'secondary', 'primary');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Coluna featured_level
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS featured_level public.featured_level NOT NULL DEFAULT 'none';

-- 3. Migrar dados atuais: PsicoOne = primary, demais featured = secondary
UPDATE public.projects
SET featured_level = CASE
  WHEN slug = 'psicoone' THEN 'primary'::public.featured_level
  WHEN is_featured = true THEN 'secondary'::public.featured_level
  ELSE 'none'::public.featured_level
END;

-- 4. Trigger: garante apenas 1 primary
CREATE OR REPLACE FUNCTION public.enforce_single_primary_featured()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.featured_level = 'primary' THEN
    UPDATE public.projects
    SET featured_level = 'secondary'
    WHERE featured_level = 'primary'
      AND id IS DISTINCT FROM NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_single_primary_featured_trg ON public.projects;
CREATE TRIGGER enforce_single_primary_featured_trg
BEFORE INSERT OR UPDATE OF featured_level ON public.projects
FOR EACH ROW
WHEN (NEW.featured_level = 'primary')
EXECUTE FUNCTION public.enforce_single_primary_featured();

-- 5. Index para ordenação
CREATE INDEX IF NOT EXISTS idx_projects_featured_order
  ON public.projects (featured_level DESC, display_order ASC, created_at DESC);

-- 6. Seed dos 6 projetos antigos faltantes (id 1..6 do arquivo estático)
INSERT INTO public.projects (
  slug, title, description, long_description, cover_image,
  technologies, tags, live_url, github_url,
  status, is_published_on_site, is_featured, featured_level, display_order
) VALUES
(
  'erp-empresarial',
  'Sistema ERP Empresarial',
  'ERP completo com estoque, financeiro, vendas e relatórios avançados em tempo real.',
  'Sistema completo de gestão empresarial com módulos integrados de estoque, vendas, financeiro e RH. Dashboard com mais de 50 relatórios personalizados e análise de dados em tempo real.',
  'local:project-erp.jpg',
  '[{"name":"React","color":"#61DAFB"},{"name":"Node.js","color":"#339933"},{"name":"PostgreSQL","color":"#4169E1"},{"name":"TypeScript","color":"#3178C6"}]'::jsonb,
  ARRAY['Enterprise','SaaS']::text[],
  'https://sevendevx.com/projects/erp',
  'https://github.com/DavidsonDias/sevendevx-erp',
  'published', true, false, 'none', 100
),
(
  'fashion-plus',
  'E-Commerce Fashion Plus',
  'Loja virtual com checkout integrado, painel administrativo e performance otimizada.',
  'Plataforma completa de e-commerce com catálogo dinâmico, checkout seguro, painel administrativo, integração com gateways de pagamento e métricas de vendas em tempo real.',
  'local:project-ecommerce.jpg',
  '[{"name":"Next.js","color":"#000000"},{"name":"TypeScript","color":"#3178C6"},{"name":"Tailwind","color":"#06B6D4"}]'::jsonb,
  ARRAY[]::text[],
  'https://sevendevx.com/projects/fashionplus',
  'https://github.com/DavidsonDias/fashion-plus',
  'published', true, false, 'none', 101
),
(
  'analytics-pro',
  'Dashboard Analytics PRO',
  'Dashboard com dados dinâmicos e gráficos avançados utilizando D3.js.',
  'Painel de business intelligence com visualização de dados em tempo real, gráficos interativos D3.js, KPIs customizáveis e exportação de relatórios em múltiplos formatos.',
  'local:project-analytics.jpg',
  '[{"name":"React","color":"#61DAFB"},{"name":"TypeScript","color":"#3178C6"},{"name":"D3.js","color":"#F9A03C"}]'::jsonb,
  ARRAY[]::text[],
  'https://sevendevx.com/projects/analytics',
  'https://github.com/DavidsonDias/analytics-pro',
  'published', true, false, 'none', 102
),
(
  'delivery-express',
  'Landing Page Delivery Express',
  'Landing de alta conversão com CTA animado e integração WhatsApp.',
  NULL,
  'local:project-delivery.jpg',
  '[{"name":"React","color":"#61DAFB"},{"name":"Tailwind","color":"#06B6D4"}]'::jsonb,
  ARRAY[]::text[],
  'https://sevendevx.com/projects/delivery',
  'https://github.com/DavidsonDias/delivery-express',
  'published', true, false, 'none', 103
),
(
  'agendamento-medico',
  'Sistema de Agendamento Médico',
  'Consultórios e clínicas com agendamento online, prontuário digital e automações.',
  'Plataforma completa para clínicas médicas com agendamento online, prontuário eletrônico, integração WhatsApp para lembretes automáticos e relatórios de atendimento.',
  'local:project-medical.jpg',
  '[{"name":"Next.js","color":"#000000"},{"name":"Firebase","color":"#FFCA28"}]'::jsonb,
  ARRAY[]::text[],
  NULL, NULL,
  'published', true, false, 'none', 104
),
(
  'arquitetura-premium',
  'Portfólio Arquitetura Premium',
  'Website institucional premium, lightbox, animações suaves e SEO avançado.',
  NULL,
  'local:project-architecture.jpg',
  '[{"name":"React","color":"#61DAFB"},{"name":"Tailwind","color":"#06B6D4"}]'::jsonb,
  ARRAY[]::text[],
  NULL, NULL,
  'published', true, false, 'none', 105
)
ON CONFLICT (slug) DO NOTHING;

-- 7. Habilitar realtime para sync automático no site/admin
ALTER TABLE public.projects REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;