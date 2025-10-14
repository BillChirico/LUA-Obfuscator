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

/**
 * Track session start
 * Call this when the app first loads
 */
export async function trackSessionStart(): Promise<void> {
	const isReturningUser = localStorage.getItem("has_visited") === "true";
	await trackEvent([
		{
			name: "session_start",
			params: {
				user_type: isReturningUser ? "returning" : "new",
				timestamp: Date.now(),
			},
		},
	]);
	localStorage.setItem("has_visited", "true");
}

/**
 * Track protection level change
 */
export async function trackProtectionLevelChange(params: {
	oldLevel: number;
	newLevel: number;
	changeType: "slider" | "preset";
}): Promise<void> {
	await trackEvent([
		{
			name: "protection_level_change",
			params: {
				old_level: params.oldLevel,
				new_level: params.newLevel,
				change_type: params.changeType,
				level_difference: Math.abs(params.newLevel - params.oldLevel),
			},
		},
	]);
}

/**
 * Track sample code selection
 */
export async function trackSampleCodeUsed(sampleName: string): Promise<void> {
	await trackEvent([
		{
			name: "sample_code_selected",
			params: {
				sample_name: sampleName,
			},
		},
	]);
}

/**
 * Track code input event
 * Tracks when user starts typing or pastes code
 */
export async function trackCodeInput(params: {
	inputMethod: "typing" | "paste" | "sample";
	codeLength: number;
	hasExistingCode: boolean;
}): Promise<void> {
	await trackEvent([
		{
			name: "code_input",
			params: {
				input_method: params.inputMethod,
				code_length: params.codeLength,
				has_existing_code: params.hasExistingCode,
			},
		},
	]);
}

/**
 * Track clear/reset action
 */
export async function trackClearCode(clearType: "input" | "output" | "both"): Promise<void> {
	await trackEvent([
		{
			name: "clear_code",
			params: {
				clear_type: clearType,
			},
		},
	]);
}

/**
 * Track obfuscation performance
 */
export async function trackObfuscationPerformance(params: {
	inputSize: number;
	outputSize: number;
	duration: number;
	sizeRatio: number;
}): Promise<void> {
	await trackEvent([
		{
			name: "obfuscation_performance",
			params: {
				input_size: params.inputSize,
				output_size: params.outputSize,
				duration_ms: params.duration,
				size_ratio: params.sizeRatio,
				size_increase_percent: ((params.outputSize - params.inputSize) / params.inputSize) * 100,
			},
		},
	]);
}

/**
 * Track feature combination usage
 * Helps understand which combinations of settings are most popular
 */
export async function trackFeatureCombination(params: {
	mangleNames: boolean;
	encodeStrings: boolean;
	encodeNumbers: boolean;
	controlFlow: boolean;
	minify: boolean;
	protectionLevel: number;
}): Promise<void> {
	const enabledFeatures = [];
	if (params.mangleNames) enabledFeatures.push("mangle");
	if (params.encodeStrings) enabledFeatures.push("strings");
	if (params.encodeNumbers) enabledFeatures.push("numbers");
	if (params.controlFlow) enabledFeatures.push("control_flow");
	if (params.minify) enabledFeatures.push("minify");

	await trackEvent([
		{
			name: "feature_combination",
			params: {
				features: enabledFeatures.join(","),
				feature_count: enabledFeatures.length,
				protection_level: params.protectionLevel,
			},
		},
	]);
}

/**
 * Track time spent on page
 * Call this periodically or before page unload
 */
export async function trackTimeOnPage(seconds: number): Promise<void> {
	await trackEvent([
		{
			name: "time_on_page",
			params: {
				seconds: seconds,
				minutes: Math.floor(seconds / 60),
			},
		},
	]);
}

/**
 * Track successful obfuscation milestone
 * For tracking user engagement milestones
 */
export async function trackObfuscationMilestone(count: number): Promise<void> {
	await trackEvent([
		{
			name: "obfuscation_milestone",
			params: {
				total_obfuscations: count,
				milestone: count >= 50 ? "power_user" : count >= 10 ? "regular_user" : "new_user",
			},
		},
	]);
}

/**
 * Track code comparison view
 * When users compare input vs output
 */
export async function trackCodeComparison(params: { viewDuration: number; hadSideScroll: boolean }): Promise<void> {
	await trackEvent([
		{
			name: "code_comparison",
			params: {
				view_duration_seconds: params.viewDuration,
				had_side_scroll: params.hadSideScroll,
			},
		},
	]);
}

/**
 * Track UI interaction
 * For tracking specific UI element interactions
 */
export async function trackUIInteraction(params: { element: string; action: string; context?: string }): Promise<void> {
	await trackEvent([
		{
			name: "ui_interaction",
			params: {
				element_name: params.element,
				interaction_type: params.action,
				context: params.context,
			},
		},
	]);
}

/**
 * Track share action (if implemented)
 */
export async function trackShare(method: "link" | "social" | "embed"): Promise<void> {
	await trackEvent([
		{
			name: "share_app",
			params: {
				share_method: method,
			},
		},
	]);
}

/**
 * Track feedback submission (if implemented)
 */
export async function trackFeedback(params: {
	rating?: number;
	feedbackType: "bug" | "feature" | "general";
	hasMessage: boolean;
}): Promise<void> {
	await trackEvent([
		{
			name: "feedback_submitted",
			params: {
				rating: params.rating,
				feedback_type: params.feedbackType,
				has_message: params.hasMessage,
			},
		},
	]);
}
