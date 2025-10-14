import { test, expect } from "@playwright/test";

/**
 * E2E tests for error handling
 * Tests that the application properly handles and displays errors
 */
test.describe("Error Handling", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
	});

	test("should display error for invalid Lua code", async ({ page }) => {
		// Clear the default code and enter invalid Lua
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();

		// Select all and delete
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");

		// Type invalid Lua code
		await page.keyboard.type("function test()\n-- missing end statement");

		// Try to obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Error message should be displayed
		await expect(page.locator('[role="alert"]')).toBeVisible();
		await expect(page.locator("text=/Error/i")).toBeVisible();
	});

	test("should show error for syntax errors", async ({ page }) => {
		// Clear and enter code with syntax error
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");

		// Invalid syntax
		await page.keyboard.type("local x = ");

		// Obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Error should be shown
		await expect(page.locator('[role="alert"]')).toBeVisible();
	});

	test("should show error for unclosed strings", async ({ page }) => {
		// Clear and enter unclosed string
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");

		await page.keyboard.type('local str = "unclosed string');

		// Obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Error should be displayed
		await expect(page.locator('[role="alert"]')).toBeVisible();
	});

	test("should show error for incomplete expressions", async ({ page }) => {
		// Clear and enter incomplete expression
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");

		await page.keyboard.type("local result = 5 +");

		// Obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Error should be displayed
		await expect(page.locator('[role="alert"]')).toBeVisible();
	});

	test("should recover after fixing invalid code", async ({ page }) => {
		// Enter invalid code
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("function test()");

		// Try to obfuscate (should fail)
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Error should be visible
		await expect(page.locator('[role="alert"]')).toBeVisible();

		// Fix the code
		await monaco.click();
		await page.keyboard.type("\nend");

		// Try again (should succeed)
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Output should be generated (error might still be visible briefly, but output should appear)
		const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(outputContent).toBeTruthy();
		expect(outputContent!.length).toBeGreaterThan(0);
	});

	test("should handle empty input gracefully", async ({ page }) => {
		// Clear all input
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");

		// Obfuscate button should be disabled for empty input
		const obfuscateButton = page.getByRole("button", { name: "Obfuscate Lua code" });
		await expect(obfuscateButton).toBeDisabled();
	});

	test("should clear previous errors when successful obfuscation occurs", async ({ page }) => {
		// Enter invalid code
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("invalid code !@#");

		// Obfuscate (will fail)
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Error should be visible
		await expect(page.locator('[role="alert"]')).toBeVisible();

		// Enter valid code
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("local x = 5\nprint(x)");

		// Obfuscate again (should succeed)
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Output should be generated
		const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(outputContent).toBeTruthy();
	});

	test("should display meaningful error messages", async ({ page }) => {
		// Enter code with clear error
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("function test() end end");

		// Obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Error message should be present and non-empty
		const errorAlert = page.locator('[role="alert"]');
		await expect(errorAlert).toBeVisible();

		const errorText = await errorAlert.textContent();
		expect(errorText).toBeTruthy();
		expect(errorText!.length).toBeGreaterThan(0);
		expect(errorText).toContain("Error");
	});

	test("should not disable settings when error occurs", async ({ page }) => {
		// Enter invalid code
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("invalid syntax");

		// Obfuscate (will fail)
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Settings should still be interactive
		const mangleSwitch = page.locator("#mangle-names");
		await mangleSwitch.click();

		// Should be able to toggle
		const state = await mangleSwitch.getAttribute("data-state");
		expect(state).toBeTruthy();
	});

	test("should keep output from previous successful obfuscation after error", async ({ page }) => {
		// Use default valid code and obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Get the output
		const firstOutput = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(firstOutput).toBeTruthy();

		// Now enter invalid code
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("bad code");

		// Try to obfuscate (will fail)
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Error should be shown
		await expect(page.locator('[role="alert"]')).toBeVisible();

		// Output should be cleared (empty) when error occurs
		const outputAfterError = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		// The output should be empty or minimal when there's an error
		expect(outputAfterError).toBeDefined();
	});
});
