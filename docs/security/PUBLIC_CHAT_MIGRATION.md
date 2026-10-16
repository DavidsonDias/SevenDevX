# Public chat migration security

The public chat uses the current Supabase Edge Function and OpenAI adapter. The original company system prompt and model/output limit are retained.

- A publishable project key routes public requests; it does not identify a person.
- The server issues a random 256-bit conversation capability and stores only its SHA256 in the unexposed migration_chat schema. The browser keeps it in component memory, never localStorage. Existing historical conversations receive no new public access.
- Capabilities expire after24 hours. Reloading starts a new conversation; visitorId is informational and never authorizes access.
- The service-only SECURITY INVOKER RPC atomically reserves at most100 requests per UTC day,10 per UTC minute and20 per conversation per UTC hour. These limits are server-controlled constants. Failed provider requests still consume a reservation. Transactional quota refusals roll back every counter change and new conversation.
- This bounds request volume and output to1024 tokens per successful call; it is not a currency spending limit or an identity/CAPTCHA solution. An attacker can exhaust shared availability. Keep provider project spending controls enabled and review capacity before changing constants.
- User/assistant inputs only; caller system/tool roles, oversized bodies and invalid histories are refused. No caller-selected model.
- Provider billing failures return503 without automatic retry. Actual generation remains unverified while the provider reports credit_balance_exhausted.
- Console logs exclude prompts, response text, service credentials and conversation capabilities. Responses are no-store; only the initiating caller receives the capability in an exposed response header over HTTPS.
- The private tables contain operational capabilities/counters, not the historical chat messages. Current application exports cover public tables and exclude this private schema. Disaster recovery must preserve its schema; missing capabilities invalidate old public sessions. Do not treat the application export as a full Auth/Storage/private-schema recovery backup.

Validation: handler and real-client-function regression tests, native Deno check, transactional PostgreSQL limits/ownership checks, and an admin-protected isolated Edge diagnostic using a clearly labelled fixed provider stub. The stub never runs in production. No genuine OpenAI inference is claimed by these tests.
