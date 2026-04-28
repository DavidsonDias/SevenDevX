-- ============================================
-- FASE FINAL: Document Engine + Attachments + TC
-- ============================================

-- 1) ATTACHMENTS (sistema unificado de arquivos)
CREATE TYPE public.attachment_type AS ENUM ('logo', 'file', 'idea', 'document', 'contract');

CREATE TABLE public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  type public.attachment_type NOT NULL DEFAULT 'file',
  client_id UUID,
  project_id UUID,
  stage_id UUID,
  uploaded_by UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attachments_client ON public.attachments(client_id);
CREATE INDEX idx_attachments_project ON public.attachments(project_id);
CREATE INDEX idx_attachments_stage ON public.attachments(stage_id);
CREATE INDEX idx_attachments_type ON public.attachments(type);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage attachments"
ON public.attachments FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2) STAGE DOCUMENTS (Document Engine)
CREATE TYPE public.document_type AS ENUM (
  'briefing', 'competitor_analysis', 'kpis',
  'user_journey', 'scope_macro', 'roadmap',
  'technical_scope', 'timeline', 'investment',
  'wireframes', 'prototype', 'design_system',
  'setup', 'sprints', 'qa',
  'deploy', 'monitoring', 'training', 'evolution_plan',
  'custom'
);

CREATE TABLE public.stage_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  stage_id UUID NOT NULL,
  type public.document_type NOT NULL DEFAULT 'custom',
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  version INT NOT NULL DEFAULT 1,
  generated_by_ai BOOLEAN NOT NULL DEFAULT false,
  ai_model TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stage_documents_project ON public.stage_documents(project_id);
CREATE INDEX idx_stage_documents_stage ON public.stage_documents(stage_id);
CREATE INDEX idx_stage_documents_type ON public.stage_documents(type);

ALTER TABLE public.stage_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage stage documents"
ON public.stage_documents FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_stage_documents_updated_at
BEFORE UPDATE ON public.stage_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) TERMO/CONTRATO (TC) em clients e projects
CREATE TYPE public.contract_status AS ENUM ('pending', 'sent', 'approved', 'rejected');

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS contract_status public.contract_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS contract_text TEXT,
  ADD COLUMN IF NOT EXISTS contract_url TEXT,
  ADD COLUMN IF NOT EXISTS contract_updated_at TIMESTAMPTZ;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS contract_status public.contract_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS contract_text TEXT,
  ADD COLUMN IF NOT EXISTS contract_url TEXT,
  ADD COLUMN IF NOT EXISTS contract_updated_at TIMESTAMPTZ;

-- 4) Storage bucket para anexos
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'attachments');

CREATE POLICY "Admins upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'attachments' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update attachments"
ON storage.objects FOR UPDATE
USING (bucket_id = 'attachments' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'attachments' AND public.has_role(auth.uid(), 'admin'));