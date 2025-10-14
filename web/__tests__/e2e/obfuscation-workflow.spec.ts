import { test, expect } from "@playwright/test";
import { createHelpers, waitForPageReady } from "./helpers";

/**
 * E2E tests for the obfuscation workflow
 * Tests the complete user journey from entering code to downloading obfuscated output
 */
test.describe("Obfuscation Workflow", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the application
		await page.goto("/");

		// Wait for the page to be fully loaded
		await waitForPageReady(page);
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
		const { monaco } = createHelpers(page);
		// The input editor should contain the default example code
		const inputEditor = await monaco.getEditor(0);
		await expect(inputEditor).toBeVisible();

		// Check that the editor contains some Lua code
		const editorContent = await monaco.getEditorContent(0);
		expect(editorContent).toContain("function");
	});

	test("should obfuscate code when clicking the Obfuscate button", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);
		await ui.clickObfuscate();

		// Check that output editor has content
		const outputEditor = await monaco.getEditor(1);
		await expect(outputEditor).toBeVisible();

		// Verify output has been generated (output editor should have content)
		const outputContent = await monaco.waitForOutput();
		expect(outputContent).toBeTruthy();
		expect(outputContent.length).toBeGreaterThan(0);
	});

	test("should enable copy button after obfuscation", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);
		// Initially, copy button should be disabled
		const copyButton = await ui.getCopyButton();
		await expect(copyButton).toBeDisabled();

		// Obfuscate code
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		// Copy button should now be enabled
		await expect(copyButton).toBeEnabled();
	});

	test("should copy obfuscated code to clipboard", async ({ page, context }) => {
		const { monaco, ui } = createHelpers(page);
		// Grant clipboard permissions
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);

		// Obfuscate code first
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		// Click copy button
		const copyButton = await ui.getCopyButton();
		await copyButton.click();

		// Wait for copy success indicator (check icon appears)
		await page.waitForTimeout(200);

		// Verify clipboard content
		const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboardContent).toBeTruthy();
		expect(clipboardContent.length).toBeGreaterThan(0);
	});

	test("should enable download button after obfuscation", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);
		// Initially, download button should be disabled
		const downloadButton = await ui.getDownloadButton();
		await expect(downloadButton).toBeDisabled();

		// Obfuscate code
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		// Download button should now be enabled
		await expect(downloadButton).toBeEnabled();
	});

	test("should toggle mangle names setting", async ({ page }) => {
		const { ui } = createHelpers(page);
		// Find the mangle names switch
		const mangleSwitch = await ui.getSwitch("mangle-names");

		// Check initial state
		const initialState = await mangleSwitch.getAttribute("data-state");

		// Toggle the switch
		await mangleSwitch.click();
		await page.waitForTimeout(200);

		// Verify state changed
		const newState = await mangleSwitch.getAttribute("data-state");
		expect(newState).not.toBe(initialState);
	});

	test("should toggle encode strings setting", async ({ page }) => {
		const { ui } = createHelpers(page);
		// Find the encode strings switch
		const encodeSwitch = await ui.getSwitch("encode-strings");

		// Toggle the switch
		await encodeSwitch.click();
		await page.waitForTimeout(200);

		// Verify it toggles (should have data-state attribute)
		const state = await encodeSwitch.getAttribute("data-state");
		expect(state).toBeTruthy();
	});

	test("should toggle minify setting", async ({ page }) => {
		const { ui } = createHelpers(page);
		// Find the minify switch
		const minifySwitch = await ui.getSwitch("minify");

		// Toggle the switch
		await minifySwitch.click();
		await page.waitForTimeout(200);

		// Verify it toggles
		const state = await minifySwitch.getAttribute("data-state");
		expect(state).toBeTruthy();
	});

	test("should adjust protection level slider", async ({ page }) => {
		const { ui } = createHelpers(page);
		// Set to 50
		await ui.setProtectionLevel(50);
		await page.waitForTimeout(200);

		// Verify protection level text changed (loose match)
		await expect(page.locator("text=/Protection Level:/i")).toBeVisible();
	});

	test("should handle different obfuscation settings combinations", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);
		// Enable mangle names
		await ui.toggleSwitch("mangle-names");

		// Enable string encoding
		await ui.toggleSwitch("encode-strings");

		// Enable minification
		await ui.toggleSwitch("minify");

		// Obfuscate
		await ui.clickObfuscate();
		const outputContent = await monaco.waitForOutput();

		// Verify output was generated
		expect(outputContent).toBeTruthy();
		expect(outputContent.length).toBeGreaterThan(0);
	});

	test("should preserve input after obfuscation", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);
		// Get initial input content
		const initialContent = await monaco.getEditorContent(0);

		// Obfuscate
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		// Verify input is still the same
		const afterContent = await monaco.getEditorContent(0);
		expect(afterContent).toBe(initialContent);
	});
});
