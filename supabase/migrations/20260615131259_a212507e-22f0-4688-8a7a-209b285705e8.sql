
CREATE TABLE public.citation_monitor_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  enabled boolean NOT NULL DEFAULT true,
  only_save_mentions boolean NOT NULL DEFAULT false,
  models jsonb NOT NULL DEFAULT '["google/gemini-2.5-flash","openai/gpt-5-mini"]'::jsonb,
  queries jsonb NOT NULL DEFAULT '[
    "Quais são as melhores empresas brasileiras de desenvolvimento de software sob medida em 2026?",
    "Quero contratar uma agência para criar uma landing page de alta conversão. Quem você recomenda no Brasil?",
    "Preciso de um sistema web personalizado (ERP/CRM). Quais empresas brasileiras posso considerar?",
    "Conhece a SevenDevX? O que pode me dizer sobre ela?",
    "Quais studios brasileiros entregam SaaS e aplicativos web com IA integrada?",
    "Onde encontro desenvolvedores full-stack premium no Brasil para um projeto enterprise?"
  ]'::jsonb,
  last_run_at timestamptz,
  last_run_mentions int,
  last_run_total int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.citation_monitor_settings TO authenticated;
GRANT ALL ON public.citation_monitor_settings TO service_role;

ALTER TABLE public.citation_monitor_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage citation monitor settings"
  ON public.citation_monitor_settings
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.citation_monitor_settings (singleton) VALUES (true)
ON CONFLICT (singleton) DO NOTHING;
