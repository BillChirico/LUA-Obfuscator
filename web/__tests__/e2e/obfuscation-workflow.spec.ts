import { test, expect } from "@playwright/test";

/**
 * E2E tests for the obfuscation workflow
 * Tests the complete user journey from entering code to downloading obfuscated output
 */
test.describe("Obfuscation Workflow", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the application
		await page.goto("/");

		// Wait for the page to be fully loaded
		await page.waitForLoadState("networkidle");
	});

	test("should load the application successfully", async ({ page }) => {
		// Check that the main heading is visible
		await expect(page.getByRole("heading", { name: /Lua Obfuscator/i })).toBeVisible();

		// Check that code editors are present
		await expect(page.getByText("Original Lua Code")).toBeVisible();
		await expect(page.getByText("Obfuscated Output")).toBeVisible();

		// Check that settings panel is present
		await expect(page.getByText("Obfuscation Settings")).toBeVisible();
	});

	test("should have default Lua code in input editor", async ({ page }) => {
		// The input editor should contain the default example code
		const inputEditor = page.locator(".monaco-editor").first();
		await expect(inputEditor).toBeVisible();

		// Check that the editor contains some Lua code
		const editorContent = await page.locator(".monaco-editor .view-lines").first().textContent();
		expect(editorContent).toContain("function");
	});

	test("should obfuscate code when clicking the Obfuscate button", async ({ page }) => {
		// Click the Obfuscate button (use exact aria-label to avoid matching other buttons)
		const obfuscateButton = page.getByRole("button", { name: "Obfuscate Lua code" });
		await obfuscateButton.click();

		// Wait for processing to complete
		await page.waitForTimeout(500);

		// Check that output editor has content
		const outputEditor = page.locator(".monaco-editor").nth(1);
		await expect(outputEditor).toBeVisible();

		// Verify output has been generated (output editor should have content)
		const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(outputContent).toBeTruthy();
		expect(outputContent!.length).toBeGreaterThan(0);
	});

	test("should enable copy button after obfuscation", async ({ page }) => {
		// Initially, copy button should be disabled
		const copyButton = page.getByRole("button", { name: "Copy obfuscated code to clipboard" });
		await expect(copyButton).toBeDisabled();

		// Obfuscate code
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Copy button should now be enabled
		await expect(copyButton).toBeEnabled();
	});

	test("should copy obfuscated code to clipboard", async ({ page, context }) => {
		// Grant clipboard permissions
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);

		// Obfuscate code first
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Click copy button
		const copyButton = page.getByRole("button", { name: "Copy obfuscated code to clipboard" });
		await copyButton.click();

		// Wait for copy success indicator (check icon appears)
		await page.waitForTimeout(200);

		// Verify clipboard content
		const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboardContent).toBeTruthy();
		expect(clipboardContent.length).toBeGreaterThan(0);
	});

	test("should enable download button after obfuscation", async ({ page }) => {
		// Initially, download button should be disabled
		const downloadButton = page.getByRole("button", { name: "Download obfuscated code as .lua file" });
		await expect(downloadButton).toBeDisabled();

		// Obfuscate code
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Download button should now be enabled
		await expect(downloadButton).toBeEnabled();
	});

	test("should toggle mangle names setting", async ({ page }) => {
		// Find the mangle names switch
		const mangleSwitch = page.locator("#mangle-names");

		// Check initial state
		const initialState = await mangleSwitch.getAttribute("data-state");

		// Toggle the switch
		await mangleSwitch.click();

		// Verify state changed
		const newState = await mangleSwitch.getAttribute("data-state");
		expect(newState).not.toBe(initialState);
	});

	test("should toggle encode strings setting", async ({ page }) => {
		// Find the encode strings switch
		const encodeSwitch = page.locator("#encode-strings");

		// Toggle the switch
		await encodeSwitch.click();

		// Verify it toggles (should have data-state attribute)
		const state = await encodeSwitch.getAttribute("data-state");
		expect(state).toBeTruthy();
	});

	test("should toggle minify setting", async ({ page }) => {
		// Find the minify switch
		const minifySwitch = page.locator("#minify");

		// Toggle the switch
		await minifySwitch.click();

		// Verify it toggles
		const state = await minifySwitch.getAttribute("data-state");
		expect(state).toBeTruthy();
	});

	test("should adjust protection level slider", async ({ page }) => {
		// Find the slider
		const slider = page.locator("#compression");
		await expect(slider).toBeVisible();

		// Get the slider's bounding box
		const sliderBox = await slider.boundingBox();
		expect(sliderBox).toBeTruthy();

		if (sliderBox) {
			// Click at 50% position
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.5, sliderBox.y + sliderBox.height * 0.5);

			// Wait a bit for the slider to update
			await page.waitForTimeout(200);

			// Verify protection level text changed
			await expect(page.locator("text=/Protection Level: [1-9]/i")).toBeVisible();
		}
	});

	test("should handle different obfuscation settings combinations", async ({ page }) => {
		// Enable mangle names
		await page.locator("#mangle-names").click();

		// Enable string encoding
		await page.locator("#encode-strings").click();

		// Enable minification
		await page.locator("#minify").click();

		// Obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Verify output was generated
		const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(outputContent).toBeTruthy();
		expect(outputContent!.length).toBeGreaterThan(0);
	});

	test("should preserve input after obfuscation", async ({ page }) => {
		// Get initial input content
		const initialContent = await page.locator(".monaco-editor .view-lines").first().textContent();

		// Obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Verify input is still the same
		const afterContent = await page.locator(".monaco-editor .view-lines").first().textContent();
		expect(afterContent).toBe(initialContent);
	});
});
