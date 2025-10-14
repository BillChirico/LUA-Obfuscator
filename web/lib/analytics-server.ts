/**
 * Server-side Google Analytics 4 Measurement Protocol
 *
 * SECURITY NOTE: This file runs ONLY on the server.
 * Never import this in client-side code.
 * The API secret must never be exposed to clients.
 */

import { randomUUID } from "crypto";

// GA4 Measurement Protocol endpoint
const GA4_ENDPOINT = "https://www.google-analytics.com/mp/collect";

// Configuration from environment variables
const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const API_SECRET = process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET;

/**
 * GA4 Event Parameters
 * Define custom parameters for your events
 */
export interface GA4EventParams {
	// Standard e-commerce parameters
	value?: number;
	currency?: string;

	// Custom parameters for Lua Obfuscator
	obfuscation_type?: "mangle" | "encode" | "minify" | "mangle_encode" | "full";
	code_size?: number;
	protection_level?: number;

	// Generic custom parameters
	[key: string]: string | number | boolean | undefined;
}

/**
 * GA4 Event structure
 */
export interface GA4Event {
	name: string;
	params?: GA4EventParams;
}

/**
 * GA4 Measurement Protocol payload
 */
interface GA4Payload {
	client_id: string;
	user_id?: string;
	timestamp_micros?: number;
	user_properties?: Record<string, { value: string | number | boolean }>;
	events: GA4Event[];
}

/**
 * Send event to GA4 using Measurement Protocol
 *
 * @param clientId - Unique client identifier (can be from cookie or generated)
 * @param events - Array of events to send
 * @param userId - Optional user identifier for logged-in users
 * @returns Promise with success status
 *
 * @example
 * ```typescript
 * await sendGA4Event(
 *   "client_id_123",
 *   [{
 *     name: "obfuscate_code",
 *     params: {
 *       obfuscation_type: "mangle",
 *       code_size: 1024,
 *       protection_level: 75
 *     }
 *   }]
 * );
 * ```
 */
export async function sendGA4Event(
	clientId: string,
	events: GA4Event[],
	userId?: string
): Promise<{ success: boolean; error?: string }> {
	// Validate configuration
	if (!MEASUREMENT_ID || !API_SECRET) {
		console.error("[GA4] Missing configuration: MEASUREMENT_ID or API_SECRET");
		return {
			success: false,
			error: "GA4 configuration missing",
		};
	}

	// Build payload
	const payload: GA4Payload = {
		client_id: clientId,
		events: events.map(event => ({
			name: event.name,
			params: {
				...event.params,
				// Add engagement time for better reporting
				engagement_time_msec: event.params?.engagement_time_msec || 100,
			},
		})),
	};

	// Add optional user ID
	if (userId) {
		payload.user_id = userId;
	}

	// Add timestamp
	payload.timestamp_micros = Date.now() * 1000;

	try {
		const url = `${GA4_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("[GA4] Failed to send event:", response.status, errorText);
			return {
				success: false,
				error: `HTTP ${response.status}: ${errorText}`,
			};
		}

		return { success: true };
	} catch (error) {
		console.error("[GA4] Error sending event:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Generate a unique client ID for tracking
 * Use this if you don't have a client ID from cookies
 */
export function generateClientId(): string {
	return randomUUID();
}

/**
 * Helper function to track obfuscation events
 *
 * @example
 * ```typescript
 * await trackObfuscation({
 *   clientId: "client_123",
 *   obfuscationType: "mangle",
 *   codeSize: 1024,
 *   protectionLevel: 75
 * });
 * ```
 */
export async function trackObfuscation(params: {
	clientId: string;
	obfuscationType: "mangle" | "encode" | "minify" | "mangle_encode" | "full";
	codeSize: number;
	protectionLevel: number;
	userId?: string;
}): Promise<{ success: boolean; error?: string }> {
	return sendGA4Event(
		params.clientId,
		[
			{
				name: "obfuscate_code",
				params: {
					obfuscation_type: params.obfuscationType,
					code_size: params.codeSize,
					protection_level: params.protectionLevel,
				},
			},
		],
		params.userId
	);
}

/**
 * Helper function to track code downloads
 */
export async function trackDownload(params: {
	clientId: string;
	codeSize: number;
	userId?: string;
}): Promise<{ success: boolean; error?: string }> {
	return sendGA4Event(
		params.clientId,
		[
			{
				name: "download_obfuscated_code",
				params: {
					code_size: params.codeSize,
				},
			},
		],
		params.userId
	);
}

/**
 * Helper function to track code copy events
 */
export async function trackCopy(params: {
	clientId: string;
	codeSize: number;
	userId?: string;
}): Promise<{ success: boolean; error?: string }> {
	return sendGA4Event(
		params.clientId,
		[
			{
				name: "copy_obfuscated_code",
				params: {
					code_size: params.codeSize,
				},
			},
		],
		params.userId
	);
}
