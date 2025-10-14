/**
 * Unit tests for analytics-server.ts
 * Tests server-side GA4 Measurement Protocol integration
 */

import {
	sendGA4Event,
	generateClientId,
	trackObfuscation,
	trackDownload,
	trackCopy,
	type GA4Event,
} from "@/lib/analytics-server";

// Mock environment variables
const originalEnv = process.env;

beforeAll(() => {
	process.env = {
		...originalEnv,
		NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST123",
		GA_MEASUREMENT_PROTOCOL_API_SECRET: "test_secret_key",
	};
});

afterAll(() => {
	process.env = originalEnv;
});

// Mock fetch
global.fetch = jest.fn();

describe("sendGA4Event", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(fetch as jest.Mock).mockResolvedValue({
			ok: true,
			text: async () => "Success",
		});
	});

	test("should send event successfully", async () => {
		const events: GA4Event[] = [
			{
				name: "test_event",
				params: {
					test_param: "value",
				},
			},
		];

		const result = await sendGA4Event("client_123", events);

		expect(result.success).toBe(true);
		expect(result.error).toBeUndefined();
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	test("should include measurement ID and API secret in URL", async () => {
		await sendGA4Event("client_123", [{ name: "test" }]);

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const url = fetchCall[0];

		expect(url).toContain("G-TEST123");
		expect(url).toContain("test_secret_key");
	});

	test("should include client ID in payload", async () => {
		const clientId = "test_client_456";
		await sendGA4Event(clientId, [{ name: "test" }]);

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.client_id).toBe(clientId);
	});

	test("should include events in payload", async () => {
		const events: GA4Event[] = [
			{ name: "event1", params: { param1: "value1" } },
			{ name: "event2", params: { param2: "value2" } },
		];

		await sendGA4Event("client_123", events);

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.events).toHaveLength(2);
		expect(requestBody.events[0].name).toBe("event1");
		expect(requestBody.events[1].name).toBe("event2");
	});

	test("should add engagement_time_msec to events", async () => {
		const events: GA4Event[] = [{ name: "test", params: {} }];

		await sendGA4Event("client_123", events);

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.events[0].params.engagement_time_msec).toBeDefined();
		expect(requestBody.events[0].params.engagement_time_msec).toBeGreaterThan(0);
	});

	test("should preserve custom engagement time", async () => {
		const events: GA4Event[] = [
			{
				name: "test",
				params: {
					engagement_time_msec: 500,
				},
			},
		];

		await sendGA4Event("client_123", events);

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.events[0].params.engagement_time_msec).toBe(500);
	});

	test("should include optional user ID", async () => {
		const userId = "user_789";
		await sendGA4Event("client_123", [{ name: "test" }], userId);

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.user_id).toBe(userId);
	});

	test("should include timestamp", async () => {
		await sendGA4Event("client_123", [{ name: "test" }]);

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.timestamp_micros).toBeDefined();
		expect(typeof requestBody.timestamp_micros).toBe("number");
		expect(requestBody.timestamp_micros).toBeGreaterThan(0);
	});

	test("should handle missing measurement ID", async () => {
		const originalMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
		delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

		const result = await sendGA4Event("client_123", [{ name: "test" }]);

		expect(result.success).toBe(false);
		expect(result.error).toBe("GA4 configuration missing");
		expect(fetch).not.toHaveBeenCalled();

		process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalMeasurementId;
	});

	test("should handle missing API secret", async () => {
		const originalApiSecret = process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET;
		delete process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET;

		const result = await sendGA4Event("client_123", [{ name: "test" }]);

		expect(result.success).toBe(false);
		expect(result.error).toBe("GA4 configuration missing");

		process.env.GA_MEASUREMENT_PROTOCOL_API_SECRET = originalApiSecret;
	});

	test("should handle HTTP error responses", async () => {
		(fetch as jest.Mock).mockResolvedValue({
			ok: false,
			status: 400,
			text: async () => "Bad Request",
		});

		const result = await sendGA4Event("client_123", [{ name: "test" }]);

		expect(result.success).toBe(false);
		expect(result.error).toContain("HTTP 400");
		expect(result.error).toContain("Bad Request");
	});

	test("should handle network errors", async () => {
		(fetch as jest.Mock).mockRejectedValue(new Error("Network failure"));

		const result = await sendGA4Event("client_123", [{ name: "test" }]);

		expect(result.success).toBe(false);
		expect(result.error).toBe("Network failure");
	});

	test("should log errors to console", async () => {
		const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
		(fetch as jest.Mock).mockRejectedValue(new Error("Test error"));

		await sendGA4Event("client_123", [{ name: "test" }]);

		expect(consoleErrorSpy).toHaveBeenCalled();
		consoleErrorSpy.mockRestore();
	});
});

describe("generateClientId", () => {
	test("should generate a valid UUID", () => {
		const clientId = generateClientId();

		expect(clientId).toBeDefined();
		expect(typeof clientId).toBe("string");
		expect(clientId.length).toBeGreaterThan(0);

		// UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
		const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		expect(clientId).toMatch(uuidPattern);
	});

	test("should generate unique IDs", () => {
		const id1 = generateClientId();
		const id2 = generateClientId();
		const id3 = generateClientId();

		expect(id1).not.toBe(id2);
		expect(id2).not.toBe(id3);
		expect(id1).not.toBe(id3);
	});

	test("should generate 100 unique IDs", () => {
		const ids = new Set<string>();

		for (let i = 0; i < 100; i++) {
			ids.add(generateClientId());
		}

		expect(ids.size).toBe(100);
	});
});

describe("trackObfuscation", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(fetch as jest.Mock).mockResolvedValue({
			ok: true,
			text: async () => "Success",
		});
	});

	test("should track obfuscation event", async () => {
		const result = await trackObfuscation({
			clientId: "client_123",
			obfuscationType: "mangle",
			codeSize: 1024,
			protectionLevel: 75,
		});

		expect(result.success).toBe(true);
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	test("should include correct event parameters", async () => {
		await trackObfuscation({
			clientId: "client_123",
			obfuscationType: "full",
			codeSize: 2048,
			protectionLevel: 100,
		});

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);
		const event = requestBody.events[0];

		expect(event.name).toBe("obfuscate_code");
		expect(event.params.obfuscation_type).toBe("full");
		expect(event.params.code_size).toBe(2048);
		expect(event.params.protection_level).toBe(100);
	});

	test("should handle optional user ID", async () => {
		await trackObfuscation({
			clientId: "client_123",
			obfuscationType: "mangle",
			codeSize: 500,
			protectionLevel: 50,
			userId: "user_456",
		});

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);

		expect(requestBody.user_id).toBe("user_456");
	});
});

describe("trackDownload", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(fetch as jest.Mock).mockResolvedValue({
			ok: true,
			text: async () => "Success",
		});
	});

	test("should track download event", async () => {
		const result = await trackDownload({
			clientId: "client_123",
			codeSize: 4096,
		});

		expect(result.success).toBe(true);
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	test("should include correct event parameters", async () => {
		await trackDownload({
			clientId: "client_123",
			codeSize: 8192,
		});

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);
		const event = requestBody.events[0];

		expect(event.name).toBe("download_obfuscated_code");
		expect(event.params.code_size).toBe(8192);
	});
});

describe("trackCopy", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(fetch as jest.Mock).mockResolvedValue({
			ok: true,
			text: async () => "Success",
		});
	});

	test("should track copy event", async () => {
		const result = await trackCopy({
			clientId: "client_123",
			codeSize: 512,
		});

		expect(result.success).toBe(true);
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	test("should include correct event parameters", async () => {
		await trackCopy({
			clientId: "client_123",
			codeSize: 1024,
		});

		const fetchCall = (fetch as jest.Mock).mock.calls[0];
		const requestBody = JSON.parse(fetchCall[1].body);
		const event = requestBody.events[0];

		expect(event.name).toBe("copy_obfuscated_code");
		expect(event.params.code_size).toBe(1024);
	});
});
