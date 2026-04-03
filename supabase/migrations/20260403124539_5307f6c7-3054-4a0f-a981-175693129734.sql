
-- Insert blog categories
INSERT INTO public.blog_categories (name, slug, color, description) VALUES
  ('Frontend Engineering', 'frontend-engineering', '#3B82F6', 'Artigos sobre React, TypeScript, CSS e interfaces modernas'),
  ('Backend & APIs', 'backend-apis', '#10B981', 'Arquitetura de backend, APIs REST/GraphQL e integrações'),
  ('UX & Product', 'ux-product', '#F59E0B', 'Design de produto, pesquisa de usuário e experiência'),
  ('Performance', 'performance', '#EF4444', 'Core Web Vitals, otimização e velocidade'),
  ('SaaS & Arquitetura', 'saas-arquitetura', '#8B5CF6', 'Padrões de arquitetura, escalabilidade e SaaS')
ON CONFLICT DO NOTHING;
