/**
 * 📊 Analytics Tracking Edge Function - SevenDevX Enterprise
 * Coleta page views e eventos de analytics
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const userAgent = req.headers.get("user-agent") || "";

    console.log(`[Analytics] Tracking ${payload.type} - Visitor: ${payload.visitor_id}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (payload.type === "pageview") {
      const { error } = await supabase.from("page_views").insert({
        page_path: payload.page_path,
        page_title: payload.page_title,
        visitor_id: payload.visitor_id,
        session_id: payload.session_id,
        referrer: payload.referrer,
        user_agent: userAgent,
        device_type: getDeviceType(userAgent),
        duration_seconds: payload.duration_seconds,
      });

      if (error) {
        console.error("[Analytics] Page view insert error:", error);
        throw error;
      }

      console.log(`[Analytics] Page view recorded: ${payload.page_path}`);
    } else if (payload.type === "event") {
      const { error } = await supabase.from("analytics_events").insert({
        event_type: payload.event_type,
        event_data: payload.event_data || {},
        page_url: payload.page_url,
        visitor_id: payload.visitor_id,
        session_id: payload.session_id,
        user_agent: userAgent,
        referrer: req.headers.get("referer"),
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
