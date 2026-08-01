/**
 * 📊 Analytics Tracking Edge Function - SevenDevX Enterprise
 * Coleta page views e eventos de analytics
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface PageViewPayload {
  type: "pageview";
  page_path: string;
  page_title?: string;
  referrer?: string;
  visitor_id: string;
  session_id: string;
  duration_seconds?: number;
}

interface EventPayload {
  type: "event";
  event_type: string;
  event_data?: Record<string, unknown>;
  page_url?: string;
  visitor_id: string;
  session_id: string;
}

type AnalyticsPayload = PageViewPayload | EventPayload;

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet/i.test(userAgent)) return "tablet";
  return "desktop";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: AnalyticsPayload = await req.json();
    const userAgent = (req.headers.get("user-agent") || "").slice(0, 512);

    // Input validation
    if (!payload || (payload.type !== "pageview" && payload.type !== "event")) {
      return new Response(JSON.stringify({ error: "invalid type" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (typeof payload.visitor_id !== "string" || payload.visitor_id.length === 0 || payload.visitor_id.length > 64) {
      return new Response(JSON.stringify({ error: "invalid visitor_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (typeof payload.session_id !== "string" || payload.session_id.length === 0 || payload.session_id.length > 64) {
      return new Response(JSON.stringify({ error: "invalid session_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const trunc = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : undefined);


    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (payload.type === "pageview") {
      const duration = typeof payload.duration_seconds === "number" && payload.duration_seconds >= 0 && payload.duration_seconds < 86400
        ? Math.floor(payload.duration_seconds) : null;
      const { error } = await supabase.from("page_views").insert({
        page_path: trunc(payload.page_path, 512) ?? "/",
        page_title: trunc(payload.page_title, 256),
        visitor_id: payload.visitor_id,
        session_id: payload.session_id,
        referrer: trunc(payload.referrer, 512),
        user_agent: userAgent,
        device_type: getDeviceType(userAgent),
        duration_seconds: duration,
      });

      if (error) {
        console.error("[Analytics] Page view insert error:", error);
        throw error;
      }

      console.log(`[Analytics] Page view recorded`);
    } else if (payload.type === "event") {
      const eventData = payload.event_data && typeof payload.event_data === "object" && !Array.isArray(payload.event_data) ? payload.event_data : {};
      const dataStr = JSON.stringify(eventData);
      if (dataStr.length > 4096) {
        return new Response(JSON.stringify({ error: "event_data too large" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { error } = await supabase.from("analytics_events").insert({
        event_type: trunc(payload.event_type, 64) ?? "unknown",
        event_data: eventData,
        page_url: trunc(payload.page_url, 512),
        visitor_id: payload.visitor_id,
        session_id: payload.session_id,
        user_agent: userAgent,
        referrer: (req.headers.get("referer") || "").slice(0, 512) || null,
      });

      if (error) {
        console.error("[Analytics] Event insert error:", error);
        throw error;
      }

      console.log(`[Analytics] Event recorded: ${payload.event_type}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Analytics] Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to track analytics" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
