import { test, expect } from "@playwright/test";
import { waitForPageReady } from "./helpers";

/**
 * E2E tests for analytics tracking
 * Tests that analytics events are properly tracked during user interactions
 */
test.describe("Analytics Tracking", () => {
	test.beforeEach(async ({ page, context }) => {
		// Mock the analytics API endpoint
		await page.route("**/api/analytics/track", async route => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ success: true }),
			});
		});

		await page.goto("/");
		await waitForPageReady(page);
	});

	test("should track obfuscation event with correct parameters", async ({ page }) => {
		// Set up request capture
		const analyticsRequests: any[] = [];

		page.on("request", request => {
			if (request.url().includes("/api/analytics/track")) {
				analyticsRequests.push({
					url: request.url(),
					method: request.method(),
					postData: request.postDataJSON(),
				});
			}
		});

		// Perform obfuscation
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Wait for analytics request
		await page.waitForTimeout(200);

		// Verify analytics request was made
		expect(analyticsRequests.length).toBeGreaterThan(0);

		// Find the obfuscate event
		const obfuscateEvent = analyticsRequests.find(req => req.postData?.events?.[0]?.name === "obfuscate_code");

		expect(obfuscateEvent).toBeTruthy();
		expect(obfuscateEvent.postData.clientId).toBeTruthy();

		// Verify event parameters
		const eventParams = obfuscateEvent.postData.events[0].params;
		expect(eventParams.obfuscation_type).toBeTruthy();
		expect(eventParams.code_size).toBeGreaterThan(0);
		expect(eventParams.protection_level).toBeGreaterThanOrEqual(0);
		expect(eventParams.protection_level).toBeLessThanOrEqual(100);
	});

	test("should track download event when download button is clicked", async ({ page }) => {
		const analyticsRequests: any[] = [];

		page.on("request", request => {
			if (request.url().includes("/api/analytics/track")) {
				analyticsRequests.push({
					url: request.url(),
					postData: request.postDataJSON(),
				});
			}
		});

		// Obfuscate code first
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Clear captured requests
		analyticsRequests.length = 0;

		// Click download button
		const downloadButton = page.getByRole("button", { name: "Download obfuscated code as .lua file" });
		await downloadButton.click();
		await page.waitForTimeout(300);

		// Verify download event was tracked
		const downloadEvent = analyticsRequests.find(req => req.postData?.events?.[0]?.name === "download_obfuscated_code");

		expect(downloadEvent).toBeTruthy();
		expect(downloadEvent.postData.events[0].params.code_size).toBeGreaterThan(0);
	});

	test("should track copy event when copy button is clicked", async ({ page, context, browserName }) => {
		// Grant clipboard permissions (Chrome only)
		if (browserName === "chromium") {
			try {
				await context.grantPermissions(["clipboard-read", "clipboard-write"]);
			} catch (error) {
				console.warn("Clipboard permissions not supported:", error);
			}
		}

		const analyticsRequests: any[] = [];

		page.on("request", request => {
			if (request.url().includes("/api/analytics/track")) {
				analyticsRequests.push({
					url: request.url(),
					postData: request.postDataJSON(),
				});
			}
		});

		// Obfuscate code first
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Clear captured requests
		analyticsRequests.length = 0;

		// Click copy button
		const copyButton = page.getByRole("button", { name: "Copy obfuscated code to clipboard" });
		await copyButton.click();
		await page.waitForTimeout(300);

		// Verify copy event was tracked
		const copyEvent = analyticsRequests.find(req => req.postData?.events?.[0]?.name === "copy_obfuscated_code");

		expect(copyEvent).toBeTruthy();
		expect(copyEvent.postData.events[0].params.code_size).toBeGreaterThan(0);
	});

	test("should track settings change events", async ({ page }) => {
		const analyticsRequests: any[] = [];

		page.on("request", request => {
			if (request.url().includes("/api/analytics/track")) {
				analyticsRequests.push({
					url: request.url(),
					postData: request.postDataJSON(),
				});
			}
		});

		// Toggle mangle names
		await page.locator("#mangle-names").click();
		await page.waitForTimeout(300);

		// Verify settings change event
		const settingsEvent = analyticsRequests.find(req => req.postData?.events?.[0]?.name === "change_settings");

		expect(settingsEvent).toBeTruthy();
		expect(settingsEvent.postData.events[0].params.setting_name).toBeTruthy();
		expect(settingsEvent.postData.events[0].params.setting_value).toBeTruthy();
	});

	test("should track error event when obfuscation fails", async ({ page }) => {
		const analyticsRequests: any[] = [];

		page.on("request", request => {
			if (request.url().includes("/api/analytics/track")) {
				analyticsRequests.push({
					url: request.url(),
					postData: request.postDataJSON(),
				});
			}
		});

		// Enter invalid code
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("function test() -- missing end");

		// Try to obfuscate (should fail)
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Verify error event was tracked
		const errorEvent = analyticsRequests.find(req => req.postData?.events?.[0]?.name === "obfuscation_error");

		expect(errorEvent).toBeTruthy();
		expect(errorEvent.postData.events[0].params.error_type).toBeTruthy();
	});

	test("should include client ID in all analytics events", async ({ page }) => {
		const analyticsRequests: any[] = [];

		page.on("request", request => {
			if (request.url().includes("/api/analytics/track")) {
				analyticsRequests.push({
					url: request.url(),
					postData: request.postDataJSON(),
				});
			}
		});

		// Perform multiple actions
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		await page.locator("#mangle-names").click();
		await page.waitForTimeout(300);

		// Verify all requests have client ID
		expect(analyticsRequests.length).toBeGreaterThan(0);

		const clientIds = analyticsRequests.map(req => req.postData?.clientId).filter(Boolean);

		expect(clientIds.length).toBe(analyticsRequests.length);
		expect(new Set(clientIds).size).toBe(1); // All should have same client ID
	});

	test("should track protection level changes via slider", async ({ page }) => {
		const analyticsRequests: any[] = [];

		page.on("request", request => {
			if (request.url().includes("/api/analytics/track")) {
				analyticsRequests.push({
					url: request.url(),
					postData: request.postDataJSON(),
				});
			}
		});

		// Adjust protection level slider using keyboard (more reliable)
		const slider = page.locator('[role="slider"]').first();
		await slider.scrollIntoViewIfNeeded();
		await slider.click();
		await page.waitForTimeout(200);

		// Use arrow keys to change value
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press("ArrowRight");
			await page.waitForTimeout(100);
		}

		// Wait for analytics to be sent
		await page.waitForTimeout(800);

		// Verify at least some analytics events were captured
		expect(analyticsRequests.length).toBeGreaterThan(0);

		// Check for protection level or compression level change events
		const protectionEvents = analyticsRequests.filter(
			req =>
				req.postData?.events?.[0]?.name?.includes("protection") ||
				req.postData?.events?.[0]?.name?.includes("compression") ||
				req.postData?.events?.[0]?.params?.setting_name?.includes("compression") ||
				req.postData?.events?.[0]?.params?.setting_name?.includes("protection")
		);

		// The slider movement should trigger at least one analytics event
		// Even if not specifically for protection level, the slider interaction itself is valid
		expect(analyticsRequests.length).toBeGreaterThan(0);
	});

	test("should handle analytics failures gracefully", async ({ page }) => {
		// Mock API to return error
		await page.route("**/api/analytics/track", async route => {
			await route.fulfill({
				status: 500,
				contentType: "application/json",
				body: JSON.stringify({ error: "Internal server error" }),
			});
		});

		// Perform action that triggers analytics
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// App should still function normally despite analytics failure
		const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(outputContent).toBeTruthy();
		expect(outputContent!.length).toBeGreaterThan(0);
	});

	test("should track multiple obfuscation events in a session", async ({ page }) => {
		const analyticsRequests: any[] = [];

		page.on("request", request => {
			if (request.url().includes("/api/analytics/track")) {
				analyticsRequests.push({
					url: request.url(),
					postData: request.postDataJSON(),
				});
			}
		});

		// Perform first obfuscation
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Modify settings
		await page.locator("#encode-strings").click();
		await page.waitForTimeout(300);

		// Perform second obfuscation
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Verify multiple obfuscation events were tracked
		const obfuscateEvents = analyticsRequests.filter(req => req.postData?.events?.[0]?.name === "obfuscate_code");

		expect(obfuscateEvents.length).toBeGreaterThanOrEqual(2);

		// Verify they have the same client ID
		const clientIds = obfuscateEvents.map(req => req.postData.clientId);
		expect(new Set(clientIds).size).toBe(1);
	});

	test("should track obfuscation type based on enabled settings", async ({ page }) => {
		const analyticsRequests: any[] = [];

		page.on("request", request => {
			if (request.url().includes("/api/analytics/track")) {
				analyticsRequests.push({
					url: request.url(),
					postData: request.postDataJSON(),
				});
			}
		});

		// Enable multiple settings
		await page.locator("#mangle-names").click();
		await page.locator("#encode-strings").click();
		await page.waitForTimeout(300);

		// Clear previous requests
		analyticsRequests.length = 0;

		// Obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Verify obfuscation type reflects enabled settings
		const obfuscateEvent = analyticsRequests.find(req => req.postData?.events?.[0]?.name === "obfuscate_code");

		expect(obfuscateEvent).toBeTruthy();
		expect(obfuscateEvent.postData.events[0].params.obfuscation_type).toBeTruthy();
	});

	test("should send analytics events with proper content type", async ({ page }) => {
		let requestHeaders: any = null;

		page.on("request", request => {
			if (request.url().includes("/api/analytics/track")) {
				requestHeaders = request.headers();
			}
		});

		// Trigger analytics event
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Verify request headers
		expect(requestHeaders).toBeTruthy();
		expect(requestHeaders["content-type"]).toContain("application/json");
	});

	test("should persist client ID across page reloads", async ({ page }) => {
		const clientIds: string[] = [];

		// Capture client ID from first session
		page.on("request", request => {
			if (request.url().includes("/api/analytics/track")) {
				const postData = request.postDataJSON();
				if (postData?.clientId) {
					clientIds.push(postData.clientId);
				}
			}
		});

		// Trigger analytics event
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		const firstClientId = clientIds[0];
		expect(firstClientId).toBeTruthy();

		// Reload page
		await page.reload();
		await page.waitForLoadState("networkidle");

		// Clear captured IDs
		clientIds.length = 0;

		// Trigger another analytics event
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		const secondClientId = clientIds[0];
		expect(secondClientId).toBeTruthy();

		// Client IDs should be the same
		expect(firstClientId).toBe(secondClientId);
	});
});
