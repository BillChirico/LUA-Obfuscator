import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://luaobfuscator.com";

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	themeColor: "#007AFF",
};

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: "Bill's Lua Obfuscator - Lua Code Protection & Minification",
		template: "%s | Lua Obfuscator",
	},
	description:
		"Free online Lua obfuscator and code protection tool. Protect your Lua scripts with variable name mangling, code minification, and advanced obfuscation techniques. Supports Lua 5.1, 5.2, 5.3, and 5.4.",
	keywords: [
		"lua obfuscator",
		"lua code protection",
		"obfuscate lua",
		"lua minifier",
		"lua security",
		"protect lua code",
		"lua code obfuscation",
		"free lua obfuscator",
		"online lua obfuscator",
		"lua script protection",
		"lua variable mangling",
		"lua code minification",
		"lua 5.1 obfuscator",
		"lua 5.2 obfuscator",
		"lua 5.3 obfuscator",
		"lua 5.4 obfuscator",
	],
	authors: [{ name: "Bill Chirico" }],
	creator: "Bill Chirico",
	publisher: "Lua Obfuscator",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: siteUrl,
		title: "Lua Obfuscator - Professional Lua Code Protection",
		description:
			"Free online Lua obfuscator with variable name mangling and code minification. Protect your Lua scripts instantly.",
		siteName: "Lua Obfuscator",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Lua Obfuscator - Protect Your Lua Code",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Lua Obfuscator - Professional Lua Code Protection",
		description:
			"Free online Lua obfuscator with variable name mangling and code minification. Protect your Lua scripts instantly.",
		images: ["/og-image.png"],
		creator: "@billchirico",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icon.png", type: "image/png", sizes: "32x32" },
		],
		apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
	},
	manifest: "/manifest.json",
	category: "technology",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="dark">
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "WebApplication",
							name: "Lua Obfuscator",
							description: "Professional Lua code protection and obfuscation tool",
							url: siteUrl,
							applicationCategory: "DeveloperApplication",
							operatingSystem: "Any",
							offers: {
								"@type": "Offer",
								price: "0",
								priceCurrency: "USD",
							},
							featureList: [
								"Variable name mangling",
								"Code minification",
								"Real-time obfuscation",
								"Support for Lua 5.1-5.4",
								"Free online tool",
							],
							browserRequirements: "Requires JavaScript. Requires HTML5.",
							softwareVersion: "1.0.0",
							author: {
								"@type": "Person",
								name: "Bill Chirico",
							},
							provider: {
								"@type": "Organization",
								name: "Lua Obfuscator",
								url: siteUrl,
							},
						}),
					}}
				/>
			</head>
			<body className="dark">
				{children}
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
