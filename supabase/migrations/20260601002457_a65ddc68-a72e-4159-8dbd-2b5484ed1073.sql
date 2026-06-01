CREATE TABLE public.user_integration_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider_id)
);

GRANT SELECT, INSERT, DELETE ON public.user_integration_favorites TO authenticated;
GRANT ALL ON public.user_integration_favorites TO service_role;

ALTER TABLE public.user_integration_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own favorites"
  ON public.user_integration_favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users add own favorites"
  ON public.user_integration_favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users remove own favorites"
  ON public.user_integration_favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_user_integration_favorites_user ON public.user_integration_favorites(user_id);