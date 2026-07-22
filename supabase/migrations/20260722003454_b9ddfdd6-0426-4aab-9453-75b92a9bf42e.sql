DROP POLICY IF EXISTS "Admins can manage all projects" ON public.projects;
DROP POLICY IF EXISTS "Published projects are viewable by everyone" ON public.projects;

CREATE POLICY "Admins can manage all projects"
ON public.projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Published projects are viewable by everyone"
ON public.projects
FOR SELECT
TO anon, authenticated
USING (status = 'published'::project_status AND is_published_on_site = true);

DROP POLICY IF EXISTS "Admins manage faq items" ON public.faq_items;
DROP POLICY IF EXISTS "FAQ items viewable" ON public.faq_items;

CREATE POLICY "Admins manage faq items"
ON public.faq_items
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "FAQ items viewable"
ON public.faq_items
FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage tech registry" ON public.tech_registry;

CREATE POLICY "Admins can manage tech registry"
ON public.tech_registry
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));