
CREATE TABLE public.ai_citations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'manual',
  url TEXT,
  context TEXT,
  query_text TEXT,
  sentiment TEXT DEFAULT 'neutral',
  verified BOOLEAN NOT NULL DEFAULT false,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_citations TO authenticated;
GRANT ALL ON public.ai_citations TO service_role;
ALTER TABLE public.ai_citations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage citations" ON public.ai_citations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_ai_citations_updated BEFORE UPDATE ON public.ai_citations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_ai_citations_source ON public.ai_citations(source);
CREATE INDEX idx_ai_citations_detected ON public.ai_citations(detected_at DESC);

CREATE TABLE public.ai_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_source TEXT NOT NULL,
  landing_path TEXT NOT NULL,
  referrer TEXT,
  visitor_id TEXT,
  session_id TEXT,
  user_agent TEXT,
  query_hint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ai_referrals TO authenticated;
GRANT SELECT, INSERT ON public.ai_referrals TO anon;
GRANT ALL ON public.ai_referrals TO service_role;
ALTER TABLE public.ai_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone insert ai_referrals" ON public.ai_referrals FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read ai_referrals" ON public.ai_referrals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX idx_ai_referrals_source ON public.ai_referrals(ai_source);
CREATE INDEX idx_ai_referrals_created ON public.ai_referrals(created_at DESC);
