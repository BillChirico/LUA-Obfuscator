import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lua-obfuscator-sable.vercel.app";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/api/", "/_next/"],
			},
		],
		sitemap: `${siteUrl}/sitemap.xml`,
	};
}
