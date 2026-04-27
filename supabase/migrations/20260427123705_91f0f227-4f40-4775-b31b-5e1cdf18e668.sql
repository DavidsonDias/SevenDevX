-- ============================================================
-- SEVENDEVX ECOSYSTEM — FOUNDATION MIGRATION
-- Tables: clients, client_interactions, process_templates,
--         process_template_stages, project_stages, stage_checklist_items,
--         services_cms, faq_categories, faq_items
-- ============================================================

-- ENUMS
CREATE TYPE public.client_status AS ENUM ('lead','qualified','active','finished','lost');
CREATE TYPE public.stage_status AS ENUM ('pending','in_progress','completed','blocked');
CREATE TYPE public.interaction_type AS ENUM ('meeting','proposal','message','call','note','email','file');
CREATE TYPE public.project_pipeline_stage AS ENUM ('lead','discovery','proposal','execution','launch','done');

-- ============================================================
-- CLIENTS (separate from contacts; contacts = leads do site)
-- ============================================================
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  name text NOT NULL,
  company text,
  email text,
  phone text,
  whatsapp text,
  segment text,
  revenue_range text,
  status public.client_status NOT NULL DEFAULT 'lead',
  avatar_url text,
  notes text,
  ai_summary text,
  ai_summary_updated_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage clients" ON public.clients
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_contact ON public.clients(contact_id);

-- Add client link on projects (nullable)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS pipeline_stage public.project_pipeline_stage NOT NULL DEFAULT 'lead';
CREATE INDEX IF NOT EXISTS idx_projects_pipeline ON public.projects(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_projects_client ON public.projects(client_id);

-- ============================================================
-- CLIENT INTERACTIONS (timeline)
-- ============================================================
CREATE TABLE public.client_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type public.interaction_type NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage interactions" ON public.client_interactions
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_interactions_client ON public.client_interactions(client_id, occurred_at DESC);

-- ============================================================
-- PROCESS ENGINE — global template
-- ============================================================
CREATE TABLE public.process_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.process_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Templates viewable" ON public.process_templates FOR SELECT USING (true);
CREATE POLICY "Admins manage templates" ON public.process_templates
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_pt_updated_at BEFORE UPDATE ON public.process_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.process_template_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.process_templates(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  color text DEFAULT '#8B5CF6',
  display_order integer NOT NULL DEFAULT 0,
  default_checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_deliverables jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_prompt text,
  is_visible_on_site boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(template_id, slug)
);
ALTER TABLE public.process_template_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stages viewable" ON public.process_template_stages FOR SELECT USING (true);
CREATE POLICY "Admins manage stages" ON public.process_template_stages
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_pts_updated_at BEFORE UPDATE ON public.process_template_stages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_pts_template ON public.process_template_stages(template_id, display_order);

-- ============================================================
-- PROJECT STAGES (instances per project)
-- ============================================================
CREATE TABLE public.project_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  template_stage_id uuid REFERENCES public.process_template_stages(id) ON DELETE SET NULL,
  slug text NOT NULL,
  name text NOT NULL,
  status public.stage_status NOT NULL DEFAULT 'pending',
  display_order integer NOT NULL DEFAULT 0,
  responsible_user_id uuid,
  started_at timestamptz,
  completed_at timestamptz,
  due_at timestamptz,
  notes text,
  ai_output text,
  ai_output_updated_at timestamptz,
  files jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, slug)
);
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage project stages" ON public.project_stages
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_ps_updated_at BEFORE UPDATE ON public.project_stages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_ps_project ON public.project_stages(project_id, display_order);

CREATE TABLE public.stage_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL REFERENCES public.project_stages(id) ON DELETE CASCADE,
  title text NOT NULL,
  is_done boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  done_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stage_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage checklist" ON public.stage_checklist_items
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_checklist_stage ON public.stage_checklist_items(stage_id, display_order);

-- ============================================================
-- SERVICES CMS
-- ============================================================
CREATE TABLE public.services_cms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  description text NOT NULL,
  long_description text,
  icon text,
  color text DEFAULT '#8B5CF6',
  cover_image text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  deliverables jsonb NOT NULL DEFAULT '[]'::jsonb,
  technologies jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_from numeric(10,2),
  price_label text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.services_cms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published services viewable" ON public.services_cms
  FOR SELECT USING (is_published = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage services" ON public.services_cms
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON public.services_cms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- FAQ
-- ============================================================
CREATE TABLE public.faq_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQ cats viewable" ON public.faq_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage faq cats" ON public.faq_categories
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.faq_categories(id) ON DELETE SET NULL,
  question text NOT NULL,
  answer text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  views_count integer NOT NULL DEFAULT 0,
  helpful_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQ items viewable" ON public.faq_items
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage faq items" ON public.faq_items
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_faq_updated_at BEFORE UPDATE ON public.faq_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_faq_category ON public.faq_items(category_id, display_order);

-- ============================================================
-- DEFAULT PROCESS TEMPLATE + 6 STAGES
-- ============================================================
INSERT INTO public.process_templates (id, name, description, is_default)
VALUES ('00000000-0000-0000-0000-000000000001', 'SevenDevX Standard Process',
        'Processo padrão de entrega de produtos digitais', true);

INSERT INTO public.process_template_stages (template_id, slug, name, description, icon, color, display_order, default_checklist, default_deliverables, ai_prompt) VALUES
('00000000-0000-0000-0000-000000000001','discovery','Descoberta & Diagnóstico','Entendimento profundo do problema, mercado e usuário.','Search','#3B82F6',1,
 '[{"title":"Reunião de kickoff"},{"title":"Briefing assinado"},{"title":"Análise de concorrência"},{"title":"Definição de KPIs"}]'::jsonb,
 '[{"title":"Briefing"},{"title":"Análise competitiva"},{"title":"KPIs"}]'::jsonb,
 'Gere um diagnóstico completo: briefing, análise de concorrência, oportunidades de mercado e KPIs sugeridos.'),
('00000000-0000-0000-0000-000000000001','strategy','Estratégia & Planejamento','Definição de escopo, roadmap e diferenciais.','Target','#8B5CF6',2,
 '[{"title":"Mapa de jornada"},{"title":"Definição de escopo"},{"title":"Roadmap macro"}]'::jsonb,
 '[{"title":"Roadmap"},{"title":"Estratégia de produto"}]'::jsonb,
 'Crie a estratégia: posicionamento, jornada do usuário, escopo macro e roadmap em fases.'),
('00000000-0000-0000-0000-000000000001','proposal','Proposta & Alinhamento','Proposta comercial detalhada e alinhamento de expectativas.','FileText','#10B981',3,
 '[{"title":"Escopo técnico"},{"title":"Cronograma"},{"title":"Investimento"},{"title":"Aprovação cliente"}]'::jsonb,
 '[{"title":"Proposta comercial"},{"title":"Contrato"}]'::jsonb,
 'Gere uma proposta comercial profissional com escopo, cronograma, investimento e termos.'),
('00000000-0000-0000-0000-000000000001','design','Design & Prototipação','Design de interface, protótipos e validação.','Palette','#F59E0B',4,
 '[{"title":"Wireframes"},{"title":"Protótipo navegável"},{"title":"Design system"},{"title":"Aprovação visual"}]'::jsonb,
 '[{"title":"Protótipo Figma"},{"title":"Design System"}]'::jsonb,
 'Sugira diretrizes de design, paleta, tipografia e estrutura de telas para o projeto.'),
('00000000-0000-0000-0000-000000000001','development','Desenvolvimento & Iteração','Construção iterativa com entregas semanais.','Code','#EF4444',5,
 '[{"title":"Setup ambiente"},{"title":"Sprints semanais"},{"title":"Code review"},{"title":"Testes QA"}]'::jsonb,
 '[{"title":"Código versionado"},{"title":"Build de homologação"}]'::jsonb,
 'Crie um plano técnico: stack recomendada, arquitetura, sprints e marcos de entrega.'),
('00000000-0000-0000-0000-000000000001','launch','Lançamento & Evolução','Go-live, monitoramento e evolução contínua.','Rocket','#EC4899',6,
 '[{"title":"Deploy produção"},{"title":"Monitoramento"},{"title":"Treinamento cliente"},{"title":"Plano de evolução"}]'::jsonb,
 '[{"title":"App em produção"},{"title":"Documentação"}]'::jsonb,
 'Monte plano de lançamento, monitoramento (analytics, erros) e roadmap de evolução pós go-live.');

-- ============================================================
-- SEED FAQ CATEGORIES + ITEMS (a partir do que existe no site)
-- ============================================================
INSERT INTO public.faq_categories (slug,name,display_order) VALUES
('geral','Geral',1),('processo','Processo',2),('investimento','Investimento',3),('tecnologia','Tecnologia',4);

-- ============================================================
-- SEED SERVICES (placeholders editáveis)
-- ============================================================
INSERT INTO public.services_cms (slug,title,subtitle,description,icon,color,display_order,is_featured,features) VALUES
('web-apps','Web Apps','Aplicações web sob medida','Plataformas web escaláveis com performance enterprise.','Globe','#3B82F6',1,true,
 '["React + TypeScript","Backend Supabase","Deploy automatizado"]'::jsonb),
('mobile','Mobile Apps','iOS & Android nativos','Apps mobile com UX premium.','Smartphone','#8B5CF6',2,true,
 '["React Native","PWA","Performance nativa"]'::jsonb),
('saas','Plataformas SaaS','Produtos recorrentes','Construção completa de produtos SaaS.','Layers','#10B981',3,true,
 '["Multi-tenant","Billing","Dashboard"]'::jsonb),
('ia','Soluções com IA','Automação inteligente','Integração de IA generativa em produtos.','Brain','#EC4899',4,true,
 '["Lovable AI","RAG","Agentes"]'::jsonb);