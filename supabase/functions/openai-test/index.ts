import { createClient } from 'npm:@supabase/supabase-js@2.94.0';
import { openAIRequest, textModel, imageModel } from '../_shared/openai.ts';
const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'POST required' }), { status: 405, headers });
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  let authorized = !!token && !!serviceKey && token === serviceKey;
  // New Supabase secret keys are opaque API keys, not JWTs.
  const suppliedApiKey = req.headers.get('apikey') || '';
  try {
    const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
    authorized ||= !!suppliedApiKey && Object.values(secretKeys).some(key => typeof key === 'string' && key.length > 0 && key === suppliedApiKey);
  } catch { /* Missing modern keys must never authorize the request. */ }
  if (!authorized && token) {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey);
    const { data: { user }, error } = await admin.auth.getUser(token);
    if (!error && user) {
      const { data: role } = await admin.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
      authorized = !!role;
    }
  }
  if (!authorized) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
  if (!Deno.env.get('OPENAI_API_KEY')?.trim()) return new Response(JSON.stringify({ ok: false, error: 'OPENAI_API_KEY missing' }), { status: 503, headers });
  try {
    const response = await openAIRequest('models', { method: 'GET' });
    if (!response.ok) return new Response(JSON.stringify({ ok: false, provider_status: response.status }), { status: 502, headers });
    const data = await response.json();
    const ids = new Set((data.data || []).map((model: { id: string }) => model.id));
    const textAvailable = ids.has(textModel());
    const imageAvailable = ids.has(imageModel());
    return new Response(JSON.stringify({
      ok: textAvailable && imageAvailable,
      authentication: 'verified',
      text_model: textModel(), text_model_available: textAvailable,
      image_model: imageModel(), image_model_available: imageAvailable,
      generated_content: false,
      checks: [
        { name: 'Validar API key', ok: true, detail: 'Autenticação confirmada' },
        { name: 'Verificar modelo de texto', ok: textAvailable, detail: textModel() },
        { name: 'Verificar modelo de imagem (sem geração)', ok: imageAvailable, detail: imageModel() },
      ],
      ...(!textAvailable || !imageAvailable ? { error: 'Modelo configurado indisponível' } : {}),
    }), { headers });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Provider connection failed' }), { status: 502, headers });
  }
});
