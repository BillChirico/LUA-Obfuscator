import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				// Apply security headers to all routes
				source: "/:path*",
				headers: [
					{
						// Prevent clickjacking attacks
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						// Prevent MIME type sniffing
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						// Control referrer information
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						// Restrict browser features
						key: "Permissions-Policy",
						value: "accelerometer=(), camera=(), geolocation=(), microphone=(), payment=()",
					},
					{
						// Content Security Policy
						// Note: 'unsafe-eval' and 'unsafe-inline' required for Monaco Editor
						key: "Content-Security-Policy",
						value: [
							"default-src 'self'",
							"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://cdn.jsdelivr.net",
							"style-src 'self' 'unsafe-inline'",
							"img-src 'self' data: https:",
							"font-src 'self' data:",
							"connect-src 'self' https://www.google-analytics.com https://analytics.vercel.com https://vitals.vercel-insights.com",
							"frame-ancestors 'none'",
							"base-uri 'self'",
							"form-action 'self'",
						].join("; "),
					},
				],
			},
		];
	},
};

export default nextConfig;
