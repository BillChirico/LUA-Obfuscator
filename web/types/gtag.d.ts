/**
 * TypeScript declarations for Google Analytics gtag.js
 * Provides type safety for GA4 tracking functions
 */

type GtagCommand = "config" | "set" | "event" | "consent";

interface GtagConfigParams {
	page_path?: string;
	page_title?: string;
	page_location?: string;
	send_page_view?: boolean;
	[key: string]: any;
}

interface GtagEventParams {
	event_category?: string;
	event_label?: string;
	value?: number;
	[key: string]: any;
}

declare global {
	interface Window {
		dataLayer: any[];
		gtag: (command: GtagCommand, targetId: string | Date, params?: GtagConfigParams | GtagEventParams | any) => void;
	}
}

export {};
