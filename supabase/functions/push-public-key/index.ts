import {
  database,
  config,
  json,
  corsHeaders,
} from "../_shared/push-runtime.ts";
import { failure } from "../_shared/integration-auth.ts";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);
  try {
    const cfg = await config(database());
    return json({
      publicKey: cfg.sevenos_vapid_public_v1 || "",
      configured: !!(
        cfg.sevenos_vapid_public_v1 && cfg.sevenos_vapid_private_v1
      ),
      keySource: "SevenDevX Vault v1",
    });
  } catch (e) {
    return failure(e);
  }
});
