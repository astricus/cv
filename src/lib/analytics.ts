import type { PostHog } from "posthog-js";

// PostHog project key — public by design (it can only send events, not read them).
// Override with NEXT_PUBLIC_POSTHOG_KEY, or set it to "" to turn analytics off.
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "phc_mbSSYwgsb2jXLKnvezDnBj7nP8NZMw34yT42MrNwuCZa";
// proxied to https://eu.i.posthog.com by the rewrite in next.config.ts
const HOST = "/ingest";
const MAX_QUEUE = 50;

// PostHog (~120 KB gzipped) lives in its own chunk, outside the initial bundle. Its
// download starts right away (in parallel with the 3D scene) rather than when the
// browser is idle, so short visits on slow devices are still counted.
// Events fired before it arrives are queued and sent once it's ready.
let client: PostHog | null = null;
let queue: [string, Record<string, unknown>][] | null = null; // null = analytics off

/** Called once from instrumentation-client.ts. Production builds only, so local dev doesn't pollute the data. */
export function initAnalytics() {
  if (!KEY || process.env.NODE_ENV !== "production") return;
  queue = [];

  const load = () =>
    Promise.all([
      import("posthog-js"),
      // Web vitals code bundled with our chunk (registers itself on import), because
      // PostHog would otherwise fetch it from its CDN — which we disable below.
      // Must be the attribution variant: that's the one the SDK asks for by default.
      import("posthog-js/dist/web-vitals-with-attribution"),
    ])
      .then(([{ default: posthog }]) => {
        posthog.init(KEY, {
          api_host: HOST,
          ui_host: "https://eu.posthog.com",
          defaults: "2026-08-30",
          // no cookies, no local/session storage → no consent banner needed
          cookieless_mode: "always",
          person_profiles: "never",
          // only the initial load is a pageview; section changes are tracked as events
          capture_pageview: true,
          capture_pageleave: true,
          // Core Web Vitals (LCP, CLS, INP, FCP); no per-request network timing
          capture_performance: { web_vitals: true, network_timing: false },
          // explicit events only: no autocapture, replay, surveys, heatmaps or extra scripts
          autocapture: false,
          disable_session_recording: true,
          disable_surveys: true,
          capture_heatmaps: false,
          capture_dead_clicks: false,
          disable_external_dependency_loading: true,
        });
        client = posthog;
        for (const [event, props] of queue ?? []) posthog.capture(event, props);
        queue = [];
      })
      .catch(() => {
        // blocked by an ad blocker or offline: analytics must never break the site
        queue = null;
      });

  void load();
}

type Events = {
  section_opened: { section: string; source: "nav" | "planet" | "deep_link" };
  text_version_opened: { source: "button" | "deep_link" | "no_webgl" };
  cv_downloaded: { lang: string; location: LinkLocation };
  contact_clicked: { channel: string; location: LinkLocation };
};
export type LinkLocation = "header" | "panel" | "text_version";

export function track<E extends keyof Events>(event: E, props: Events[E]) {
  if (client) {
    try {
      client.capture(event, props);
    } catch {
      // ignore
    }
  } else if (queue && queue.length < MAX_QUEUE) {
    queue.push([event, props]);
  }
}

/** Classifies a content link for tracking: CV download, or a contact channel. */
export function trackLink(link: { href: string; download?: boolean }, location: LinkLocation) {
  if (link.download) {
    const lang = link.href.match(/_([A-Z]{2})\.pdf$/)?.[1]?.toLowerCase() ?? "unknown";
    track("cv_downloaded", { lang, location });
    return;
  }
  const channel = link.href.startsWith("mailto:")
    ? "email"
    : link.href.startsWith("tel:")
      ? "phone"
      : link.href.includes("linkedin.com")
        ? "linkedin"
        : link.href.includes("github.com")
          ? "github"
          : link.href;
  track("contact_clicked", { channel, location });
}
