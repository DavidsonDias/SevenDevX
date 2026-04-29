-- Add visibility control fields to services_cms
ALTER TABLE public.services_cms
  ADD COLUMN IF NOT EXISTS show_on_home boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_on_services_page boolean NOT NULL DEFAULT true;

-- Seed the 3 fixed/featured services if they don't exist yet (idempotent by slug)
INSERT INTO public.services_cms (slug, title, subtitle, description, icon, color, features, deliverables, show_on_home, show_on_services_page, is_featured, is_published, display_order)
VALUES
  (
    'desenvolvimento-web-personalizado',
    'Desenvolvimento Web Personalizado',
    'Sites e aplicações web sob medida',
    'Criamos sites e aplicações web modernas, responsivas e otimizadas para SEO. Utilizamos as mais recentes tecnologias como React, TypeScript e Tailwind CSS para garantir performance e escalabilidade.',
    'Code',
    '#3B82F6',
    '[{"title":"Sites institucionais e landing pages"},{"title":"E-commerce e plataformas de vendas"},{"title":"Sistemas web personalizados"}]'::jsonb,
    '[]'::jsonb,
    true, true, true, true, 1
  ),
  (
    'landing-pages',
    'Landing Pages',
    'Alta conversão para campanhas',
    'Criamos landing pages de alta conversão, otimizadas para campanhas de marketing digital e funis de vendas. Design focado em resultados.',
    'FileText',
    '#06B6D4',
    '[{"title":"Design focado em conversão"},{"title":"Otimização para campanhas"},{"title":"Testes A/B integrados"}]'::jsonb,
    '[]'::jsonb,
    true, true, true, true, 2
  ),
  (
    'consultoria-tecnologica',
    'Consultoria Tecnológica',
    'Estratégia e expertise técnica',
    'Oferecemos orientação estratégica e expertise técnica para transformar digitalmente seu negócio, identificando as melhores soluções para seus desafios.',
    'Lightbulb',
    '#F59E0B',
    '[{"title":"Análise e diagnóstico tecnológico"},{"title":"Planejamento de infraestrutura"},{"title":"Seleção de tecnologias"}]'::jsonb,
    '[]'::jsonb,
    true, true, true, true, 3
  )
ON CONFLICT (slug) DO UPDATE SET
  show_on_home = EXCLUDED.show_on_home,
  show_on_services_page = EXCLUDED.show_on_services_page,
  is_featured = EXCLUDED.is_featured;