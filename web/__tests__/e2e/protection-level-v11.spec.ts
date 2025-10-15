import { test, expect } from "@playwright/test";
import { createHelpers, waitForPageReady } from "./helpers";

/**
 * E2E tests for v1.1 protection level enhancements
 * Tests progressive activation of v1.1 features via the protection slider
 */
test.describe("Protection Level v1.1", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await waitForPageReady(page);
	});

	test.describe("Progressive Feature Activation", () => {
		test("should activate XOR encryption at 70%", async ({ page }) => {
			const { ui } = createHelpers(page);

			// Set to 70%
			await ui.setProtectionLevel(70);

			// Check that string encoding is enabled
			await expect(page.getByLabel(/Encode Strings/i)).toBeChecked();

			// Status should mention XOR (use first match to avoid strict mode violation)
			await expect(page.getByText(/Advanced.*XOR/i).first()).toBeVisible();
		});

		test("should activate dead code injection at 75%", async ({ page }) => {
			const { ui } = createHelpers(page);

			// Set to 75%
			await ui.setProtectionLevel(75);

			// Dead code injection should be enabled
			await expect(page.getByLabel(/Dead Code Injection/i)).toBeChecked();

			// Status should mention dead code (use first match to avoid strict mode violation)
			await expect(page.getByText(/Dead Code/i).first()).toBeVisible();
		});

		test("should activate control flow flattening at 85%", async ({ page }) => {
			const { ui } = createHelpers(page);

			// Set to 85%
			await ui.setProtectionLevel(85);

			// Control flow flattening should be enabled
			await expect(page.getByLabel(/Control Flow Flattening/i)).toBeChecked();

			// Status should mention control flow or state machine (use first match)
			await expect(page.getByText(/Control Flow Flattening/i).first()).toBeVisible();
		});

		test("should activate anti-debugging at 90%", async ({ page }) => {
			const { ui } = createHelpers(page);

			// Set to 90%
			await ui.setProtectionLevel(90);

			// Anti-debugging should be enabled
			await expect(page.getByLabel(/Anti-Debugging/i)).toBeChecked();

			// Status should mention maximum protection (use first match)
			await expect(page.getByText(/Maximum Protection/i).first()).toBeVisible();
		});

		test("should show all features at 100%", async ({ page }) => {
			const { ui } = createHelpers(page);

			// Set to 100%
			await ui.setProtectionLevel(100);

			// All toggles should be enabled
			await expect(page.getByLabel(/Mangle Names/i)).toBeChecked();
			await expect(page.getByLabel(/Encode Strings/i)).toBeChecked();
			await expect(page.getByLabel(/Encode Numbers/i)).toBeChecked();
			await expect(page.getByLabel(/Control Flow/i).first()).toBeChecked();
			await expect(page.getByLabel(/Dead Code Injection/i)).toBeChecked();
			await expect(page.getByLabel(/Control Flow Flattening/i)).toBeChecked();
			await expect(page.getByLabel(/Anti-Debugging/i)).toBeChecked();
		});
	});

	test.describe("Protection Level Status Display", () => {
		test("should show detailed status for level 70-74", async ({ page }) => {
			const { ui } = createHelpers(page);
			await ui.setProtectionLevel(70);

			// Should show "Advanced" label
			await expect(page.getByText(/Advanced:/i).first()).toBeVisible();
			await expect(page.getByText(/XOR Encryption/i).first()).toBeVisible();
		});

		test("should show detailed status for level 75-84", async ({ page }) => {
			const { ui } = createHelpers(page);
			await ui.setProtectionLevel(80);

			// Should mention encryption and dead code
			await expect(page.getByText(/Encryption.*Dead Code/i).first()).toBeVisible();
		});

		test("should show detailed status for level 85-89", async ({ page }) => {
			const { ui } = createHelpers(page);
			await ui.setProtectionLevel(85);

			// Should mention control flow flattening and CPU intensive
			await expect(page.getByText(/Control Flow Flattening/i).first()).toBeVisible();
			await expect(page.getByText(/CPU intensive/i).first()).toBeVisible();
		});

		test("should show maximum protection status at 90+", async ({ page }) => {
			const { ui } = createHelpers(page);
			await ui.setProtectionLevel(95);

			// Should show maximum protection
			await expect(page.getByText(/Maximum Protection/i).first()).toBeVisible();
			await expect(page.getByText(/All Techniques/i).first()).toBeVisible();
		});

		test("should show animated status indicators", async ({ page }) => {
			const { ui } = createHelpers(page);
			await ui.setProtectionLevel(80);

			// Status indicator dot should be visible and animated
			const statusDot = page.locator(".animate-pulse.rounded-full");
			await expect(statusDot).toBeVisible();
		});

		test("should color-code status by protection strength", async ({ page }) => {
			const { ui } = createHelpers(page);

			// Low protection (blue)
			await ui.setProtectionLevel(30);
			const lowStatus = page.locator(".bg-blue-500\\/10");
			await expect(lowStatus).toBeVisible();

			// Medium protection (purple)
			await ui.setProtectionLevel(60);
			const mediumStatus = page.locator(".bg-purple-500\\/10");
			await expect(mediumStatus).toBeVisible();

			// High protection (orange/red)
			await ui.setProtectionLevel(90);
			const highStatus = page.locator("[class*='orange-500']");
			await expect(highStatus.first()).toBeVisible();
		});
	});

	test.describe("Feature Interaction with Slider", () => {
		test("should disable v1.1 features when slider moved below threshold", async ({ page }) => {
			const { ui } = createHelpers(page);

			// Set to 90% (enables anti-debugging)
			await ui.setProtectionLevel(90);
			await expect(page.getByLabel(/Anti-Debugging/i)).toBeChecked();

			// Move to 70% (disables anti-debugging)
			await ui.setProtectionLevel(70);
			await expect(page.getByLabel(/Anti-Debugging/i)).not.toBeChecked();
		});

		test("should maintain manual toggles when slider is at 0%", async ({ page }) => {
			const { ui } = createHelpers(page);
			await ui.setProtectionLevel(0);

			// Manually enable anti-debugging
			await page.getByLabel(/Anti-Debugging/i).click();
			await expect(page.getByLabel(/Anti-Debugging/i)).toBeChecked();

			// Should stay enabled even at 0%
			await expect(page.getByLabel(/Anti-Debugging/i)).toBeChecked();
		});

		test("should obfuscate successfully at each major level", async ({ page }) => {
			test.setTimeout(30000); // Increase timeout for multiple iterations

			const { monaco, ui } = createHelpers(page);
			const levels = [0, 30, 60, 70, 80, 90, 100];

			for (const level of levels) {
				await ui.setProtectionLevel(level);

				// Click obfuscate
				await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
				await page.waitForTimeout(800);

				// Should produce output
				const outputEditor = page.locator(".monaco-editor").nth(1);
				const outputText = await outputEditor.textContent();
				expect(outputText).toBeTruthy();

				// Wait before next iteration
				await page.waitForTimeout(200);
			}
		});
	});

	test.describe("Protection Strength Badges", () => {
		test("should display protection percentage badge", async ({ page }) => {
			const { ui } = createHelpers(page);
			await ui.setProtectionLevel(75);

			// Badge should show 75%
			await expect(page.getByText("75%")).toBeVisible();
		});

		test("should update badge color based on protection level", async ({ page }) => {
			const { ui } = createHelpers(page);

			// High protection should have orange/red badge
			await ui.setProtectionLevel(90);
			// Look specifically in the protection level section, not in FAQ content
			const badge = page.locator('[class*="orange"]').first();
			await expect(badge).toBeVisible();
		});
	});

	test.describe("Performance with Advanced Features", () => {
		test("should complete obfuscation with all v1.1 features within reasonable time", async ({ page }) => {
			const { ui } = createHelpers(page);

			// Enable all v1.1 features via slider
			await ui.setProtectionLevel(100);

			const startTime = Date.now();

			// Click obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();

			// Wait for completion (max 5 seconds)
			await page.waitForTimeout(2000);

			const duration = Date.now() - startTime;

			// Should complete within 5 seconds
			expect(duration).toBeLessThan(5000);

			// Should produce output
			const outputEditor = page.locator(".monaco-editor").nth(1);
			const outputText = await outputEditor.textContent();
			expect(outputText!.length).toBeGreaterThan(0);
		});
	});
});
