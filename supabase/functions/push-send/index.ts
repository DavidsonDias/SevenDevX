import webpush from "npm:web-push@3.6.7";
import { requestBody, failure } from "../_shared/integration-auth.ts";
import {
  database,
  config,
  checked,
  userContext,
  schedulerValid,
  corsHeaders,
  json,
  IntegrationError,
} from "../_shared/push-runtime.ts";
import { validPushEndpoint } from "../_shared/push-policy.ts";
import { retryDecision } from "../_shared/push-policy.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  try {
    const body = await requestBody(req),
      db = database();
    let cfg = await config(db);
    const internal = await schedulerValid(body, cfg.sevenos_push_scheduler_v1);
    let onlyUser: string | null = null,
      onlyNotification: string | null = null;
    if (internal && body.action === "configure") {
      if (!cfg.sevenos_vapid_private_v1) {
        const pair = webpush.generateVAPIDKeys();
        await checked(
          await db.rpc("sevenos_push_initialize", {
            _public: pair.publicKey,
            _private: pair.privateKey,
          }),
        );
        cfg = await config(db);
      }
      return json({ ok: true, configured: !!cfg.sevenos_vapid_public_v1 });
    }
    if (!internal) {
      const { user, client } = await userContext(req);
      onlyUser = user.id;
      const role = await client.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (role.error || role.data !== true)
        throw new IntegrationError(
          "forbidden",
          403,
          "Acesso administrativo necessário.",
        );
      if(!cfg.sevenos_vapid_public_v1 || !cfg.sevenos_vapid_private_v1)throw new IntegrationError("vapid_missing",503,"As chaves VAPID exclusivas da SevenDevX ainda não foram configuradas.");
      if (body.action !== "test" || typeof body.subscriptionId !== "string")
        throw new IntegrationError(
          "self_test_only",
          403,
          "Somente teste da própria conta é permitido.",
        );
      const sub = await checked(
        await db
          .from("push_subscriptions")
          .select("id")
          .eq("id", body.subscriptionId)
          .eq("user_id", user.id)
          .eq("enabled", true)
          .maybeSingle(),
      );
      if (!sub)
        throw new IntegrationError(
          "not_registered",
          409,
          "Ative este dispositivo e confirme o registro no servidor antes do teste.",
        );
      // Serialize self-tests per user, rate-limit and deduplicate in the database.
      onlyNotification = await checked(
        await db.rpc("sevenos_push_self_test", {
          _user: user.id,
          _subscription: sub.id,
          _request: body.requestId,
        }),
      );
    }
    if (!cfg.sevenos_vapid_public_v1 || !cfg.sevenos_vapid_private_v1)
      throw new IntegrationError(
        "vapid_missing",
        503,
        "As chaves VAPID exclusivas da SevenDevX ainda não foram configuradas.",
      );
    webpush.setVapidDetails(
      "mailto:contato@sevendevx.com",
      cfg.sevenos_vapid_public_v1,
      cfg.sevenos_vapid_private_v1,
    );
    const jobs = await checked(
      await db.rpc("sevenos_claim_push", {
        _only_user: onlyUser,
        _only_notification: onlyNotification,
      }),
    );
    let accepted = 0,
      failed = 0;
    for (const job of jobs ?? []) {
      const sub = await checked(
        await db
          .from("push_subscriptions")
          .select("id,user_id,endpoint,p256dh,auth,enabled,vapid_public_key")
          .eq(
            "id",
            job.subscription_id ?? "00000000-0000-0000-0000-000000000000",
          )
          .maybeSingle(),
      );
      const notice = await checked(
        await db
          .from("notifications")
          .select("id,type,user_id")
          .eq("id", job.notification_id)
          .maybeSingle(),
      );
      const membership = await checked(await db.from("user_roles").select("user_id").eq("user_id",job.user_id).eq("role","admin").maybeSingle());
      const pref = notice
        ? await checked(
            await db
              .from("notification_preferences")
              .select("enabled")
              .eq("user_id", job.user_id)
              .eq("event_type", notice.type)
              .eq("channel", "push")
              .maybeSingle(),
          )
        : null;
      if (
        !membership ||
        !sub ||
        !notice ||
        sub.user_id !== job.user_id ||
        notice.user_id !== job.user_id ||
        !sub.enabled ||
        pref?.enabled === false ||
        sub.vapid_public_key !== cfg.sevenos_vapid_public_v1 ||
        !validPushEndpoint(sub.endpoint)
      ) {
        await checked(
          await db
            .from("push_delivery_jobs")
            .update({
              state: "cancelled",
              error_code: "subscription_or_preference_changed",
            })
            .eq("id", job.id)
            .eq("state", "processing"),
        );
        continue;
      }
      try {
        // Lockscreen never contains contact names, messages, security details or project data.
        const payload = JSON.stringify({
          title: "SevenDevX · SevenOS",
          body: "Você tem uma nova atualização. Abra o sistema para consultar.",
          notificationId: notice.id,
          deliveryId: job.id,
          receiptToken: job.receipt_token,
          url: `/admin/notifications/open/${notice.id}`,
        });
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
          { TTL: 3600, timeout: 5000, urgency: "normal" },
        );
        await checked(await db.rpc("sevenos_push_accepted", {_id:job.id}));
        accepted++;
      } catch (e) {
        const status = Number((e as { statusCode?: number }).statusCode) || 0;
        const decision = retryDecision(status, job.attempts);
        failed++;
        await checked(
          await db
            .from("push_delivery_jobs")
            .update({
              state: decision.state,
              error_code: decision.code,
              next_attempt_at: new Date(
                Date.now() + Math.min(900000, 60000 * 2 ** job.attempts),
              ).toISOString(),
            })
            .eq("id", job.id)
            .eq("state", "processing"),
        );
        if (status === 404 || status === 410)
          await checked(
            await db
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id)
              .eq("user_id", job.user_id),
          );
        console.warn(
          JSON.stringify({
            component: "sevenos_push",
            delivery: job.id,
            code: decision.code,
          }),
        );
      }
    }
    return json({
      ok: true,
      notificationId: onlyNotification,
      accepted,
      failed,
      meaning: "accepted_by_push_service_not_device_receipt",
    });
  } catch (e) {
    return failure(e);
  }
});
