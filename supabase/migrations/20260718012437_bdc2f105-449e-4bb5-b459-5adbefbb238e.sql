
-- ============================================================
-- MÓDULO CRIAÇÃO DE SITES — SevenOS CMS
-- Controla dinamicamente a página /criacao-de-sites-profissionais
-- ============================================================

-- 1. CONFIG SINGLETON (settings gerais, SEO, GEO, local, diagnóstico)
CREATE TABLE IF NOT EXISTS public.site_page_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  page_slug text NOT NULL DEFAULT 'criacao-de-sites-profissionais',
  page_status text NOT NULL DEFAULT 'published', -- draft | published
  seo jsonb NOT NULL DEFAULT '{}'::jsonb, -- {title, description, keywords, canonical, og_image, robots}
  geo jsonb NOT NULL DEFAULT '{}'::jsonb, -- {summary, service_desc, area_served, neighborhoods, sources, last_updated}
  local jsonb NOT NULL DEFAULT '{}'::jsonb, -- {city, state, region, neighborhoods, phone, whatsapp, email, hours}
  diagnostico jsonb NOT NULL DEFAULT '{}'::jsonb, -- {enabled, mode, title, description, steps, consent_text, redirect_url}
  hero_config jsonb NOT NULL DEFAULT '{}'::jsonb, -- {badge_text, badge_year, projects_available, title_lines, description, cta_primary, cta_secondary, hero_project_id, show_project, show_metrics, animations}
  tech_config jsonb NOT NULL DEFAULT '{}'::jsonb, -- {speed, direction, show_icon, show_name, separator}
  cta_config jsonb NOT NULL DEFAULT '{}'::jsonb, -- {badge, title, description, button_text, button_url, action_type, background}
  comparison_config jsonb NOT NULL DEFAULT '{}'::jsonb, -- {title, subtitle, col_a_label, col_b_label}
  roi_config jsonb NOT NULL DEFAULT '{}'::jsonb, -- {badge, title, description, source_note, legal_note}
  faq_config jsonb NOT NULL DEFAULT '{}'::jsonb, -- {max_items, first_open, accordion_mode}
  last_published_at timestamptz,
  last_published_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_page_config TO anon, authenticated;
GRANT ALL ON public.site_page_config TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_page_config TO authenticated;
ALTER TABLE public.site_page_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read config" ON public.site_page_config FOR SELECT USING (true);
CREATE POLICY "admin write config" ON public.site_page_config FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_scp_updated BEFORE UPDATE ON public.site_page_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. MÉTRICAS DO HERO
CREATE TABLE IF NOT EXISTS public.site_page_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value numeric NOT NULL DEFAULT 0,
  prefix text DEFAULT '',
  suffix text DEFAULT '',
  label text NOT NULL,
  source_kind text NOT NULL DEFAULT 'manual', -- manual | auto_projects | auto_lighthouse | auto_clients
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_page_metrics TO anon, authenticated;
GRANT ALL ON public.site_page_metrics TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_page_metrics TO authenticated;
ALTER TABLE public.site_page_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read metrics" ON public.site_page_metrics FOR SELECT USING (is_active);
CREATE POLICY "admin write metrics" ON public.site_page_metrics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_spm_updated BEFORE UPDATE ON public.site_page_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. DIFERENCIAIS
CREATE TABLE IF NOT EXISTS public.site_page_differentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT 'Sparkles',
  title text NOT NULL,
  description text NOT NULL,
  link_url text,
  variant text DEFAULT 'default',
  is_highlighted boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_page_differentials TO anon, authenticated;
GRANT ALL ON public.site_page_differentials TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_page_differentials TO authenticated;
ALTER TABLE public.site_page_differentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read diff" ON public.site_page_differentials FOR SELECT USING (is_active);
CREATE POLICY "admin write diff" ON public.site_page_differentials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_spd_updated BEFORE UPDATE ON public.site_page_differentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. PROCESSO
CREATE TABLE IF NOT EXISTS public.site_page_process_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT 'CheckCircle2',
  estimated_time text,
  deliverables text[],
  is_highlighted boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_page_process_steps TO anon, authenticated;
GRANT ALL ON public.site_page_process_steps TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_page_process_steps TO authenticated;
ALTER TABLE public.site_page_process_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read process" ON public.site_page_process_steps FOR SELECT USING (is_active);
CREATE POLICY "admin write process" ON public.site_page_process_steps FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_spps_updated BEFORE UPDATE ON public.site_page_process_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. COMPARATIVO
CREATE TABLE IF NOT EXISTS public.site_page_comparison_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criterion text NOT NULL,
  value_a text NOT NULL,
  value_b text NOT NULL,
  icon_a text DEFAULT 'CheckCircle2',
  icon_b text DEFAULT 'X',
  is_highlighted boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_page_comparison_rows TO anon, authenticated;
GRANT ALL ON public.site_page_comparison_rows TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_page_comparison_rows TO authenticated;
ALTER TABLE public.site_page_comparison_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read comp" ON public.site_page_comparison_rows FOR SELECT USING (is_active);
CREATE POLICY "admin write comp" ON public.site_page_comparison_rows FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_spc_updated BEFORE UPDATE ON public.site_page_comparison_rows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. ROI METRICS
CREATE TABLE IF NOT EXISTS public.site_page_roi_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL,
  prefix text DEFAULT '',
  suffix text DEFAULT '',
  title text NOT NULL,
  description text,
  source_label text,
  source_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_page_roi_metrics TO anon, authenticated;
GRANT ALL ON public.site_page_roi_metrics TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_page_roi_metrics TO authenticated;
ALTER TABLE public.site_page_roi_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read roi" ON public.site_page_roi_metrics FOR SELECT USING (is_active);
CREATE POLICY "admin write roi" ON public.site_page_roi_metrics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_sproi_updated BEFORE UPDATE ON public.site_page_roi_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. PROJETOS EXIBIDOS (referência, não cópia)
CREATE TABLE IF NOT EXISTS public.site_page_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  is_hero boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  override_title text,
  override_description text,
  override_image_url text,
  override_cta_label text,
  override_cta_url text,
  open_new_tab boolean NOT NULL DEFAULT true,
  visible_tech_ids uuid[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);
GRANT SELECT ON public.site_page_projects TO anon, authenticated;
GRANT ALL ON public.site_page_projects TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_page_projects TO authenticated;
ALTER TABLE public.site_page_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read spp" ON public.site_page_projects FOR SELECT USING (is_active);
CREATE POLICY "admin write spp" ON public.site_page_projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_spp_updated BEFORE UPDATE ON public.site_page_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Garante único hero
CREATE OR REPLACE FUNCTION public.fn_single_hero_project()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.is_hero THEN
    UPDATE public.site_page_projects SET is_hero=false
    WHERE is_hero=true AND id IS DISTINCT FROM NEW.id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_single_hero BEFORE INSERT OR UPDATE ON public.site_page_projects
  FOR EACH ROW EXECUTE FUNCTION public.fn_single_hero_project();

-- 8. TECNOLOGIAS EXIBIDAS
CREATE TABLE IF NOT EXISTS public.site_page_tech (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tech_id uuid REFERENCES public.tech_registry(id) ON DELETE CASCADE,
  custom_label text,
  link_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_page_tech TO anon, authenticated;
GRANT ALL ON public.site_page_tech TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_page_tech TO authenticated;
ALTER TABLE public.site_page_tech ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read spt" ON public.site_page_tech FOR SELECT USING (is_active);
CREATE POLICY "admin write spt" ON public.site_page_tech FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_spt_updated BEFORE UPDATE ON public.site_page_tech
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. FAQS EXIBIDAS
CREATE TABLE IF NOT EXISTS public.site_page_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faq_id uuid NOT NULL REFERENCES public.faq_items(id) ON DELETE CASCADE,
  override_answer text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(faq_id)
);
GRANT SELECT ON public.site_page_faqs TO anon, authenticated;
GRANT ALL ON public.site_page_faqs TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_page_faqs TO authenticated;
ALTER TABLE public.site_page_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read spf" ON public.site_page_faqs FOR SELECT USING (is_active);
CREATE POLICY "admin write spf" ON public.site_page_faqs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_spf_updated BEFORE UPDATE ON public.site_page_faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. VERSÕES (snapshots)
CREATE TABLE IF NOT EXISTS public.site_page_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number int NOT NULL,
  snapshot jsonb NOT NULL,
  label text,
  created_by uuid REFERENCES auth.users(id),
  created_by_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.site_page_versions TO service_role;
GRANT SELECT, INSERT ON public.site_page_versions TO authenticated;
ALTER TABLE public.site_page_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read versions" ON public.site_page_versions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "admin write versions" ON public.site_page_versions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));

-- 11. LEADS DE DIAGNÓSTICO
CREATE TABLE IF NOT EXISTS public.site_page_diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_url text,
  utm jsonb DEFAULT '{}'::jsonb,
  consent_lgpd boolean NOT NULL DEFAULT false,
  consent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.site_page_diagnostics TO service_role;
GRANT SELECT ON public.site_page_diagnostics TO authenticated;
GRANT INSERT ON public.site_page_diagnostics TO anon, authenticated;
ALTER TABLE public.site_page_diagnostics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read diag" ON public.site_page_diagnostics FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "public insert diag" ON public.site_page_diagnostics FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- SEED com o conteúdo atual da página
-- ============================================================

INSERT INTO public.site_page_config (singleton, seo, hero_config, tech_config, cta_config, comparison_config, roi_config, faq_config, diagnostico, local, geo)
VALUES (
  true,
  jsonb_build_object(
    'title','Criação de Sites Profissionais | SevenDevX',
    'description','Criação de sites profissionais sob medida: código próprio, performance 90+ no Lighthouse, SEO técnico, segurança enterprise e ROI mensurável. Alternativa real a templates genéricos.',
    'keywords','criação de sites profissionais, desenvolvimento de sites, sites sob medida, site institucional, landing page, react, seo técnico',
    'canonical','https://www.sevendevx.com/criacao-de-sites-profissionais',
    'og_image','',
    'robots','index,follow'
  ),
  jsonb_build_object(
    'badge_text','Aceitando Novos Projetos',
    'badge_year','2026',
    'projects_available',3,
    'title_prefix','Sites que',
    'title_highlight','vendem, escalam',
    'title_suffix','e ranqueiam.',
    'description','Código próprio, performance 90+ no Lighthouse, SEO técnico e design sob medida. A alternativa real a templates genéricos e plataformas engessadas.',
    'cta_primary_label','Diagnóstico gratuito',
    'cta_primary_url','#diagnostico',
    'cta_primary_action','diagnostico',
    'cta_secondary_label','Ver projetos',
    'cta_secondary_url','/projects',
    'show_project',true,
    'show_metrics',true,
    'animations',true
  ),
  jsonb_build_object('speed',40,'direction','left','separator','◆'),
  jsonb_build_object(
    'badge','Vamos conversar',
    'title','Pronto para tirar seu projeto do template?',
    'description','Diagnóstico gratuito de 30 minutos. Saímos com um plano claro de escopo, prazo e investimento.',
    'button_text','Começar diagnóstico',
    'button_url','#diagnostico',
    'action_type','diagnostico'
  ),
  jsonb_build_object(
    'title','Sob medida vs. template genérico',
    'subtitle','Por que investir em código próprio ao invés de plataforma engessada',
    'col_a_label','Site sob medida',
    'col_b_label','Template genérico'
  ),
  jsonb_build_object(
    'badge','Retorno sobre investimento',
    'title','Por que investir em site profissional paga a conta rápido',
    'description','Estudos independentes mostram o impacto direto de performance, UX e SEO no faturamento.',
    'source_note','Resultados podem variar conforme mercado, escopo e execução.',
    'legal_note','Dados agregados de estudos públicos (Google, Amazon, Deloitte).'
  ),
  jsonb_build_object('max_items',5,'first_open',true,'accordion_mode','single'),
  jsonb_build_object(
    'enabled',true,
    'mode','modal',
    'title','Diagnóstico gratuito',
    'description','Preencha em 2 minutos e retornamos em até 24h com um plano claro.',
    'consent_text','Autorizo o contato conforme a LGPD.',
    'redirect_url','',
    'steps',jsonb_build_array(
      jsonb_build_object('id','contact','title','Dados de contato','fields',jsonb_build_array('name','email','phone')),
      jsonb_build_object('id','business','title','Sobre o negócio','fields',jsonb_build_array('company','segment')),
      jsonb_build_object('id','project','title','Tipo de projeto','fields',jsonb_build_array('project_type','current_site')),
      jsonb_build_object('id','goals','title','Objetivos','fields',jsonb_build_array('goals')),
      jsonb_build_object('id','budget','title','Orçamento e prazo','fields',jsonb_build_array('budget','deadline')),
      jsonb_build_object('id','extra','title','Detalhes adicionais','fields',jsonb_build_array('notes'))
    )
  ),
  jsonb_build_object(
    'city','Belo Horizonte','state','MG','region','Sudeste',
    'neighborhoods',jsonb_build_array('Venda Nova','Pampulha','Savassi','Centro'),
    'phone','+55 31 98474-0625','whatsapp','5531984740625',
    'email','contato@sevendevx.com','hours','Seg-Sex 9h-18h'
  ),
  jsonb_build_object(
    'summary','SevenDevX cria sites profissionais sob medida em Belo Horizonte e para todo Brasil, com foco em performance, SEO técnico e conversão.',
    'service_desc','Desenvolvimento web sob medida com React, TypeScript e cloud-native.',
    'area_served','Brasil',
    'sources',jsonb_build_array()
  )
)
ON CONFLICT (singleton) DO NOTHING;

-- Métricas
INSERT INTO public.site_page_metrics (value, prefix, suffix, label, source_kind, sort_order) VALUES
(17,'','+','Projetos entregues','manual',0),
(98,'','','Lighthouse médio','manual',1),
(7,'','d','Prazo mínimo','manual',2)
ON CONFLICT DO NOTHING;

-- Diferenciais
INSERT INTO public.site_page_differentials (icon, title, description, sort_order) VALUES
('Code2','Código próprio, não template','Arquitetura React/TypeScript feita para escalar — sem plugins pesados, sem lock-in de plataforma.',0),
('Gauge','Performance 90+ Lighthouse','LCP < 2s, CLS zero, imagens otimizadas e cache inteligente. Google recompensa velocidade.',1),
('Search','SEO técnico completo','Meta tags dinâmicas, Schema.org, sitemap, robots, canonical e otimização para AI Overviews.',2),
('ShieldCheck','Segurança enterprise','HTTPS, CSP, rate limiting, RLS no banco e políticas OWASP aplicadas por padrão.',3),
('Layers','Design system exclusivo','Identidade visual única — nada de aparência genérica de tema comprado.',4),
('Sparkles','IA integrada de fábrica','Chatbot, geração de conteúdo e automações prontas para converter mais leads.',5)
ON CONFLICT DO NOTHING;

-- Processo
INSERT INTO public.site_page_process_steps (step_number, title, description, icon, estimated_time, sort_order) VALUES
('01','Diagnóstico','Reunião de 30min para entender objetivo, público e métricas de sucesso.','Search','1-3 dias',0),
('02','Design & Prototipagem','Wireframes, identidade visual e protótipo navegável em Figma.','Layers','1-2 semanas',1),
('03','Desenvolvimento','Sprints semanais com preview ao vivo, código próprio e code review contínuo.','Code2','2-8 semanas',2),
('04','Launch & Growth','Deploy em CDN global, SEO técnico auditado e monitoramento 24/7.','Rocket','Contínuo',3)
ON CONFLICT DO NOTHING;

-- Comparativo
INSERT INTO public.site_page_comparison_rows (criterion, value_a, value_b, sort_order) VALUES
('Performance (Lighthouse)','90–100','40–65',0),
('Customização','Ilimitada','Limitada ao tema',1),
('SEO técnico','Completo e auditável','Plugin dependente',2),
('Escalabilidade','Cloud-native, elástica','Trava com tráfego',3),
('Custo mensal','Hospedagem enxuta','Licenças + plugins premium',4),
('Propriedade do código','100% sua','Preso à plataforma',5)
ON CONFLICT DO NOTHING;

-- ROI
INSERT INTO public.site_page_roi_metrics (value, prefix, suffix, title, description, source_label, source_url, sort_order) VALUES
('27','+','%','Aumento em conversão','Sites com LCP abaixo de 2.5s convertem em média 27% mais que os lentos.','Google Web.dev','https://web.dev/why-speed-matters',0),
('2','','×','Retorno em SEO técnico','Empresas com SEO técnico bem executado dobram tráfego orgânico em 12 meses.','Backlinko / Ahrefs','https://backlinko.com',1),
('16','−','%','Redução em bounce rate','Cada segundo a mais no carregamento aumenta o bounce em ~16%.','Deloitte Digital','https://www.deloitte.com',2)
ON CONFLICT DO NOTHING;

-- Versão inicial
INSERT INTO public.site_page_versions (version_number, snapshot, label, created_by_email)
VALUES (1, jsonb_build_object('type','initial_seed','date',now()), 'Seed inicial (v1)', 'system')
ON CONFLICT DO NOTHING;
