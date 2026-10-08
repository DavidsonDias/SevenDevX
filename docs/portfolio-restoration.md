# Davidson portfolio restoration

The restored CMS has a published davidson site, content version 4, and eight published portfolio projects. The target Supabase lacked portfolio-content, portfolio-cover and tech-icon deployments. portfolio_settings has an admin-only RLS policy but no authenticated table grant, causing the administration UI to lose its settings.

Changes: persist public read-only endpoint configuration, check publication before all content/detail reads, and derive ETag from response content excluding generated_at so project edits invalidate cache.

Before rollout, approve public access to portfolio-content and portfolio-cover and restoration of SELECT/UPDATE on public.portfolio_settings to authenticated. Existing RLS continues to restrict access to admins. No anon table access, INSERT or DELETE required. Covers bucket is already public.

Validation: nine isolated fixture scenarios passed: missing/unpublished sites on list and both detail routes, published list, unchanged ETag 304, changed project 200. No production content was edited.
