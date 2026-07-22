
GRANT SELECT ON public.site_page_config TO anon, authenticated;
GRANT SELECT ON public.site_page_projects TO anon, authenticated;
GRANT SELECT ON public.site_page_tech TO anon, authenticated;
GRANT SELECT ON public.site_page_faqs TO anon, authenticated;
GRANT SELECT ON public.site_page_metrics TO anon, authenticated;
GRANT SELECT ON public.site_page_process_steps TO anon, authenticated;
GRANT SELECT ON public.site_page_roi_metrics TO anon, authenticated;
GRANT SELECT ON public.site_page_differentials TO anon, authenticated;
GRANT SELECT ON public.site_page_comparison_rows TO anon, authenticated;
GRANT INSERT ON public.site_page_diagnostics TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_page_config, public.site_page_projects, public.site_page_tech, public.site_page_faqs, public.site_page_metrics, public.site_page_process_steps, public.site_page_roi_metrics, public.site_page_differentials, public.site_page_comparison_rows TO authenticated;
GRANT ALL ON public.site_page_config, public.site_page_projects, public.site_page_tech, public.site_page_faqs, public.site_page_metrics, public.site_page_process_steps, public.site_page_roi_metrics, public.site_page_differentials, public.site_page_comparison_rows, public.site_page_diagnostics, public.site_page_versions TO service_role;
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT SELECT ON public.tech_registry TO anon, authenticated;
