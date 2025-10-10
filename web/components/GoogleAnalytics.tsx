import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Google Analytics component for tracking page views and events
 * Implements GA4 with optimal Next.js Script loading strategy
 *
 * Configuration:
 * - Client-side tracking: NEXT_PUBLIC_GA_MEASUREMENT_ID
 * - Server-side tracking: GA_MEASUREMENT_PROTOCOL_API_SECRET
 */
export function GoogleAnalytics() {
  // Don't render if measurement ID is not configured
  if (!GA_MEASUREMENT_ID) {
    console.warn("[GA] NEXT_PUBLIC_GA_MEASUREMENT_ID not configured");
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />

      {/* Google Analytics Initialization */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
