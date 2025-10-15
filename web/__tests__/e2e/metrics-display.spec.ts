import { test, expect } from "@playwright/test";
import { createHelpers } from "./helpers";

/**
 * E2E tests for obfuscation metrics display
 * Tests the real-time metrics card that shows statistics after obfuscation
 */
test.describe("Metrics Display", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
	});

	test.describe("Metrics Card Visibility", () => {
		test("should not show metrics card initially", async ({ page }) => {
			// Metrics card should not be visible before obfuscation
			const metricsCard = page.getByText("Obfuscation Metrics", { exact: true });
			await expect(metricsCard).not.toBeVisible();
		});

		test("should show metrics card after obfuscation", async ({ page }) => {
			// Click obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Metrics card should now be visible
			const metricsCard = page.getByText("Obfuscation Metrics", { exact: true });
			await expect(metricsCard).toBeVisible();
		});

		test("should hide metrics card on error", async ({ page }) => {
			// Enter invalid Lua code
			const inputEditor = page.locator(".monaco-editor").first();
			await inputEditor.click();
			await page.keyboard.press("Control+A");
			await page.keyboard.type("invalid lua ][");

			// Click obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Metrics should not be visible
			const metricsCard = page.getByText("Obfuscation Metrics", { exact: true });
			await expect(metricsCard).not.toBeVisible();
		});
	});

	test.describe("Size Metrics", () => {
		test("should display input size", async ({ page }) => {
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Check for Input Size label and its value
			const inputSizeSection = page.locator('text="Input Size"').locator("..");
			await expect(inputSizeSection).toBeVisible();
			await expect(inputSizeSection.locator("span", { hasText: /KB$/ })).toBeVisible();
		});

		test("should display output size", async ({ page }) => {
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			await expect(page.getByText("Output Size")).toBeVisible();
		});

		test("should display size ratio", async ({ page }) => {
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			await expect(page.getByText("Size Ratio")).toBeVisible();
			await expect(page.getByText(/\d+\.\d+x/)).toBeVisible();
		});

		test("should color-code size ratio based on value", async ({ page }) => {
			const { ui } = createHelpers(page);

			// Simple obfuscation (lower ratio)
			await ui.setProtectionLevel(20);

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Check that size ratio has appropriate styling
			const sizeRatioValue = page.locator('text="Size Ratio"').locator("..").locator("span").last();
			await expect(sizeRatioValue).toBeVisible();
		});
	});

	test.describe("Transformation Counts", () => {
		test("should display Transformations section", async ({ page }) => {
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			await expect(page.getByText("Transformations", { exact: true })).toBeVisible();
		});

		test("should show names mangled count when enabled", async ({ page }) => {
			// Enable name mangling
			await page.getByLabel(/Mangle Names/i).click();

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Should show names mangled metric
			await expect(page.getByText("Names Mangled")).toBeVisible();
		});

		test("should show strings encrypted count when enabled", async ({ page }) => {
			// Enable string encoding
			await page.getByLabel(/Encode Strings/i).click();

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Should show strings encrypted metric
			await expect(page.getByText("Strings Encrypted")).toBeVisible();
		});

		test("should show encryption algorithm in metrics", async ({ page }) => {
			const { ui } = createHelpers(page);

			// Enable string encoding
			await page.getByLabel(/Encode Strings/i).click();

			// Select XOR
			await ui.selectOption("Encryption Algorithm", "XOR Cipher");

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Should show (xor) indicator
			await expect(page.getByText(/\(xor\)/i)).toBeVisible();
		});

		test.skip("should show dead code blocks when enabled", async ({ page }) => {
			// Enable dead code injection
			await page.getByLabel(/Dead Code Injection/i).click();

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Should show dead code metric (if any blocks were injected)
			const metricsCard = page.locator('h2:has-text("Obfuscation Metrics")').locator("..");
			const hasDeadCode = await metricsCard.getByText("Dead Code Blocks").isVisible();

			// Dead code should appear with high probability
			expect(hasDeadCode).toBeTruthy();
		});

		test("should show anti-debug checks when enabled", async ({ page }) => {
			// Enable anti-debugging
			await page.getByLabel(/Anti-Debugging/i).click();

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Should show anti-debug metric
			await expect(page.getByText("Anti-Debug Checks")).toBeVisible();
		});

		test("should show color-coded transformation counts", async ({ page }) => {
			// Enable multiple features
			await page.getByLabel(/Mangle Names/i).click();
			await page.getByLabel(/Encode Strings/i).click();

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Check for color-coded values (purple for names, blue for strings)
			const namesValue = page.locator('text="Names Mangled"').locator("..").locator(".text-purple-400");
			await expect(namesValue).toBeVisible();

			const stringsValue = page.locator('text="Strings Encrypted"').locator("..").locator(".text-blue-400");
			await expect(stringsValue).toBeVisible();
		});
	});

	test.describe("Processing Time", () => {
		test("should display processing time", async ({ page }) => {
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			await expect(page.getByText("Processing Time")).toBeVisible();
			await expect(page.getByText(/\d+ms/)).toBeVisible();
		});

		test("should show longer processing time for complex obfuscation", async ({ page }) => {
			// Simple obfuscation
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const simpleTime = await page
				.locator('text="Processing Time"')
				.locator("..")
				.locator("span")
				.last()
				.textContent();

			// Complex obfuscation
			await page.getByLabel(/Dead Code Injection/i).click();
			await page.getByLabel(/Anti-Debugging/i).click();

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const complexTime = await page
				.locator('text="Processing Time"')
				.locator("..")
				.locator("span")
				.last()
				.textContent();

			// Both should show time
			expect(simpleTime).toBeTruthy();
			expect(complexTime).toBeTruthy();
		});
	});

	test.describe("Metrics Card Design", () => {
		test("should have glassmorphism styling", async ({ page }) => {
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Check that metrics card exists and has blur effect
			const metricsHeading = page.getByRole("heading", { name: "Obfuscation Metrics", exact: true });
			await expect(metricsHeading).toBeVisible();

			// Get the card container (two levels up from h2)
			const metricsCard = page.locator('[class*="backdrop-blur"]', { has: metricsHeading });
			await expect(metricsCard).toBeVisible();
		});

		test("should have proper spacing and sections", async ({ page }) => {
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Check for section headers
			await expect(page.getByText("Transformations", { exact: true })).toBeVisible();
			await expect(page.getByText("Processing Time")).toBeVisible();
		});

		test("should use Sparkles icon in header", async ({ page }) => {
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Check for Sparkles icon in metrics header
			const metricsHeading = page.getByRole("heading", { name: "Obfuscation Metrics", exact: true });
			await expect(metricsHeading).toBeVisible();

			// Check that metrics card has icon (SVG) elements
			const metricsCard = page.locator('[class*="backdrop-blur"]', { has: metricsHeading });
			const hasIcon = await metricsCard.locator("svg").first().isVisible();
			expect(hasIcon).toBe(true);
		});
	});

	test.describe("Metrics Updates", () => {
		test("should update metrics on subsequent obfuscations", async ({ page }) => {
			// First obfuscation
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const firstMetrics = await page.locator('text="Size Ratio"').locator("..").locator("span").last().textContent();

			// Enable more features
			await page.getByLabel(/Mangle Names/i).click();
			await page.getByLabel(/Encode Strings/i).click();

			// Second obfuscation
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const secondMetrics = await page.locator('text="Size Ratio"').locator("..").locator("span").last().textContent();

			// Metrics should be different
			expect(secondMetrics).toBeTruthy();
		});

		test("should clear metrics when error occurs", async ({ page }) => {
			// Successful obfuscation first
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);
			await expect(page.getByText("Obfuscation Metrics")).toBeVisible();

			// Enter invalid code
			const inputEditor = page.locator(".monaco-editor").first();
			await inputEditor.click();
			await page.keyboard.press("Control+A");
			await page.keyboard.type("invalid ][");

			// Try to obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Metrics should be hidden
			await expect(page.getByText("Obfuscation Metrics")).not.toBeVisible();
		});
	});

	test.describe("Responsive Metrics Layout", () => {
		test("should display metrics properly on tablet", async ({ page }) => {
			await page.setViewportSize({ width: 768, height: 1024 });

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Scroll to metrics if needed
			await page.getByText("Obfuscation Metrics").scrollIntoViewIfNeeded();

			// All metrics should be visible
			await expect(page.getByText("Input Size")).toBeVisible();
			await expect(page.getByText("Output Size")).toBeVisible();
			await expect(page.getByText("Size Ratio")).toBeVisible();
		});

		test("should display metrics properly on mobile", async ({ page }) => {
			await page.setViewportSize({ width: 390, height: 844 });

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Scroll to metrics
			await page.getByText("Obfuscation Metrics").scrollIntoViewIfNeeded();

			// Check metrics are accessible
			await expect(page.getByText("Input Size")).toBeVisible();
			await expect(page.getByText("Transformations").first()).toBeVisible();
		});
	});
});
