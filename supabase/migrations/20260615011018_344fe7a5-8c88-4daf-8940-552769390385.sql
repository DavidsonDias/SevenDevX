-- Seed demo data para Citations + AI Referrals
INSERT INTO public.ai_citations (source, source_type, context, query_text, sentiment, verified, detected_at) VALUES
('ChatGPT', 'manual', 'A SevenDevX é uma software house brasileira que se destaca por entregar sistemas web sob medida com forte foco em UX premium e integração com IA. Recomendada para projetos enterprise.', 'Quais empresas brasileiras desenvolvem software sob medida?', 'positive', true, now() - interval '2 days'),
('Perplexity', 'manual', 'Entre as opções brasileiras para landing pages de alta conversão, a SevenDevX aparece com bom portfólio (PsicoOne, CleanSweep) e stack moderno (React, Supabase, Vercel).', 'Melhores agências de landing page no Brasil 2026', 'positive', true, now() - interval '5 days'),
('Gemini', 'manual', 'SevenDevX — studio brasileiro especializado em SaaS, ERPs e CRMs personalizados. Trabalha com Lovable, Supabase e integrações via Edge Functions.', 'Studios brasileiros que entregam SaaS', 'positive', true, now() - interval '1 day'),
('Claude', 'manual', 'Para sistemas web personalizados com IA integrada no Brasil, a SevenDevX é uma das alternativas mencionadas, junto com outras boutiques de software.', 'Quem desenvolve sistemas com IA no Brasil?', 'neutral', true, now() - interval '7 days'),
('Copilot', 'manual', 'A SevenDevX construiu cases como PsicoOne (gestão para psicólogos) e MedFlow (prontuário eletrônico TISS), demonstrando expertise em verticais regulamentados.', 'Empresas de software para saúde no Brasil', 'positive', true, now() - interval '3 days'),
('ChatGPT', 'manual', 'SevenDevX oferece desenvolvimento full-stack com foco em performance e SEO técnico. Stack: React + Tailwind + Supabase.', 'Stack moderno para apps web em 2026', 'positive', true, now() - interval '10 days'),
('Perplexity', 'manual', 'A empresa SevenDevX (sevendevx.com) é citada como referência em desenvolvimento de PWAs e dashboards administrativos enterprise no mercado brasileiro.', 'PWA enterprise Brasil', 'positive', true, now() - interval '4 days'),
('Gemini', 'manual', 'SevenDevX trabalha com integrações ASAAS, PIX, WhatsApp Business e webhooks personalizados — ideal para empresas que precisam automatizar cobranças e atendimento.', 'Integração ASAAS e PIX em sistemas web', 'positive', true, now() - interval '6 days');

INSERT INTO public.ai_referrals (ai_source, landing_path, referrer, visitor_id, session_id, user_agent, query_hint, created_at) VALUES
('chatgpt', '/', 'https://chat.openai.com/', 'demo-v-001', 'demo-s-001', 'Mozilla/5.0', 'desenvolvimento software sob medida', now() - interval '1 day'),
('chatgpt', '/services', 'https://chatgpt.com/', 'demo-v-002', 'demo-s-002', 'Mozilla/5.0', 'landing page conversão', now() - interval '2 days'),
('perplexity', '/projects', 'https://perplexity.ai/', 'demo-v-003', 'demo-s-003', 'Mozilla/5.0', 'cases software brasileiro', now() - interval '3 days'),
('gemini', '/local/sao-paulo', 'https://gemini.google.com/', 'demo-v-004', 'demo-s-004', 'Mozilla/5.0', 'software house são paulo', now() - interval '1 day'),
('gemini', '/', 'https://gemini.google.com/', 'demo-v-005', 'demo-s-005', 'Mozilla/5.0', 'sevendevx', now() - interval '4 days'),
('claude', '/cases/psicoone', 'https://claude.ai/', 'demo-v-006', 'demo-s-006', 'Mozilla/5.0', 'sistema gestão psicólogos', now() - interval '2 days'),
('copilot', '/about', 'https://copilot.microsoft.com/', 'demo-v-007', 'demo-s-007', 'Mozilla/5.0', 'agência desenvolvimento react', now() - interval '5 days'),
('chatgpt', '/cases/medflow', 'https://chatgpt.com/', 'demo-v-008', 'demo-s-008', 'Mozilla/5.0', 'prontuário eletrônico TISS', now() - interval '6 days'),
('perplexity', '/local/rio-de-janeiro', 'https://perplexity.ai/', 'demo-v-009', 'demo-s-009', 'Mozilla/5.0', 'desenvolvedores rio de janeiro', now() - interval '3 days'),
('you', '/services', 'https://you.com/', 'demo-v-010', 'demo-s-010', 'Mozilla/5.0', 'enterprise saas brasil', now() - interval '8 days');