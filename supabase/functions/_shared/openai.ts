// Server-controlled models: client input cannot select a more expensive model.
export function textModel(): string {
  return Deno.env.get('OPENAI_TEXT_MODEL')?.trim() || 'gpt-4.1-mini';
}

export function imageModel(): string {
  return Deno.env.get('OPENAI_IMAGE_MODEL')?.trim() || 'gpt-image-1.5';
}

export async function openAIRequest(
  path: 'chat/completions' | 'images/generations' | 'models',
  init: RequestInit = {},
): Promise<Response> {
  const key = Deno.env.get('OPENAI_API_KEY')?.trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured');
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${key}`);
  headers.set('Content-Type', 'application/json');
  return fetch(`https://api.openai.com/v1/${path}`, {
    ...init,
    headers,
    signal: init.signal ?? AbortSignal.timeout(path === 'images/generations' ? 150000 : 60000),
  });
}
