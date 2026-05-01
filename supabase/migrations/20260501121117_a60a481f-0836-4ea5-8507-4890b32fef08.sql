-- 1. Adicionar novos valores ao enum (não pode estar em transação com uso, então fazemos antes)
ALTER TYPE project_pipeline_stage ADD VALUE IF NOT EXISTS 'diagnostico';
ALTER TYPE project_pipeline_stage ADD VALUE IF NOT EXISTS 'contrato';
ALTER TYPE project_pipeline_stage ADD VALUE IF NOT EXISTS 'entrega';

-- 2. Criar tabela de auditoria de transições
CREATE TABLE IF NOT EXISTS public.pipeline_stage_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  from_stage project_pipeline_stage,
  to_stage project_pipeline_stage NOT NULL,
  changed_by UUID,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_log_project ON public.pipeline_stage_log(project_id, created_at DESC);

ALTER TABLE public.pipeline_stage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage pipeline log"
ON public.pipeline_stage_log
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));