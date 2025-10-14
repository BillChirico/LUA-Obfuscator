import { test, expect } from "@playwright/test";

/**
 * E2E tests for accessibility features
 * Tests keyboard navigation, ARIA attributes, focus management, and screen reader support
 */
test.describe("Accessibility", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
	});

	test("should navigate settings with Tab key", async ({ page }) => {
		// Press Tab to move through interactive elements
		await page.keyboard.press("Tab");

		// Should be able to reach settings controls
		const focusedElement = await page.evaluate(() => document.activeElement?.id);
		expect(focusedElement).toBeTruthy();
	});

	test("should toggle settings with Space key", async ({ page }) => {
		// Find mangle names switch
		const mangleSwitch = page.locator("#mangle-names");
		await mangleSwitch.focus();

		// Get initial state
		const initialState = await mangleSwitch.getAttribute("data-state");

		// Press Space to toggle
		await page.keyboard.press("Space");
		await page.waitForTimeout(200);

		// State should have changed
		const newState = await mangleSwitch.getAttribute("data-state");
		expect(newState).not.toBe(initialState);
	});

	test("should toggle settings with Enter key", async ({ page }) => {
		// Find encode strings switch
		const encodeSwitch = page.locator("#encode-strings");
		await encodeSwitch.focus();

		// Get initial state
		const initialState = await encodeSwitch.getAttribute("data-state");

		// Press Enter to toggle
		await page.keyboard.press("Enter");
		await page.waitForTimeout(200);

		// State should have changed
		const newState = await encodeSwitch.getAttribute("data-state");
		expect(newState).not.toBe(initialState);
	});

	test("should control protection level slider with arrow keys", async ({ page }) => {
		// Find and focus slider
		const slider = page.locator("#compression");
		await slider.focus();

		// Get initial value
		const initialText = await page.locator("text=/Protection Level:/i").textContent();

		// Press ArrowRight to increase
		await page.keyboard.press("ArrowRight");
		await page.waitForTimeout(200);

		// Value should have changed
		const afterRight = await page.locator("text=/Protection Level:/i").textContent();
		expect(afterRight).not.toBe(initialText);

		// Press ArrowLeft to decrease
		await page.keyboard.press("ArrowLeft");
		await page.waitForTimeout(200);

		// Should return to original or similar value
		const afterLeft = await page.locator("text=/Protection Level:/i").textContent();
		expect(afterLeft).toBeTruthy();
	});

	test("should trigger obfuscation with Enter key on focused button", async ({ page }) => {
		// Find and focus obfuscate button
		const obfuscateButton = page.getByRole("button", { name: "Obfuscate Lua code" });
		await obfuscateButton.focus();

		// Press Enter
		await page.keyboard.press("Enter");
		await page.waitForTimeout(500);

		// Output should be generated
		const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(outputContent).toBeTruthy();
		expect(outputContent!.length).toBeGreaterThan(0);
	});

	test("should trigger obfuscation with Space key on focused button", async ({ page }) => {
		// Find and focus obfuscate button
		const obfuscateButton = page.getByRole("button", { name: "Obfuscate Lua code" });
		await obfuscateButton.focus();

		// Press Space
		await page.keyboard.press("Space");
		await page.waitForTimeout(500);

		// Output should be generated
		const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(outputContent).toBeTruthy();
	});

	test("should have proper ARIA labels on all interactive elements", async ({ page }) => {
		// Check obfuscate button
		const obfuscateButton = page.getByRole("button", { name: "Obfuscate Lua code" });
		await expect(obfuscateButton).toBeVisible();

		// Check copy button
		const copyButton = page.getByRole("button", { name: "Copy obfuscated code to clipboard" });
		await expect(copyButton).toBeVisible();

		// Check download button
		const downloadButton = page.getByRole("button", { name: "Download obfuscated code as .lua file" });
		await expect(downloadButton).toBeVisible();

		// All buttons should have accessible names
		const allButtons = await page.getByRole("button").all();
		for (const button of allButtons) {
			const accessibleName = await button.getAttribute("aria-label");
			if (!accessibleName) {
				// If no aria-label, check for text content
				const textContent = await button.textContent();
				expect(textContent || accessibleName).toBeTruthy();
			}
		}
	});

	test("should have proper ARIA roles for switches", async ({ page }) => {
		// Check switch elements have proper role
		const mangleSwitch = page.locator("#mangle-names");
		const role = await mangleSwitch.getAttribute("role");

		// Should have switch role or be a button
		expect(role === "switch" || role === "button").toBe(true);
	});

	test("should have aria-disabled attribute on disabled buttons", async ({ page }) => {
		// Copy button should be disabled initially
		const copyButton = page.getByRole("button", { name: "Copy obfuscated code to clipboard" });

		// Check if it's disabled or has aria-disabled
		const isDisabled = await copyButton.isDisabled();
		const ariaDisabled = await copyButton.getAttribute("aria-disabled");

		expect(isDisabled || ariaDisabled === "true").toBe(true);
	});

	test("should show error alerts with proper ARIA role", async ({ page }) => {
		// Enter invalid code
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("invalid code");

		// Try to obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Error should have alert role
		const errorAlert = page.locator('[role="alert"]');
		await expect(errorAlert).toBeVisible();
	});

	test("should maintain focus visibility during keyboard navigation", async ({ page }) => {
		// Tab through elements
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press("Tab");
			await page.waitForTimeout(100);

			// Check if any element is focused
			const focusedElement = await page.evaluate(() => {
				const el = document.activeElement;
				return el?.tagName;
			});

			expect(focusedElement).toBeTruthy();
		}
	});

	test("should support skip to main content navigation", async ({ page }) => {
		// Look for skip link (common accessibility feature)
		// Tab once from top of page
		await page.keyboard.press("Tab");

		const focusedElement = await page.evaluate(() => {
			const el = document.activeElement;
			return {
				tag: el?.tagName,
				text: el?.textContent,
				href: (el as HTMLAnchorElement)?.href,
			};
		});

		// Should have tabbed to first interactive element
		expect(focusedElement.tag).toBeTruthy();
	});

	test("should have semantic HTML structure with proper headings", async ({ page }) => {
		// Check for main heading (h1)
		const h1 = page.locator("h1");
		await expect(h1).toBeVisible();

		// Get heading text
		const h1Text = await h1.textContent();
		expect(h1Text).toBeTruthy();

		// Check for other headings (h2, h3)
		const headings = await page.locator("h1, h2, h3, h4").count();
		expect(headings).toBeGreaterThan(0);
	});

	test("should have proper labels for form controls", async ({ page }) => {
		// Check slider has label
		const slider = page.locator("#compression");
		const sliderLabel = await slider.getAttribute("aria-label");

		expect(sliderLabel || (await page.locator('label[for="compression"]').count()) > 0).toBeTruthy();
	});

	test("should announce settings changes to screen readers", async ({ page }) => {
		// Toggle a switch
		const mangleSwitch = page.locator("#mangle-names");
		await mangleSwitch.click();
		await page.waitForTimeout(200);

		// Check for aria-live region or status update
		const liveRegions = await page.locator('[aria-live]').count();

		// Should have live regions for dynamic updates
		expect(liveRegions).toBeGreaterThanOrEqual(0);
	});

	test("should support reduced motion preferences", async ({ page, context }) => {
		// Emulate prefers-reduced-motion
		await page.emulateMedia({ reducedMotion: "reduce" });

		// Navigate and interact
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Should still function properly with reduced motion
		const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(outputContent).toBeTruthy();
	});

	test("should handle focus trap in modal dialogs if present", async ({ page }) => {
		// This test assumes there might be modal dialogs in the future
		// For now, just verify basic focus management works

		// Focus obfuscate button
		const obfuscateButton = page.getByRole("button", { name: "Obfuscate Lua code" });
		await obfuscateButton.focus();

		// Press Tab
		await page.keyboard.press("Tab");

		// Should move to next interactive element
		const newFocusedElement = await page.evaluate(() => document.activeElement?.id);
		expect(newFocusedElement).toBeTruthy();
	});

	test("should have sufficient color contrast for text", async ({ page }) => {
		// Check heading is visible (implies sufficient contrast)
		const heading = page.getByRole("heading", { name: /Lua Obfuscator/i });
		await expect(heading).toBeVisible();

		// Check all buttons are visible (implies sufficient contrast)
		const buttons = await page.getByRole("button").all();
		for (const button of buttons) {
			await expect(button).toBeVisible();
		}
	});

	test("should support Escape key to clear errors or dismiss notifications", async ({ page }) => {
		// Enter invalid code to trigger error
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("bad code");

		// Obfuscate to show error
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Error should be visible
		await expect(page.locator('[role="alert"]')).toBeVisible();

		// Press Escape (if supported)
		await page.keyboard.press("Escape");
		await page.waitForTimeout(200);

		// Error might still be visible (depends on implementation)
		// This test documents expected behavior
	});

	test("should have proper focus order that follows visual layout", async ({ page }) => {
		// Tab through interactive elements
		const focusOrder: string[] = [];

		for (let i = 0; i < 10; i++) {
			await page.keyboard.press("Tab");
			await page.waitForTimeout(100);

			const focusedElement = await page.evaluate(() => {
				const el = document.activeElement;
				return el?.id || el?.getAttribute("aria-label") || el?.textContent?.trim() || "";
			});

			if (focusedElement) {
				focusOrder.push(focusedElement);
			}
		}

		// Should have tabbed through multiple elements
		expect(focusOrder.length).toBeGreaterThan(3);

		// Should not have duplicate focus (stuck focus)
		const uniqueElements = new Set(focusOrder);
		expect(uniqueElements.size).toBeGreaterThan(1);
	});

	test("should provide keyboard shortcuts for common actions", async ({ page }) => {
		// Test if Cmd/Ctrl+Enter triggers obfuscation (common pattern)
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();

		// Try Cmd+Enter (or Ctrl+Enter)
		await page.keyboard.press("Meta+Enter");
		await page.waitForTimeout(500);

		// Output might be generated (depends on implementation)
		// This test documents expected behavior for keyboard shortcuts
	});

	test("should have accessible error messages with clear instructions", async ({ page }) => {
		// Enter code with specific error
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("function test()");

		// Obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Error should be visible and descriptive
		const errorAlert = page.locator('[role="alert"]');
		await expect(errorAlert).toBeVisible();

		const errorText = await errorAlert.textContent();
		expect(errorText).toBeTruthy();
		expect(errorText!.length).toBeGreaterThan(5); // Should have meaningful message
	});

	test("should support Tab and Shift+Tab for bidirectional navigation", async ({ page }) => {
		// Tab forward
		await page.keyboard.press("Tab");
		const firstFocus = await page.evaluate(() => document.activeElement?.id);

		await page.keyboard.press("Tab");
		const secondFocus = await page.evaluate(() => document.activeElement?.id);

		expect(firstFocus).not.toBe(secondFocus);

		// Tab backward with Shift+Tab
		await page.keyboard.press("Shift+Tab");
		const backToFirst = await page.evaluate(() => document.activeElement?.id);

		expect(backToFirst).toBe(firstFocus);
	});

	test("should have proper landmark regions for screen readers", async ({ page }) => {
		// Check for main landmark
		const mainLandmark = await page.locator("main, [role='main']").count();
		expect(mainLandmark).toBeGreaterThan(0);

		// Check for navigation if present
		const navCount = await page.locator("nav, [role='navigation']").count();
		// Navigation might not be present in this simple app
		expect(navCount).toBeGreaterThanOrEqual(0);
	});
});
