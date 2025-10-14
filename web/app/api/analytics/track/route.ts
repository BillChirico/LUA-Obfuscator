/**
 * API Route for server-side analytics tracking
 * POST /api/analytics/track
 *
 * This route receives events from the client and sends them to GA4
 * using the Measurement Protocol with the API secret (server-side only).
 */

import { NextRequest, NextResponse } from "next/server";
import { sendGA4Event, type GA4Event } from "@/lib/analytics-server";
import { headers } from "next/headers";

/**
 * Request body interface
 */
interface TrackEventRequest {
	clientId: string;
	events: GA4Event[];
	userId?: string;
}

/**
 * POST handler for tracking events
 *
 * @example Client-side usage:
 * ```typescript
 * const response = await fetch('/api/analytics/track', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     clientId: getClientId(), // Get from cookie or generate
 *     events: [{
 *       name: 'obfuscate_code',
 *       params: {
 *         obfuscation_type: 'mangle',
 *         code_size: 1024,
 *         protection_level: 75
 *       }
 *     }]
 *   })
 * });
 * ```
 */
export async function POST(request: NextRequest) {
	try {
		// Parse request body
		const body: TrackEventRequest = await request.json();

		// Validate required fields
		if (!body.clientId) {
			return NextResponse.json({ error: "clientId is required" }, { status: 400 });
		}

		if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
			return NextResponse.json({ error: "events array is required and must not be empty" }, { status: 400 });
		}

		// Validate event names
		for (const event of body.events) {
			if (!event.name) {
				return NextResponse.json({ error: "All events must have a name" }, { status: 400 });
			}
		}

		// Send event to GA4
		const result = await sendGA4Event(body.clientId, body.events, body.userId);

		if (!result.success) {
			console.error("[API] Failed to send GA4 event:", result.error);
			return NextResponse.json({ error: "Failed to track event", details: result.error }, { status: 500 });
		}

		// Return success
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[API] Error processing track request:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
	return new NextResponse(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
}
