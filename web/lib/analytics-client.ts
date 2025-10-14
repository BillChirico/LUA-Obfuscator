/**
 * Client-side Google Analytics utilities
 *
 * This file provides helpers for tracking events from the browser.
 * It uses both client-side gtag and server-side Measurement Protocol.
 */

import { type GA4Event } from "./analytics-server";

/**
 * Get or generate a client ID for GA4 tracking
 * Stores in localStorage for persistence across sessions
 */
export function getClientId(): string {
	if (typeof window === "undefined") {
		return ""; // Server-side rendering
	}

	const STORAGE_KEY = "ga_client_id";

	// Try to get existing client ID
	let clientId = localStorage.getItem(STORAGE_KEY);

	// Generate new one if doesn't exist
	if (!clientId) {
		clientId = `${Date.now()}.${Math.random().toString(36).substring(2, 15)}`;
		localStorage.setItem(STORAGE_KEY, clientId);
	}

	return clientId;
}

/**
 * Track event using server-side Measurement Protocol
 * This ensures the API secret stays secure on the server
 *
 * @param events - Array of GA4 events to track
 * @param userId - Optional user ID for logged-in users
 *
 * @example
 * ```typescript
 * await trackEvent([{
 *   name: 'obfuscate_code',
 *   params: {
 *     obfuscation_type: 'mangle',
 *     code_size: 1024,
 *     protection_level: 75
 *   }
 * }]);
 * ```
 */
export async function trackEvent(events: GA4Event[], userId?: string): Promise<{ success: boolean; error?: string }> {
	try {
		const clientId = getClientId();

		const response = await fetch("/api/analytics/track", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				clientId,
				events,
				userId,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			console.error("[Analytics] Failed to track event:", error);
			return { success: false, error: error.error };
		}

		return { success: true };
	} catch (error) {
		console.error("[Analytics] Error tracking event:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Track obfuscation event
 * Convenience wrapper for common obfuscation tracking
 */
export async function trackObfuscation(params: {
	obfuscationType: "mangle" | "encode" | "minify" | "mangle_encode" | "full";
	codeSize: number;
	protectionLevel: number;
}): Promise<void> {
	await trackEvent([
		{
			name: "obfuscate_code",
			params: {
				obfuscation_type: params.obfuscationType,
				code_size: params.codeSize,
				protection_level: params.protectionLevel,
			},
		},
	]);
}

/**
 * Track code download event
 */
export async function trackDownload(codeSize: number): Promise<void> {
	await trackEvent([
		{
			name: "download_obfuscated_code",
			params: {
				code_size: codeSize,
			},
		},
	]);
}

/**
 * Track code copy event
 */
export async function trackCopy(codeSize: number): Promise<void> {
	await trackEvent([
		{
			name: "copy_obfuscated_code",
			params: {
				code_size: codeSize,
			},
		},
	]);
}

/**
 * Track settings change event
 */
export async function trackSettingsChange(params: {
	setting: string;
	value: string | number | boolean;
}): Promise<void> {
	await trackEvent([
		{
			name: "change_settings",
			params: {
				setting_name: params.setting,
				setting_value: String(params.value),
			},
		},
	]);
}

/**
 * Track error event
 */
export async function trackError(params: { errorType: string; errorMessage?: string }): Promise<void> {
	await trackEvent([
		{
			name: "obfuscation_error",
			params: {
				error_type: params.errorType,
				error_message: params.errorMessage,
			},
		},
	]);
}
