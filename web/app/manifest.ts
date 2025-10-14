import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Lua Obfuscator - Professional Code Protection",
		short_name: "Lua Obfuscator",
		description: "Free online Lua obfuscator and code protection tool with variable name mangling and minification.",
		start_url: "/",
		display: "standalone",
		background_color: "#0f172a",
		theme_color: "#007AFF",
		orientation: "portrait-primary",
		categories: ["developer tools", "utilities", "productivity"],
		icons: [
			{
				src: "/icon-192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/icon-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
		screenshots: [
			{
				src: "/screenshot-wide.png",
				sizes: "1280x720",
				type: "image/png",
				form_factor: "wide",
			},
			{
				src: "/screenshot-mobile.png",
				sizes: "750x1334",
				type: "image/png",
				form_factor: "narrow",
			},
		],
	};
}
