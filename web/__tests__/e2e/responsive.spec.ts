import { test, expect } from "@playwright/test";

/**
 * E2E tests for responsive design behavior
 * Tests that the application works correctly across different viewport sizes
 */
test.describe("Responsive Design", () => {
	test.describe("Mobile Viewport (iPhone)", () => {
		test.use({ viewport: { width: 390, height: 844 } });

		test("should display mobile layout correctly", async ({ page }) => {
			await page.goto("/");
			await page.waitForLoadState("networkidle");

			// Header should be visible
			await expect(page.getByRole("heading", { name: /Lua Obfuscator/i })).toBeVisible();

			// Code editors should be stacked vertically (both visible)
			const inputEditor = page.locator(".monaco-editor").first();
			const outputEditor = page.locator(".monaco-editor").nth(1);

			await expect(inputEditor).toBeVisible();
			await expect(outputEditor).toBeVisible();

			// Settings panel should be below editors and scrollable
			await expect(page.getByText("Obfuscation Settings")).toBeVisible();
		});

		test("should show buttons with text on mobile", async ({ page }) => {
			await page.goto("/");
			await page.waitForLoadState("networkidle");

			// All buttons should be visible with text labels
			const copyButton = page.getByRole("button", { name: "Copy obfuscated code to clipboard" });
			const downloadButton = page.getByRole("button", { name: "Download obfuscated code as .lua file" });
			const obfuscateButton = page.getByRole("button", { name: "Obfuscate Lua code" });

			await expect(copyButton).toBeVisible();
			await expect(downloadButton).toBeVisible();
			await expect(obfuscateButton).toBeVisible();
		});

		test("should allow obfuscation on mobile", async ({ page }) => {
			await page.goto("/");
			await page.waitForLoadState("networkidle");

			// Click obfuscate button
			const obfuscateButton = page.getByRole("button", { name: "Obfuscate Lua code" });
			await obfuscateButton.click();
			await page.waitForTimeout(500);

			// Output should be generated
			const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
			expect(outputContent).toBeTruthy();
		});

		test("should make settings accessible on mobile", async ({ page }) => {
			await page.goto("/");
			await page.waitForLoadState("networkidle");

			// Settings section should exist below editors
			const settingsHeading = page.getByText("Obfuscation Settings");
			await settingsHeading.scrollIntoViewIfNeeded();
			await expect(settingsHeading).toBeVisible();

			// Settings switches should be interactive
			await expect(page.locator("#mangle-names")).toBeVisible();
			await expect(page.locator("#encode-strings")).toBeVisible();
			await expect(page.locator("#minify")).toBeVisible();
		});
	});

	test.describe("Tablet Viewport (iPad)", () => {
		test.use({ viewport: { width: 768, height: 1024 } });

		test("should display tablet layout correctly", async ({ page }) => {
			await page.goto("/");
			await page.waitForLoadState("networkidle");

			// All main sections should be visible
			await expect(page.getByText("Original Lua Code")).toBeVisible();
			await expect(page.getByText("Obfuscated Output")).toBeVisible();
			await expect(page.getByText("Obfuscation Settings")).toBeVisible();
		});

		test("should show full button text on tablet", async ({ page }) => {
			await page.goto("/");
			await page.waitForLoadState("networkidle");

			// Buttons with full text should be visible
			const copyButton = page.getByRole("button", { name: "Copy obfuscated code to clipboard" });
			const downloadButton = page.getByRole("button", { name: "Download obfuscated code as .lua file" });
			const obfuscateButton = page.getByRole("button", { name: "Obfuscate Lua code" });

			await expect(copyButton).toBeVisible();
			await expect(downloadButton).toBeVisible();
			await expect(obfuscateButton).toBeVisible();
		});

		test("should allow full workflow on tablet", async ({ page, context }) => {
			await page.goto("/");
			await page.waitForLoadState("networkidle");
			await context.grantPermissions(["clipboard-read", "clipboard-write"]);

			// Toggle settings
			await page.locator("#mangle-names").click();
			await page.locator("#minify").click();

			// Obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Verify output
			const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
			expect(outputContent).toBeTruthy();

			// Copy should work
			const copyButton = page.getByRole("button", { name: "Copy obfuscated code to clipboard" });
			await expect(copyButton).toBeEnabled();
			await copyButton.click();

			const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
			expect(clipboardContent).toBeTruthy();
		});
	});

	test.describe("Desktop Viewport", () => {
		test.use({ viewport: { width: 1920, height: 1080 } });

		test("should display desktop layout with side-by-side editors", async ({ page }) => {
			await page.goto("/");
			await page.waitForLoadState("networkidle");

			// All elements should be visible
			await expect(page.getByText("Original Lua Code")).toBeVisible();
			await expect(page.getByText("Obfuscated Output")).toBeVisible();
			await expect(page.getByText("Obfuscation Settings")).toBeVisible();

			// Subtitle should be visible on desktop
			await expect(page.getByText("Professional Lua code protection")).toBeVisible();
		});

		test("should show full UI with all features", async ({ page }) => {
			await page.goto("/");
			await page.waitForLoadState("networkidle");

			// All buttons with full text
			await expect(page.getByRole("button", { name: "Copy obfuscated code to clipboard" })).toBeVisible();
			await expect(page.getByRole("button", { name: "Download obfuscated code as .lua file" })).toBeVisible();
			await expect(page.getByRole("button", { name: "Obfuscate Lua code" })).toBeVisible();

			// All settings visible
			await expect(page.locator("#mangle-names")).toBeVisible();
			await expect(page.locator("#encode-strings")).toBeVisible();
			await expect(page.locator("#encode-numbers")).toBeVisible();
			await expect(page.locator("#control-flow")).toBeVisible();
			await expect(page.locator("#minify")).toBeVisible();
			await expect(page.locator("#compression")).toBeVisible();
		});

		test("should handle full workflow smoothly on desktop", async ({ page, context }) => {
			await page.goto("/");
			await page.waitForLoadState("networkidle");
			await context.grantPermissions(["clipboard-read", "clipboard-write"]);

			// Use protection level slider
			const slider = page.locator("#compression");
			const sliderBox = await slider.boundingBox();
			if (sliderBox) {
				await page.mouse.click(sliderBox.x + sliderBox.width * 0.6, sliderBox.y + sliderBox.height * 0.5);
			}
			await page.waitForTimeout(200);

			// Obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Verify output
			const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
			expect(outputContent).toBeTruthy();
			expect(outputContent!.length).toBeGreaterThan(0);

			// Test copy
			await page.getByRole("button", { name: "Copy obfuscated code to clipboard" }).click();
			const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
			expect(clipboardContent).toBe(outputContent);

			// Download button should be enabled
			await expect(page.getByRole("button", { name: "Download obfuscated code as .lua file" })).toBeEnabled();
		});
	});

	test.describe("Responsive Breakpoints", () => {
		test("should adapt layout at sm breakpoint (640px)", async ({ page }) => {
			await page.setViewportSize({ width: 640, height: 800 });
			await page.goto("/");
			await page.waitForLoadState("networkidle");

			// Subtitle should be visible at sm and above
			await expect(page.getByText("Professional Lua code protection")).toBeVisible();

			// Button text should be visible
			await expect(page.getByRole("button", { name: "Copy obfuscated code to clipboard" })).toBeVisible();
		});

		test("should adapt layout at lg breakpoint (1024px)", async ({ page }) => {
			await page.setViewportSize({ width: 1024, height: 768 });
			await page.goto("/");
			await page.waitForLoadState("networkidle");

			// Desktop-style layout should be active
			await expect(page.getByText("Original Lua Code")).toBeVisible();
			await expect(page.getByText("Obfuscated Output")).toBeVisible();
			await expect(page.getByText("Obfuscation Settings")).toBeVisible();

			// All UI elements functional
			await page.locator("#mangle-names").click();
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
			expect(outputContent).toBeTruthy();
		});

		test("should handle orientation changes", async ({ page }) => {
			// Start in portrait
			await page.setViewportSize({ width: 390, height: 844 });
			await page.goto("/");
			await page.waitForLoadState("networkidle");

			// Verify layout works in portrait
			await expect(page.getByText("Lua Obfuscator")).toBeVisible();

			// Switch to landscape
			await page.setViewportSize({ width: 844, height: 390 });
			await page.waitForTimeout(300);

			// Layout should still work
			await expect(page.getByText("Lua Obfuscator")).toBeVisible();
			await expect(page.getByRole("button", { name: "Obfuscate Lua code" })).toBeVisible();
		});
	});

	test.describe("Touch Interactions", () => {
		test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

		test("should support touch interactions on mobile", async ({ page }) => {
			await page.goto("/");
			await page.waitForLoadState("networkidle");

			// Tap obfuscate button
			await page.locator('[aria-label*="Obfuscate"]').tap();
			await page.waitForTimeout(500);

			// Verify obfuscation worked
			const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
			expect(outputContent).toBeTruthy();
		});

		test("should support touch toggle for switches", async ({ page }) => {
			await page.goto("/");
			await page.waitForLoadState("networkidle");

			// Tap switches
			await page.locator("#mangle-names").tap();
			await page.locator("#encode-strings").tap();

			// Verify they toggled
			const mangleState = await page.locator("#mangle-names").getAttribute("data-state");
			expect(mangleState).toBe("checked");
		});
	});
});
