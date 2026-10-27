import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { corsHeaders, json, IntegrationError } from "./integration-auth.ts";
export { corsHeaders, json, IntegrationError };
export function database() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export async function checked<T>(result: {
  data: T;
  error: unknown;
}): Promise<T> {
  if (result.error)
    throw new IntegrationError(
      "database_unavailable",
      503,
      "Não foi possível confirmar o registro no servidor.",
    );
  return result.data;
}
export async function config(db: ReturnType<typeof database>) {
  return (await checked(await db.rpc("sevenos_push_config"))) as Record<
    string,
    string
  >;
}
export async function userContext(req: Request) {
  const authorization = req.headers.get("Authorization") || "";
  if (!/^Bearer \S+$/.test(authorization))
    throw new IntegrationError(
      "unauthorized",
      401,
      "Entre novamente para continuar.",
    );
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    throw new IntegrationError(
      "unauthorized",
      401,
      "Entre novamente para continuar.",
    );
  return { user: data.user, client, db: database() };
}
export async function schedulerValid(
  body: Record<string, unknown>,
  secret: string,
) {
  if (
    !secret ||
    !["drain", "configure"].includes(String(body.action)) ||
    !/^\d{10}$/.test(String(body.timestamp)) ||
    Math.abs(Date.now() / 1000 - Number(body.timestamp)) > 90 ||
    !/^[a-f0-9]{64}$/.test(String(body.signature))
  )
    return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signature = Uint8Array.from(String(body.signature).match(/../g)!, (h) =>
    parseInt(h, 16),
  );
  return await crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    new TextEncoder().encode(
      `ajxsfjmcpolfgzpzpehl:${body.action}:${body.timestamp}`,
    ),
  );
}
