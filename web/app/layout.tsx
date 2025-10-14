import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lua-obfuscator-sable.vercel.app";

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
		"Free online Lua obfuscator and code protection tool. Protect your Lua scripts with variable name mangling, string encoding, number obfuscation, control flow protection, and code minification. Supports Lua 5.1, 5.2, 5.3, and 5.4. No registration required, works in your browser.",
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
		"lua string encoding",
		"lua number encoding",
		"lua control flow obfuscation",
		"browser based lua obfuscator",
		"client side lua obfuscation",
		"lua intellectual property protection",
		"lua code encryption",
		"lua script obfuscator",
		"roblox lua obfuscator",
		"fivem lua obfuscator",
		"gmod lua obfuscator",
		"wow lua obfuscator",
		"world of warcraft lua obfuscator",
		"lua game script protection",
		"lua addon obfuscator",
		"lua reverse engineering protection",
		"lua deobfuscation protection",
		"secure lua code",
		"hide lua source code",
		"lua code beautifier reverse",
	],
	authors: [{ name: "Bill Chirico" }],
	creator: "Bill Chirico",
	publisher: "Bill Chirico",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: siteUrl,
		title: "Bill's Lua Obfuscator - Professional Lua Code Protection & Security",
		description:
			"Free online Lua obfuscator with variable name mangling, string encoding, number obfuscation, and control flow protection. Supports Lua 5.1-5.4. Protect your Lua scripts instantly in your browser - no registration required.",
		siteName: "Bill's Lua Obfuscator",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Bill's Lua Obfuscator - Free Online Lua Code Protection Tool with Multiple Obfuscation Techniques",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Bill's Lua Obfuscator - Professional Lua Code Protection & Security",
		description:
			"Free online Lua obfuscator with advanced protection techniques. Supports Lua 5.1-5.4. Protect your scripts instantly in your browser - no registration required.",
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
				<GoogleAnalytics />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "SoftwareApplication",
							name: "Bill's Lua Obfuscator",
							applicationCategory: "DeveloperApplication",
							operatingSystem: "Any",
							description:
								"Free online Lua obfuscator and code protection tool. Protect your Lua scripts with variable name mangling, string encoding, number encoding, control flow obfuscation, and code minification. Supports Lua 5.1, 5.2, 5.3, and 5.4.",
							url: siteUrl,
							screenshot: `${siteUrl}/screenshot-wide.png`,
							offers: {
								"@type": "Offer",
								price: "0",
								priceCurrency: "USD",
								availability: "https://schema.org/InStock",
							},
							featureList: [
								"Variable and function name mangling with hexadecimal identifiers",
								"String encoding using byte arrays",
								"Number encoding with mathematical expressions",
								"Control flow obfuscation with opaque predicates",
								"Code minification and whitespace removal",
								"Real-time browser-based obfuscation",
								"Support for Lua 5.1, 5.2, 5.3, and 5.4",
								"Configurable protection levels (0-100%)",
								"Free online tool with no registration required",
								"Monaco code editor with Lua syntax highlighting",
								"Download obfuscated code as .lua file",
								"Copy to clipboard functionality",
							],
							browserRequirements: "Requires JavaScript. Requires HTML5.",
							softwareVersion: "1.0.0",
							softwareHelp: {
								"@type": "WebPage",
								url: siteUrl,
							},
							author: {
								"@type": "Person",
								name: "Bill Chirico",
								url: "https://github.com/BillChirico",
							},
							creator: {
								"@type": "Person",
								name: "Bill Chirico",
								url: "https://github.com/BillChirico",
							},
							provider: {
								"@type": "Organization",
								name: "Bill's Lua Obfuscator",
								url: siteUrl,
								logo: {
									"@type": "ImageObject",
									url: `${siteUrl}/icon-512.png`,
									width: 512,
									height: 512,
								},
							},
							keywords:
								"lua obfuscator, lua code protection, obfuscate lua, lua minifier, lua security, protect lua code, lua code obfuscation, free lua obfuscator, online lua obfuscator, lua script protection, lua variable mangling, lua code minification",
						}),
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "FAQPage",
							mainEntity: [
								{
									"@type": "Question",
									name: "What is Lua code obfuscation?",
									acceptedAnswer: {
										"@type": "Answer",
										text: "Lua code obfuscation is the process of transforming readable Lua source code into functionally equivalent but harder-to-read code. This protects your intellectual property by making it difficult for others to understand, reverse-engineer, or steal your code logic. Bill's Lua Obfuscator uses multiple techniques including variable name mangling, string encoding, number encoding, and control flow obfuscation.",
									},
								},
								{
									"@type": "Question",
									name: "Which Lua versions are supported?",
									acceptedAnswer: {
										"@type": "Answer",
										text: "Bill's Lua Obfuscator supports Lua 5.1, 5.2, 5.3, and 5.4. The tool automatically detects and handles syntax differences between versions, ensuring your obfuscated code remains compatible with your target Lua runtime environment.",
									},
								},
								{
									"@type": "Question",
									name: "Is the obfuscated code slower than the original?",
									acceptedAnswer: {
										"@type": "Answer",
										text: "Heavy obfuscation can introduce some performance overhead due to additional function calls and mathematical expressions. However, the impact is typically minimal for most applications. You can use the Protection Level slider to balance security with performance - lower protection levels (0-40%) have negligible performance impact, while maximum protection (80-100%) provides strongest security with moderate overhead.",
									},
								},
								{
									"@type": "Question",
									name: "Can obfuscated Lua code be reversed?",
									acceptedAnswer: {
										"@type": "Answer",
										text: "While no obfuscation is completely irreversible, Bill's Lua Obfuscator makes reverse engineering significantly more difficult by combining multiple protection techniques. Variable name mangling removes meaningful identifiers, string encoding obscures text literals, number encoding hides numeric values, and control flow obfuscation adds complexity that makes manual analysis time-consuming. The higher the protection level, the more difficult it is to reverse.",
									},
								},
								{
									"@type": "Question",
									name: "Is Bill's Lua Obfuscator free to use?",
									acceptedAnswer: {
										"@type": "Answer",
										text: "Yes, Bill's Lua Obfuscator is completely free to use with no registration, account creation, or payment required. All obfuscation happens in your browser, so your code never leaves your device. You can obfuscate unlimited Lua scripts at any protection level.",
									},
								},
								{
									"@type": "Question",
									name: "What obfuscation techniques are available?",
									acceptedAnswer: {
										"@type": "Answer",
										text: "Bill's Lua Obfuscator provides five main obfuscation techniques: (1) Variable Name Mangling - replaces identifiers with hexadecimal names, (2) String Encoding - converts strings to byte arrays using string.char(), (3) Number Encoding - transforms numbers into mathematical expressions, (4) Control Flow Obfuscation - adds opaque predicates to complicate analysis, and (5) Code Minification - removes comments and whitespace. You can enable techniques individually or use the Protection Level slider for automatic presets.",
									},
								},
							],
						}),
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "HowTo",
							name: "How to Obfuscate Lua Code",
							description: "Step-by-step guide to protecting your Lua scripts with Bill's Lua Obfuscator",
							totalTime: "PT2M",
							step: [
								{
									"@type": "HowToStep",
									name: "Paste your Lua code",
									text: "Copy your Lua source code and paste it into the left editor panel labeled 'Original Lua Code'. The Monaco editor provides syntax highlighting for easy reading.",
									position: 1,
								},
								{
									"@type": "HowToStep",
									name: "Configure obfuscation settings",
									text: "Use the settings panel on the right to configure protection techniques. You can toggle individual techniques (Mangle Names, Encode Strings, Encode Numbers, Control Flow, Minify) or use the Protection Level slider for automatic presets from 0% (no obfuscation) to 100% (maximum protection).",
									position: 2,
								},
								{
									"@type": "HowToStep",
									name: "Click Obfuscate",
									text: "Click the blue 'Obfuscate' button to process your code. The obfuscation happens instantly in your browser - your code never leaves your device.",
									position: 3,
								},
								{
									"@type": "HowToStep",
									name: "Copy or download the result",
									text: "Your obfuscated code appears in the right editor panel labeled 'Obfuscated Output'. Click 'Copy' to copy to clipboard or 'Download' to save as a .lua file. The obfuscated code is functionally identical to your original but much harder to read and reverse-engineer.",
									position: 4,
								},
							],
						}),
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "BreadcrumbList",
							itemListElement: [
								{
									"@type": "ListItem",
									position: 1,
									name: "Home",
									item: siteUrl,
								},
								{
									"@type": "ListItem",
									position: 2,
									name: "Lua Obfuscator",
									item: siteUrl,
								},
							],
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
