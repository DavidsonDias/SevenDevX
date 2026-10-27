import {
  database,
  checked,
  json,
  corsHeaders,
  IntegrationError,
} from "../_shared/push-runtime.ts";
import { requestBody, failure } from "../_shared/integration-auth.ts";
Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  try {
    const b = await requestBody(req),
      uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (!uuid.test(String(b.id)) || !uuid.test(String(b.token)))
      throw new IntegrationError(
        "invalid_receipt",
        400,
        "Comprovante inválido.",
      );
    const ok = await checked(
      await database().rpc("sevenos_push_receipt", {
        _id: b.id,
        _token: b.token,
        _clicked: b.clicked === true,
      }),
    );
    return json({ ok }, ok ? 200 : 404);
  } catch (e) {
    return failure(e);
  }
});
