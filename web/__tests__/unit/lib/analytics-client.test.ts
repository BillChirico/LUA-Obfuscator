/**
 * Unit tests for analytics-client.ts
 * Tests client-side analytics tracking functionality
 */

import {
	getClientId,
	trackEvent,
	trackObfuscation,
	trackDownload,
	trackCopy,
	trackSettingsChange,
	trackError,
} from "@/lib/analytics-client";
import type { GA4Event } from "@/lib/analytics-server";

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
		clear: () => {
			store = {};
		},
		removeItem: (key: string) => {
			delete store[key];
		},
	};
})();

Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
});

// Mock fetch
global.fetch = jest.fn();

describe("getClientId", () => {
	beforeEach(() => {
		localStorageMock.clear();
		jest.clearAllMocks();
	});

	test("should generate and store new client ID if none exists", () => {
		const clientId = getClientId();

		expect(clientId).toBeDefined();
		expect(typeof clientId).toBe("string");
		expect(clientId.length).toBeGreaterThan(0);

		// Should be stored in localStorage
		const stored = localStorageMock.getItem("ga_client_id");
		expect(stored).toBe(clientId);
	});

	test("should return existing client ID from localStorage", () => {
		// Pre-populate localStorage
		const existingId = "existing_client_123";
		localStorageMock.setItem("ga_client_id", existingId);

		const clientId = getClientId();

		expect(clientId).toBe(existingId);
	});

	test("should return same client ID on multiple calls", () => {
		const id1 = getClientId();
		const id2 = getClientId();
		const id3 = getClientId();

		expect(id1).toBe(id2);
		expect(id2).toBe(id3);
	});

	test("should generate unique IDs for different users", () => {
		localStorageMock.clear();
		const id1 = getClientId();

		localStorageMock.clear();
		const id2 = getClientId();

		expect(id1).not.toBe(id2);
	});

	test("should handle server-side rendering gracefully", () => {
		// Mock SSR environment
		const originalWindow = global.window;
		// @ts-ignore
		delete global.window;

		const clientId = getClientId();

		expect(clientId).toBe("");

		// Restore window
		global.window = originalWindow as any;
	});
});

describe("trackEvent", () => {
	beforeEach(() => {
		localStorageMock.clear();
		jest.clearAllMocks();
		(fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({ success: true }),
		});
	});

	test("should successfully track event", async () => {
		const events: GA4Event[] = [
			{
				name: "test_event",
				params: {
					test_param: "value",
				},
			},
		];

		const result = await trackEvent(events);

		expect(result.success).toBe(true);
		expect(result.error).toBeUndefined();
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	test("should include client ID in request", async () => {
		const events: GA4Event[] = [{ name: "test_event" }];

		await trackEvent(events);

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.clientId).toBeDefined();
		expect(typeof requestBody.clientId).toBe("string");
	});

	test("should include events array in request", async () => {
		const events: GA4Event[] = [
			{ name: "event1", params: { param1: "value1" } },
			{ name: "event2", params: { param2: "value2" } },
		];

		await trackEvent(events);

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.events).toEqual(events);
	});

	test("should include optional user ID", async () => {
		const events: GA4Event[] = [{ name: "test_event" }];
		const userId = "user_123";

		await trackEvent(events, userId);

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.userId).toBe(userId);
	});

	test("should handle network errors", async () => {
		(fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

		const events: GA4Event[] = [{ name: "test_event" }];
		const result = await trackEvent(events);

		expect(result.success).toBe(false);
		expect(result.error).toBe("Network error");
	});

	test("should handle API error responses", async () => {
		(fetch as jest.Mock).mockResolvedValue({
			ok: false,
			json: async () => ({ error: "Invalid request" }),
		});

		const events: GA4Event[] = [{ name: "test_event" }];
		const result = await trackEvent(events);

		expect(result.success).toBe(false);
		expect(result.error).toBe("Invalid request");
	});

	test("should log errors to console", async () => {
		const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
		(fetch as jest.Mock).mockRejectedValue(new Error("Test error"));

		await trackEvent([{ name: "test" }]);

		expect(consoleErrorSpy).toHaveBeenCalled();
		consoleErrorSpy.mockRestore();
	});
});

describe("trackObfuscation", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({ success: true }),
		});
	});

	test("should track obfuscation with correct event name", async () => {
		await trackObfuscation({
			obfuscationType: "mangle",
			codeSize: 1024,
			protectionLevel: 75,
		});

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.events[0].name).toBe("obfuscate_code");
	});

	test("should include obfuscation parameters", async () => {
		await trackObfuscation({
			obfuscationType: "full",
			codeSize: 2048,
			protectionLevel: 100,
		});

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);
		const params = requestBody.events[0].params;

		expect(params.obfuscation_type).toBe("full");
		expect(params.code_size).toBe(2048);
		expect(params.protection_level).toBe(100);
	});

	test("should handle all obfuscation types", async () => {
		const types: Array<"mangle" | "encode" | "minify" | "mangle_encode" | "full"> = [
			"mangle",
			"encode",
			"minify",
			"mangle_encode",
			"full",
		];

		for (const type of types) {
			await trackObfuscation({
				obfuscationType: type,
				codeSize: 100,
				protectionLevel: 50,
			});
		}

		expect(fetch).toHaveBeenCalledTimes(types.length);
	});
});

describe("trackDownload", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({ success: true }),
		});
	});

	test("should track download with correct event name", async () => {
		await trackDownload(512);

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.events[0].name).toBe("download_obfuscated_code");
	});

	test("should include code size parameter", async () => {
		const codeSize = 4096;
		await trackDownload(codeSize);

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.events[0].params.code_size).toBe(codeSize);
	});
});

describe("trackCopy", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({ success: true }),
		});
	});

	test("should track copy with correct event name", async () => {
		await trackCopy(256);

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.events[0].name).toBe("copy_obfuscated_code");
	});

	test("should include code size parameter", async () => {
		const codeSize = 8192;
		await trackCopy(codeSize);

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.events[0].params.code_size).toBe(codeSize);
	});
});

describe("trackSettingsChange", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({ success: true }),
		});
	});

	test("should track settings change with correct event name", async () => {
		await trackSettingsChange({
			setting: "mangleNames",
			value: true,
		});

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.events[0].name).toBe("change_settings");
	});

	test("should handle boolean values", async () => {
		await trackSettingsChange({
			setting: "minify",
			value: true,
		});

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);
		const params = requestBody.events[0].params;

		expect(params.setting_name).toBe("minify");
		expect(params.setting_value).toBe("true");
	});

	test("should handle number values", async () => {
		await trackSettingsChange({
			setting: "protectionLevel",
			value: 75,
		});

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);
		const params = requestBody.events[0].params;

		expect(params.setting_value).toBe("75");
	});

	test("should handle string values", async () => {
		await trackSettingsChange({
			setting: "theme",
			value: "dark",
		});

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);
		const params = requestBody.events[0].params;

		expect(params.setting_value).toBe("dark");
	});
});

describe("trackError", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({ success: true }),
		});
	});

	test("should track error with correct event name", async () => {
		await trackError({
			errorType: "syntax_error",
		});

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.events[0].name).toBe("obfuscation_error");
	});

	test("should include error type parameter", async () => {
		await trackError({
			errorType: "parse_error",
			errorMessage: "Unexpected token",
		});

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);
		const params = requestBody.events[0].params;

		expect(params.error_type).toBe("parse_error");
		expect(params.error_message).toBe("Unexpected token");
	});

	test("should work without error message", async () => {
		await trackError({
			errorType: "unknown_error",
		});

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);
		const params = requestBody.events[0].params;

		expect(params.error_type).toBe("unknown_error");
		expect(params.error_message).toBeUndefined();
	});
});
