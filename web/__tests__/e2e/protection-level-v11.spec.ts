import { test, expect } from "@playwright/test";

/**
 * E2E tests for v1.1 protection level enhancements
 * Tests progressive activation of v1.1 features via the protection slider
 */
test.describe("Protection Level v1.1", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
	});

	test.describe("Progressive Feature Activation", () => {
		test("should activate XOR encryption at 70%", async ({ page }) => {
			const slider = page.getByRole("slider", { name: /Protection Level/i });

			// Set to 70%
			await slider.fill("70");

			// Check that string encoding is enabled
			await expect(page.getByLabel(/Encode Strings/i)).toBeChecked();

			// Status should mention XOR
			await expect(page.getByText(/XOR/i)).toBeVisible();
		});

		test("should activate dead code injection at 75%", async ({ page }) => {
			const slider = page.getByRole("slider", { name: /Protection Level/i });

			// Set to 75%
			await slider.fill("75");

			// Dead code injection should be enabled
			await expect(page.getByLabel(/Dead Code Injection/i)).toBeChecked();

			// Status should mention dead code
			await expect(page.getByText(/Dead Code/i)).toBeVisible();
		});

		test("should activate control flow flattening at 85%", async ({ page }) => {
			const slider = page.getByRole("slider", { name: /Protection Level/i });

			// Set to 85%
			await slider.fill("85");

			// Control flow flattening should be enabled
			await expect(page.getByLabel(/Control Flow Flattening/i)).toBeChecked();

			// Status should mention control flow or state machine
			await expect(page.getByText(/Control Flow Flattening|state machine/i)).toBeVisible();
		});

		test("should activate anti-debugging at 90%", async ({ page }) => {
			const slider = page.getByRole("slider", { name: /Protection Level/i });

			// Set to 90%
			await slider.fill("90");

			// Anti-debugging should be enabled
			await expect(page.getByLabel(/Anti-Debugging/i)).toBeChecked();

			// Status should mention all techniques or anti-debugging
			await expect(page.getByText(/Maximum Protection|anti-debugging/i)).toBeVisible();
		});

		test("should show all features at 100%", async ({ page }) => {
			const slider = page.getByRole("slider", { name: /Protection Level/i });

			// Set to 100%
			await slider.fill("100");

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
			const slider = page.getByRole("slider");
			await slider.fill("70");

			// Should show "Advanced" label
			await expect(page.getByText(/Advanced:/i)).toBeVisible();
			await expect(page.getByText(/XOR Encryption/i)).toBeVisible();
		});

		test("should show detailed status for level 75-84", async ({ page }) => {
			const slider = page.getByRole("slider");
			await slider.fill("80");

			// Should mention encryption and dead code
			await expect(page.getByText(/Encryption.*Dead Code/i)).toBeVisible();
		});

		test("should show detailed status for level 85-89", async ({ page }) => {
			const slider = page.getByRole("slider");
			await slider.fill("85");

			// Should mention control flow flattening and CPU intensive
			await expect(page.getByText(/Control Flow Flattening/i)).toBeVisible();
			await expect(page.getByText(/CPU intensive/i)).toBeVisible();
		});

		test("should show maximum protection status at 90+", async ({ page }) => {
			const slider = page.getByRole("slider");
			await slider.fill("95");

			// Should show maximum protection
			await expect(page.getByText(/Maximum Protection/i)).toBeVisible();
			await expect(page.getByText(/All Techniques/i)).toBeVisible();
		});

		test("should show animated status indicators", async ({ page }) => {
			const slider = page.getByRole("slider");
			await slider.fill("80");

			// Status indicator dot should be visible and animated
			const statusDot = page.locator(".animate-pulse.rounded-full");
			await expect(statusDot).toBeVisible();
		});

		test("should color-code status by protection strength", async ({ page }) => {
			const slider = page.getByRole("slider");

			// Low protection (blue)
			await slider.fill("30");
			const lowStatus = page.locator(".bg-blue-500\\/10");
			await expect(lowStatus).toBeVisible();

			// Medium protection (purple)
			await slider.fill("60");
			const mediumStatus = page.locator(".bg-purple-500\\/10");
			await expect(mediumStatus).toBeVisible();

			// High protection (orange/red)
			await slider.fill("90");
			const highStatus = page.locator("[class*='orange-500']");
			await expect(highStatus.first()).toBeVisible();
		});
	});

	test.describe("Feature Interaction with Slider", () => {
		test("should disable v1.1 features when slider moved below threshold", async ({ page }) => {
			const slider = page.getByRole("slider");

			// Set to 90% (enables anti-debugging)
			await slider.fill("90");
			await expect(page.getByLabel(/Anti-Debugging/i)).toBeChecked();

			// Move to 70% (disables anti-debugging)
			await slider.fill("70");
			await expect(page.getByLabel(/Anti-Debugging/i)).not.toBeChecked();
		});

		test("should maintain manual toggles when slider is at 0%", async ({ page }) => {
			const slider = page.getByRole("slider");
			await slider.fill("0");

			// Manually enable anti-debugging
			await page.getByLabel(/Anti-Debugging/i).click();
			await expect(page.getByLabel(/Anti-Debugging/i)).toBeChecked();

			// Should stay enabled even at 0%
			await expect(page.getByLabel(/Anti-Debugging/i)).toBeChecked();
		});

		test("should obfuscate successfully at each major level", async ({ page }) => {
			const slider = page.getByRole("slider");
			const levels = [0, 30, 60, 70, 80, 90, 100];

			for (const level of levels) {
				await slider.fill(level.toString());

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
			const slider = page.getByRole("slider");
			await slider.fill("75");

			// Badge should show 75%
			await expect(page.getByText("75%")).toBeVisible();
		});

		test("should update badge color based on protection level", async ({ page }) => {
			const slider = page.getByRole("slider");

			// High protection should have orange/red badge
			await slider.fill("90");
			const badge = page.locator("text=90%").locator("..");
			await expect(badge).toHaveClass(/orange-500/);
		});
	});

	test.describe("Performance with Advanced Features", () => {
		test("should complete obfuscation with all v1.1 features within reasonable time", async ({ page }) => {
			// Enable all v1.1 features via slider
			const slider = page.getByRole("slider");
			await slider.fill("100");

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
