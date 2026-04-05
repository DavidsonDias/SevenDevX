INSERT INTO blog_categories (name, slug, color, description)
VALUES ('Full Stack', 'full-stack', '#6366F1', 'Arquitetura e desenvolvimento full stack')
ON CONFLICT (slug) DO NOTHING;