import Script from "next/script";

const GA_MEASUREMENT_ID = "G-QXE3NC1W1V";

/**
 * Google Analytics component for tracking page views and events
 * Implements GA4 with optimal Next.js Script loading strategy
 */
export function GoogleAnalytics() {
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
