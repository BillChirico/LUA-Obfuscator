import { test, expect } from "@playwright/test";

/**
 * E2E tests for v1.1 advanced features
 * Tests new UI controls: encryption algorithms, dead code injection,
 * control flow flattening, anti-debugging, and output formatting
 */
test.describe("Advanced Features v1.1", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
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
			const encryptionTrigger = page.getByLabel("Encryption Algorithm").locator("..").locator("button").first();
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
			const isChecked = await encodeStringsSwitch.isChecked();

			if (isChecked) {
				await encodeStringsSwitch.click();
			}

			// Encryption dropdown should be disabled
			const encryptionTrigger = page.getByLabel("Encryption Algorithm").locator("..").locator("button").first();
			await expect(encryptionTrigger).toBeDisabled();
		});

		test("should select XOR cipher and obfuscate", async ({ page }) => {
			// Enable string encoding
			const encodeStringsSwitch = page.getByLabel(/Encode Strings/i);
			await encodeStringsSwitch.click();

			// Select XOR cipher
			const encryptionTrigger = page.getByLabel("Encryption Algorithm").locator("..").locator("button").first();
			await encryptionTrigger.click();
			await page.getByRole("option", { name: "XOR Cipher" }).click();

			// Click obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Output should be generated
			const outputEditor = page.locator(".monaco-editor").nth(1);
			const outputText = await outputEditor.textContent();
			expect(outputText).toBeTruthy();
			expect(outputText!.length).toBeGreaterThan(0);
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
			// Enable control flow flattening
			const toggle = page.getByLabel(/Control Flow Flattening/i);
			await toggle.click();

			// Click obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Check output is generated
			const outputEditor = page.locator(".monaco-editor").nth(1);
			await expect(outputEditor).toBeVisible();
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
			// Obfuscate without dead code
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const outputEditor = page.locator(".monaco-editor").nth(1);
			const outputWithout = await outputEditor.textContent();
			const sizeWithout = outputWithout?.length || 0;

			// Wait a moment and clear
			await page.waitForTimeout(200);

			// Enable dead code injection
			const toggle = page.getByLabel(/Dead Code Injection/i);
			await toggle.click();

			// Obfuscate with dead code
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const outputWith = await outputEditor.textContent();
			const sizeWith = outputWith?.length || 0;

			// Output with dead code should be larger
			expect(sizeWith).toBeGreaterThan(sizeWithout);
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
			const formattingTrigger = page.getByLabel("Code Style").locator("..").locator("button").first();
			await formattingTrigger.click();

			// Check options
			await expect(page.getByRole("option", { name: "Minified (Compact)" })).toBeVisible();
			await expect(page.getByRole("option", { name: "Pretty (Readable)" })).toBeVisible();
			await expect(page.getByRole("option", { name: "Obfuscated (Random)" })).toBeVisible();
			await expect(page.getByRole("option", { name: "Single Line" })).toBeVisible();
		});

		test("should change formatting style", async ({ page }) => {
			// Open dropdown
			const formattingTrigger = page.getByLabel("Code Style").locator("..").locator("button").first();
			await formattingTrigger.click();

			// Select Pretty formatting
			await page.getByRole("option", { name: "Pretty (Readable)" }).click();

			// Click obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Output should be generated with pretty formatting
			const outputEditor = page.locator(".monaco-editor").nth(1);
			await expect(outputEditor).toBeVisible();
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
			// Enable encode strings
			await page.getByLabel(/Encode Strings/i).click();

			// Select XOR encryption
			const encryptionTrigger = page.getByLabel("Encryption Algorithm").locator("..").locator("button").first();
			await encryptionTrigger.click();
			await page.getByRole("option", { name: "XOR Cipher" }).click();

			// Enable dead code injection
			await page.getByLabel(/Dead Code Injection/i).click();

			// Enable anti-debugging
			await page.getByLabel(/Anti-Debugging/i).click();

			// Click obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(1000); // More time for complex obfuscation

			// Output should be generated
			const outputEditor = page.locator(".monaco-editor").nth(1);
			const outputText = await outputEditor.textContent();
			expect(outputText).toBeTruthy();
			expect(outputText!.length).toBeGreaterThan(100);
		});

		test("should work with maximum protection level", async ({ page }) => {
			// Set protection level to 100%
			const slider = page.getByRole("slider", { name: /Protection Level/i });
			await slider.fill("100");

			// Click obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(1000);

			// Check for success
			const outputEditor = page.locator(".monaco-editor").nth(1);
			await expect(outputEditor).toBeVisible();

			// Should show "Maximum Protection" status
			await expect(page.getByText(/Maximum Protection/i)).toBeVisible();
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
			// Set to 80% (should mention advanced features)
			const slider = page.getByRole("slider", { name: /Protection Level/i });
			await slider.fill("80");

			// Should show advanced feature status
			await expect(page.getByText(/Advanced/i)).toBeVisible();
		});

		test("should show v1.1 feature descriptions in status box", async ({ page }) => {
			// Set to 70% (XOR encryption)
			const slider = page.getByRole("slider", { name: /Protection Level/i });
			await slider.fill("70");

			// Should mention XOR
			await expect(page.getByText(/XOR/i)).toBeVisible();

			// Set to 85% (control flow flattening)
			await slider.fill("85");

			// Should mention state machine
			await expect(page.getByText(/state machine/i)).toBeVisible();

			// Set to 95% (anti-debugging)
			await slider.fill("95");

			// Should mention anti-debugging
			await expect(page.getByText(/anti-debugging/i)).toBeVisible();
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
			const encryptionTrigger = page.getByLabel("Encryption Algorithm").locator("..").locator("button").first();
			await expect(encryptionTrigger).toBeEnabled();
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
			const encryptionTrigger = page.getByLabel("Encryption Algorithm").locator("..").locator("button").first();
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
			// Move slider to 90% (should enable anti-debugging)
			const slider = page.getByRole("slider", { name: /Protection Level/i });
			await slider.fill("90");

			// Anti-debugging should be automatically enabled
			await expect(page.getByLabel(/Anti-Debugging/i)).toBeChecked();

			// Move slider back to 50%
			await slider.fill("50");

			// Anti-debugging should be automatically disabled
			await expect(page.getByLabel(/Anti-Debugging/i)).not.toBeChecked();
		});
	});
});
