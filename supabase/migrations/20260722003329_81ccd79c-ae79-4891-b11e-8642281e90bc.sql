GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON public.site_page_config TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_page_config TO authenticated;
GRANT ALL ON public.site_page_config TO service_role;

GRANT SELECT ON public.site_page_metrics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_page_metrics TO authenticated;
GRANT ALL ON public.site_page_metrics TO service_role;

GRANT SELECT ON public.site_page_differentials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_page_differentials TO authenticated;
GRANT ALL ON public.site_page_differentials TO service_role;

GRANT SELECT ON public.site_page_process_steps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_page_process_steps TO authenticated;
GRANT ALL ON public.site_page_process_steps TO service_role;

GRANT SELECT ON public.site_page_comparison_rows TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_page_comparison_rows TO authenticated;
GRANT ALL ON public.site_page_comparison_rows TO service_role;

GRANT SELECT ON public.site_page_roi_metrics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_page_roi_metrics TO authenticated;
GRANT ALL ON public.site_page_roi_metrics TO service_role;

GRANT SELECT ON public.site_page_projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_page_projects TO authenticated;
GRANT ALL ON public.site_page_projects TO service_role;

GRANT SELECT ON public.site_page_tech TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_page_tech TO authenticated;
GRANT ALL ON public.site_page_tech TO service_role;

GRANT SELECT ON public.site_page_faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_page_faqs TO authenticated;
GRANT ALL ON public.site_page_faqs TO service_role;

GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;

GRANT SELECT ON public.tech_registry TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tech_registry TO authenticated;
GRANT ALL ON public.tech_registry TO service_role;

GRANT SELECT ON public.faq_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faq_items TO authenticated;
GRANT ALL ON public.faq_items TO service_role;