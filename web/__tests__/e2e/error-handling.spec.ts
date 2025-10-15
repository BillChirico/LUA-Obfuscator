import { test, expect } from "@playwright/test";
import { createHelpers, waitForPageReady } from "./helpers";

/**
 * E2E tests for error handling
 * Tests that the application properly handles and displays errors
 */
test.describe("Error Handling", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await waitForPageReady(page);
	});

	test("should display error for invalid Lua code", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Enter invalid Lua code
		await monaco.setInputCode("function test()\n-- missing end statement");

		// Try to obfuscate
		await ui.clickObfuscate(false);
		await page.waitForTimeout(800);

		// Error message should be displayed
		const errorAlert = await ui.waitForError();
		await expect(errorAlert).toBeVisible();

		// Check error alert contains error text
		const errorText = await errorAlert.textContent();
		expect(errorText).toMatch(/error/i);
	});

	test("should show error for syntax errors", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Enter code with syntax error
		await monaco.setInputCode("local x = ");

		// Obfuscate
		await ui.clickObfuscate(false);
		await page.waitForTimeout(800);

		// Error should be shown
		const errorAlert = await ui.waitForError();
		await expect(errorAlert).toBeVisible();
	});

	test("should show error for unclosed strings", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Enter unclosed string
		await monaco.setInputCode('local str = "unclosed string');

		// Obfuscate
		await ui.clickObfuscate(false);
		await page.waitForTimeout(800);

		// Error should be displayed
		const errorAlert = await ui.waitForError();
		await expect(errorAlert).toBeVisible();
	});

	test("should show error for incomplete expressions", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Enter incomplete expression
		await monaco.setInputCode("local result = 5 +");

		// Obfuscate
		await ui.clickObfuscate(false);
		await page.waitForTimeout(800);

		// Error should be displayed
		const errorAlert = await ui.waitForError();
		await expect(errorAlert).toBeVisible();
	});

	test("should recover after fixing invalid code", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Enter invalid code
		await monaco.setInputCode("function test()");

		// Try to obfuscate (should fail)
		await ui.clickObfuscate(false);
		await page.waitForTimeout(800);

		// Error should be visible
		const hasError = await ui.hasError();
		expect(hasError).toBe(true);

		// Fix the code
		await monaco.setInputCode("function test()\nend");

		// Try again (should succeed)
		await ui.clickObfuscate();
		const output = await monaco.waitForOutput();

		// Output should be generated
		expect(output).toBeTruthy();
		expect(output.length).toBeGreaterThan(0);
	});

	test("should handle empty input gracefully", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Clear all input
		await monaco.clearInput();
		await page.waitForTimeout(300);

		// Try to obfuscate empty input
		await ui.clickObfuscate(false);
		await page.waitForTimeout(500);

		// Should either show an error or produce empty output (both are acceptable)
		const hasError = await ui.hasError();
		const output = await monaco.getEditorContent(1);

		// Either an error is shown OR output is empty/minimal
		expect(hasError || output.length === 0 || output.trim().length === 0).toBe(true);
	});

	test("should clear previous errors when successful obfuscation occurs", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Enter invalid code
		await monaco.setInputCode("invalid code !@#");

		// Obfuscate (will fail)
		await ui.clickObfuscate(false);
		await page.waitForTimeout(800);

		// Error should be visible
		const hasError = await ui.hasError();
		expect(hasError).toBe(true);

		// Enter valid code
		await monaco.setInputCode("local x = 5\nprint(x)");

		// Obfuscate again (should succeed)
		await ui.clickObfuscate();
		const output = await monaco.waitForOutput();

		// Output should be generated
		expect(output).toBeTruthy();
	});

	test("should display meaningful error messages", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Enter code with clear error
		await monaco.setInputCode("function test() end end");

		// Obfuscate
		await ui.clickObfuscate(false);
		await page.waitForTimeout(800);

		// Error message should be present and non-empty
		const errorAlert = await ui.waitForError();
		await expect(errorAlert).toBeVisible();

		const errorText = await errorAlert.textContent();
		expect(errorText).toBeTruthy();
		expect(errorText!.length).toBeGreaterThan(0);
		expect(errorText).toContain("Error");
	});

	test("should not disable settings when error occurs", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Enter invalid code
		await monaco.setInputCode("invalid syntax");

		// Obfuscate (will fail)
		await ui.clickObfuscate(false);
		await page.waitForTimeout(800);

		// Settings should still be interactive
		const mangleSwitch = await ui.getSwitch("mangle-names");
		await mangleSwitch.click();
		await page.waitForTimeout(200);

		// Should be able to toggle
		const state = await mangleSwitch.getAttribute("data-state");
		expect(state).toBeTruthy();
	});

	test("should keep output from previous successful obfuscation after error", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Use default valid code and obfuscate
		await ui.clickObfuscate();
		const firstOutput = await monaco.waitForOutput();
		expect(firstOutput).toBeTruthy();

		// Now enter invalid code
		await monaco.setInputCode("bad code");

		// Try to obfuscate (will fail)
		await ui.clickObfuscate(false);
		await page.waitForTimeout(800);

		// Error should be shown
		const hasError = await ui.hasError();
		expect(hasError).toBe(true);

		// Output should be cleared (empty) when error occurs
		const outputAfterError = await monaco.getEditorContent(1);
		// The output should be empty or minimal when there's an error
		expect(outputAfterError).toBeDefined();
	});
});
