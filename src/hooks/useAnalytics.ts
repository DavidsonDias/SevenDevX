/**
 * 📊 useAnalytics - Hook para tracking de analytics
 * SevenDevX Enterprise Edition
 */

import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

const ANALYTICS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-analytics`;

// Get or create visitor ID
const getVisitorId = (): string => {
  let id = localStorage.getItem("sevendevx_visitor_id");
  if (!id) {
    id = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("sevendevx_visitor_id", id);
  }
  return id;
};

// Get or create session ID
const getSessionId = (): string => {
  let id = sessionStorage.getItem("sevendevx_session_id");
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("sevendevx_session_id", id);
  }
  return id;
};

interface TrackEventOptions {
  event_type: string;
  event_data?: Record<string, unknown>;
}

export const useAnalytics = () => {
  const location = useLocation();
  const pageLoadTime = useRef<number>(Date.now());
  const lastPath = useRef<string>("");

  // Track page view
  const trackPageView = useCallback(async (path: string, title?: string) => {
    // Calculate duration on previous page
    const duration = lastPath.current 
      ? Math.round((Date.now() - pageLoadTime.current) / 1000)
      : undefined;

    try {
      await fetch(ANALYTICS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: "pageview",
          page_path: path,
          page_title: title || document.title,
          referrer: document.referrer,
          visitor_id: getVisitorId(),
          session_id: getSessionId(),
          duration_seconds: duration,
        }),
      });
    } catch (error) {
      console.warn("Analytics pageview failed:", error);
    }

    // Reset timer
    pageLoadTime.current = Date.now();
    lastPath.current = path;
  }, []);

  // Track custom event
  const trackEvent = useCallback(async ({ event_type, event_data }: TrackEventOptions) => {
    try {
      await fetch(ANALYTICS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: "event",
          event_type,
          event_data: event_data || {},
          page_url: window.location.href,
          visitor_id: getVisitorId(),
          session_id: getSessionId(),
        }),
      });
    } catch (error) {
      console.warn("Analytics event failed:", error);
    }
  }, []);

  // Auto-track page views on route change
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname, trackPageView]);

  // Track page exit
  useEffect(() => {
    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - pageLoadTime.current) / 1000);
      
      // Use sendBeacon for reliable delivery on page exit
      navigator.sendBeacon?.(
        ANALYTICS_URL,
        JSON.stringify({
          type: "event",
          event_type: "page_exit",
          event_data: { 
            page_path: location.pathname,
            duration_seconds: duration 
          },
          page_url: window.location.href,
          visitor_id: getVisitorId(),
          session_id: getSessionId(),
        })
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [location.pathname]);

  return {
    trackEvent,
    trackPageView,
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
  };
};

export default useAnalytics;
