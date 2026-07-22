
-- site_page_* tables: public read + authenticated admin write
GRANT SELECT ON public.site_page_config, public.site_page_metrics, public.site_page_differentials, public.site_page_process_steps, public.site_page_comparison_rows, public.site_page_roi_metrics, public.site_page_projects, public.site_page_tech, public.site_page_faqs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_page_config, public.site_page_metrics, public.site_page_differentials, public.site_page_process_steps, public.site_page_comparison_rows, public.site_page_roi_metrics, public.site_page_projects, public.site_page_tech, public.site_page_faqs, public.site_page_versions, public.site_page_diagnostics TO authenticated;
GRANT SELECT, INSERT ON public.site_page_diagnostics TO anon;
GRANT SELECT ON public.site_page_versions TO authenticated;
GRANT ALL ON public.site_page_config, public.site_page_metrics, public.site_page_differentials, public.site_page_process_steps, public.site_page_comparison_rows, public.site_page_roi_metrics, public.site_page_projects, public.site_page_tech, public.site_page_faqs, public.site_page_versions, public.site_page_diagnostics TO service_role;

-- Joined tables read by public landing page
GRANT SELECT ON public.projects, public.tech_registry, public.faq_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects, public.tech_registry, public.faq_items TO authenticated;
GRANT ALL ON public.projects, public.tech_registry, public.faq_items TO service_role;
