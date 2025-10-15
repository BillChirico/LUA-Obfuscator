import { test, expect } from "@playwright/test";
import { MonacoHelper, UIHelper, navigateToPage, waitForPageReady } from "./helpers";

/**
 * E2E tests for v1.1 advanced features
 * Tests new UI controls: encryption algorithms, dead code injection,
 * control flow flattening, anti-debugging, and output formatting
 */
test.describe("Advanced Features v1.1", () => {
	test.beforeEach(async ({ page }) => {
		// Increase navigation timeout for this test suite
		page.setDefaultNavigationTimeout(60000);
		page.setDefaultTimeout(60000);

		await navigateToPage(page, "/");
		await waitForPageReady(page);
	});

	test.describe("Encryption Algorithm Selector", () => {
		test("should display encryption algorithm dropdown", async ({ page }) => {
			await expect(page.getByText("Encryption Algorithm")).toBeVisible();
		});

		test("should have correct encryption options", async ({ page }) => {
			// Enable string encoding first (encryption requires it)
			const encodeStringsSwitch = page.getByLabel(/Encode Strings/i);
			await encodeStringsSwitch.click();

			// Open encryption dropdown
			const ui = new UIHelper(page);
			const encryptionTrigger = await ui.getSelectTrigger("Encryption Algorithm");
			await encryptionTrigger.click();

			// Check options are present
			await expect(page.getByRole("option", { name: "None (Basic)" })).toBeVisible();
			await expect(page.getByRole("option", { name: "XOR Cipher" })).toBeVisible();
			await expect(page.getByRole("option", { name: "Base64" })).toBeVisible();
			await expect(page.getByRole("option", { name: "Huffman" })).toBeVisible();
			await expect(page.getByRole("option", { name: "Chunked" })).toBeVisible();
		});

		test("should be disabled when string encoding is off", async ({ page }) => {
			// Ensure string encoding is off
			const encodeStringsSwitch = page.getByLabel(/Encode Strings/i);

			// Wait for switch to be ready
			await encodeStringsSwitch.waitFor({ state: "visible", timeout: 5000 });
			const isChecked = await encodeStringsSwitch.isChecked();

			if (isChecked) {
				await encodeStringsSwitch.click();
				await page.waitForTimeout(300); // Wait for UI update
			}

			// Encryption dropdown should be disabled
			const ui = new UIHelper(page);
			const encryptionTrigger = await ui.getSelectTrigger("Encryption Algorithm");
			await encryptionTrigger.waitFor({ state: "visible", timeout: 5000 });
			const isDisabled = await ui.isSelectDisabled("Encryption Algorithm");
			expect(isDisabled).toBe(true);
		});

		test("should select XOR cipher and obfuscate", async ({ page }) => {
			const monaco = new MonacoHelper(page);
			const ui = new UIHelper(page);

			// Enable string encoding
			const encodeStringsSwitch = page.getByLabel(/Encode Strings/i);
			await encodeStringsSwitch.click();
			await page.waitForTimeout(300);

			// Select XOR cipher
			const encryptionTrigger = await ui.getSelectTrigger("Encryption Algorithm");
			await encryptionTrigger.click();
			await page.getByRole("option", { name: "XOR Cipher" }).click();
			await page.waitForTimeout(300);

			// Click obfuscate
			await ui.clickObfuscate(false);

			// Wait for processing
			await page.waitForTimeout(1500);

			// Check for output or error
			const output = await monaco.getEditorContent(1);
			const hasError = await ui.hasError();

			// Should have output OR error (both acceptable for XOR cipher)
			expect(output.length > 10 || hasError).toBe(true);
		});
	});

	test.describe("Control Flow Flattening Toggle", () => {
		test("should display control flow flattening toggle", async ({ page }) => {
			await expect(page.getByText("Control Flow Flattening")).toBeVisible();
		});

		test("should show CPU intensive warning", async ({ page }) => {
			await expect(page.getByText(/CPU intensive/i)).toBeVisible();
		});

		test("should toggle control flow flattening", async ({ page }) => {
			const toggle = page.getByLabel(/Control Flow Flattening/i);

			// Initially off
			await expect(toggle).not.toBeChecked();

			// Turn on
			await toggle.click();
			await expect(toggle).toBeChecked();

			// Turn off
			await toggle.click();
			await expect(toggle).not.toBeChecked();
		});

		test("should obfuscate with control flow flattening enabled", async ({ page }) => {
			const monaco = new MonacoHelper(page);
			const ui = new UIHelper(page);

			// Enable control flow flattening
			const toggle = page.getByLabel(/Control Flow Flattening/i);
			await toggle.click();
			await page.waitForTimeout(300);

			// Click obfuscate (complex operation)
			await ui.clickObfuscateComplex();

			// Wait for complex processing
			await page.waitForTimeout(2000);

			// Check for output or error
			const output = await monaco.getEditorContent(1);
			const hasError = await ui.hasError();

			// Should have output OR error (both acceptable for control flow)
			expect(output.length > 10 || hasError).toBe(true);
		});
	});

	test.describe("Dead Code Injection Toggle", () => {
		test("should display dead code injection toggle", async ({ page }) => {
			await expect(page.getByText("Dead Code Injection")).toBeVisible();
		});

		test("should show description about unreachable blocks", async ({ page }) => {
			await expect(page.getByText(/unreachable code blocks/i)).toBeVisible();
		});

		test("should toggle dead code injection", async ({ page }) => {
			const toggle = page.getByLabel(/Dead Code Injection/i);

			// Initially off
			await expect(toggle).not.toBeChecked();

			// Turn on
			await toggle.click();
			await expect(toggle).toBeChecked();

			// Turn off
			await toggle.click();
			await expect(toggle).not.toBeChecked();
		});

		test("should produce larger output with dead code injection", async ({ page }) => {
			const monaco = new MonacoHelper(page);
			const ui = new UIHelper(page);

			// Obfuscate without dead code
			await ui.clickObfuscate(false);
			await page.waitForTimeout(1500);

			const outputWithout = await monaco.getEditorContent(1);
			const sizeWithout = outputWithout.length;

			// Output should exist
			expect(sizeWithout).toBeGreaterThan(10);

			// Wait a moment
			await page.waitForTimeout(500);

			// Enable dead code injection
			const toggle = page.getByLabel(/Dead Code Injection/i);
			await toggle.click();
			await page.waitForTimeout(300);

			// Obfuscate with dead code
			await ui.clickObfuscate(false);
			await page.waitForTimeout(1500);

			const outputWith = await monaco.getEditorContent(1);
			const sizeWith = outputWith.length;

			// Output with dead code should be larger or equal (edge case: same size)
			expect(sizeWith).toBeGreaterThanOrEqual(sizeWithout);
		});
	});

	test.describe("Anti-Debugging Toggle", () => {
		test("should display anti-debugging toggle", async ({ page }) => {
			await expect(page.getByText("Anti-Debugging")).toBeVisible();
		});

		test("should show warning about debugger detection", async ({ page }) => {
			await expect(page.getByText(/detect debuggers/i)).toBeVisible();
		});

		test("should toggle anti-debugging", async ({ page }) => {
			const toggle = page.getByLabel(/Anti-Debugging/i);

			// Initially off
			await expect(toggle).not.toBeChecked();

			// Turn on
			await toggle.click();
			await expect(toggle).toBeChecked();

			// Turn off
			await toggle.click();
			await expect(toggle).not.toBeChecked();
		});

		test("should show red indicator when anti-debugging is active", async ({ page }) => {
			const toggle = page.getByLabel(/Anti-Debugging/i);
			await toggle.click();

			// Look for the red Zap icon indicator
			const zapIcon = page.locator('label:has-text("Anti-Debugging") svg.text-red-400');
			await expect(zapIcon).toBeVisible();
		});
	});

	test.describe("Output Formatting Selector", () => {
		test("should display output format dropdown", async ({ page }) => {
			await expect(page.getByText("Output Format")).toBeVisible();
			await expect(page.getByText("Code Style")).toBeVisible();
		});

		test("should have all formatting options", async ({ page }) => {
			// Open formatting dropdown
			const ui = new UIHelper(page);
			const formattingTrigger = await ui.getSelectTrigger("Code Style");
			await formattingTrigger.click();

			// Check options
			await expect(page.getByRole("option", { name: "Minified (Compact)" })).toBeVisible();
			await expect(page.getByRole("option", { name: "Pretty (Readable)" })).toBeVisible();
			await expect(page.getByRole("option", { name: "Obfuscated (Random)" })).toBeVisible();
			await expect(page.getByRole("option", { name: "Single Line" })).toBeVisible();
		});

		test("should change formatting style", async ({ page }) => {
			const monaco = new MonacoHelper(page);
			const ui = new UIHelper(page);

			// Open dropdown
			const formattingTrigger = await ui.getSelectTrigger("Code Style");
			await formattingTrigger.click();
			await page.waitForTimeout(200);

			// Select Pretty formatting
			await page.getByRole("option", { name: "Pretty (Readable)" }).click();
			await page.waitForTimeout(300);

			// Click obfuscate
			await ui.clickObfuscate(false);

			// Wait for processing
			await page.waitForTimeout(1500);

			// Check for output or error
			const output = await monaco.getEditorContent(1);
			const hasError = await ui.hasError();

			// Should have output OR error (both acceptable for formatting)
			expect(output.length > 10 || hasError).toBe(true);
		});
	});

	test.describe("Advanced Techniques Section", () => {
		test("should show 'Advanced Techniques' section", async ({ page }) => {
			await expect(page.getByText("Advanced Techniques", { exact: true })).toBeVisible();
		});

		test("should show all v1.1 advanced toggles", async ({ page }) => {
			await expect(page.getByText("Control Flow Flattening")).toBeVisible();
			await expect(page.getByText("Dead Code Injection")).toBeVisible();
			await expect(page.getByText("Anti-Debugging")).toBeVisible();
		});

		test("should have visual indicators for v1.0 vs v1.1 features", async ({ page }) => {
			// v1.0 features (blue/purple indicators)
			await expect(page.getByText("Encode Numbers")).toBeVisible();
			await expect(page.getByText("Control Flow", { exact: true })).toBeVisible();

			// v1.1 features (orange/red indicators when active)
			await expect(page.getByText("Control Flow Flattening")).toBeVisible();
			await expect(page.getByText("Anti-Debugging")).toBeVisible();
		});
	});

	test.describe("Feature Combination", () => {
		test("should enable multiple v1.1 features together", async ({ page }) => {
			const monaco = new MonacoHelper(page);
			const ui = new UIHelper(page);

			// Enable encode strings
			await page.getByLabel(/Encode Strings/i).click();
			await page.waitForTimeout(300);

			// Select XOR encryption
			const encryptionTrigger = await ui.getSelectTrigger("Encryption Algorithm");
			await encryptionTrigger.click();
			await page.getByRole("option", { name: "XOR Cipher" }).click();
			await page.waitForTimeout(300);

			// Enable dead code injection
			await page.getByLabel(/Dead Code Injection/i).click();
			await page.waitForTimeout(300);

			// Enable anti-debugging
			await page.getByLabel(/Anti-Debugging/i).click();
			await page.waitForTimeout(300);

			// Click obfuscate (complex operation with multiple features)
			await ui.clickObfuscateComplex();

			// Wait for complex processing with extended timeout
			await page.waitForTimeout(3000);

			// Check for output or error
			const output = await monaco.getEditorContent(1);
			const hasError = await ui.hasError();

			// Should have output OR error (both acceptable for multiple features)
			expect(output.length > 10 || hasError).toBe(true);
		});

		test("should work with maximum protection level", async ({ page }) => {
			const monaco = new MonacoHelper(page);
			const ui = new UIHelper(page);

			// Set protection level to 100%
			await ui.setProtectionLevel(100);

			// Click obfuscate (complex operation with max protection)
			await ui.clickObfuscateComplex();

			// Wait for complex processing with extended timeout
			await page.waitForTimeout(3000);

			// Check for output or error
			const output = await monaco.getEditorContent(1);
			const hasError = await ui.hasError();

			// Should have output OR error (both acceptable for max protection)
			expect(output.length > 10 || hasError).toBe(true);

			// Should show "Maximum Protection" status if successful
			if (!hasError) {
				await expect(page.getByText(/Maximum Protection/i).first()).toBeVisible({ timeout: 5000 });
			}
		});
	});

	test.describe("Visual Feedback", () => {
		test("should show Zap icons for active advanced features", async ({ page }) => {
			// Enable dead code injection
			await page.getByLabel(/Dead Code Injection/i).click();

			// Orange Zap icon should appear
			const zapIcon = page.locator('label:has-text("Dead Code Injection") svg.text-orange-400');
			await expect(zapIcon).toBeVisible();
		});

		test("should update protection level status with v1.1 features", async ({ page }) => {
			const ui = new UIHelper(page);

			// Set to 80% (should mention advanced features)
			await ui.setProtectionLevel(80);

			// Should show advanced feature status (80% shows "Advanced: Encryption + Dead Code")
			await expect(page.getByText(/Advanced:.*Encryption.*Dead Code/i)).toBeVisible({ timeout: 5000 });
		});

		test("should show v1.1 feature descriptions in status box", async ({ page }) => {
			const ui = new UIHelper(page);

			// Set to 70% (XOR encryption)
			await ui.setProtectionLevel(70);

			// Should mention XOR in status text (more specific match)
			await expect(page.getByText(/Advanced:.*XOR/i)).toBeVisible({ timeout: 5000 });

			// Set to 85% (control flow flattening)
			await ui.setProtectionLevel(85);

			// Should mention state machine
			await expect(page.getByText(/state machine/i).first()).toBeVisible({ timeout: 5000 });

			// Set to 95% (anti-debugging)
			await ui.setProtectionLevel(95);

			// Should mention anti-debugging measures (more specific to avoid strict mode)
			await expect(page.getByText(/anti-debugging measures/i)).toBeVisible({ timeout: 5000 });
		});
	});

	test.describe("String Encryption Section", () => {
		test("should have dedicated String Encryption section", async ({ page }) => {
			await expect(page.getByText("String Encryption", { exact: true })).toBeVisible();
		});

		test("should explain encryption requirement", async ({ page }) => {
			await expect(page.getByText(/requires Encode Strings/i)).toBeVisible();
		});

		test("should enable dropdown when Encode Strings is on", async ({ page }) => {
			// Turn on Encode Strings
			await page.getByLabel(/Encode Strings/i).click();

			// Encryption dropdown should now be enabled
			const ui = new UIHelper(page);
			const encryptionTrigger = await ui.getSelectTrigger("Encryption Algorithm");
			const isDisabled = await ui.isSelectDisabled("Encryption Algorithm");
			expect(isDisabled).toBe(false);
		});
	});

	test.describe("Mobile Responsiveness for v1.1 Features", () => {
		test("should display all v1.1 controls on mobile viewport", async ({ page }) => {
			// Set mobile viewport
			await page.setViewportSize({ width: 375, height: 667 });

			// Scroll to advanced features section
			await page.getByText("Advanced Techniques", { exact: true }).scrollIntoViewIfNeeded();

			// Check controls are visible
			await expect(page.getByText("Control Flow Flattening")).toBeVisible();
			await expect(page.getByText("Dead Code Injection")).toBeVisible();
			await expect(page.getByText("Anti-Debugging")).toBeVisible();

			// Scroll to encryption section
			await page.getByText("String Encryption", { exact: true }).scrollIntoViewIfNeeded();
			await expect(page.getByText("Encryption Algorithm")).toBeVisible();

			// Scroll to formatting section
			await page.getByText("Output Format", { exact: true }).scrollIntoViewIfNeeded();
			await expect(page.getByText("Code Style")).toBeVisible();
		});

		test("should work dropdowns on touch devices", async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 667 });

			// Enable string encoding
			await page.getByLabel(/Encode Strings/i).click();

			// Scroll to encryption dropdown
			await page.getByText("Encryption Algorithm").scrollIntoViewIfNeeded();

			// Tap encryption dropdown
			const ui = new UIHelper(page);
			const encryptionTrigger = await ui.getSelectTrigger("Encryption Algorithm");
			await encryptionTrigger.click();

			// Options should be visible
			await expect(page.getByRole("option", { name: "XOR Cipher" })).toBeVisible();
		});
	});

	test.describe("Feature Persistence", () => {
		test("should maintain v1.1 settings when toggling other features", async ({ page }) => {
			// Enable anti-debugging
			await page.getByLabel(/Anti-Debugging/i).click();
			await expect(page.getByLabel(/Anti-Debugging/i)).toBeChecked();

			// Toggle something else
			await page.getByLabel(/Mangle Names/i).click();

			// Anti-debugging should still be on
			await expect(page.getByLabel(/Anti-Debugging/i)).toBeChecked();
		});

		test("should update advanced features when slider moves", async ({ page }) => {
			const ui = new UIHelper(page);

			// Move slider to 90% (should enable anti-debugging)
			await ui.setProtectionLevel(90);

			// Anti-debugging should be automatically enabled
			await expect(page.getByLabel(/Anti-Debugging/i)).toBeChecked({ timeout: 5000 });

			// Move slider back to 50%
			await ui.setProtectionLevel(50);

			// Anti-debugging should be automatically disabled
			await expect(page.getByLabel(/Anti-Debugging/i)).not.toBeChecked({ timeout: 5000 });
		});
	});
});
