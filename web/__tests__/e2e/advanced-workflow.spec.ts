import { test, expect } from "@playwright/test";

/**
 * E2E tests for advanced workflows
 * Tests complex user workflows, iterative refinement, and edge cases
 */
test.describe("Advanced Workflows", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
	});

	test("should support iterative obfuscation with increasing protection levels", async ({ page }) => {
		// Clear input and add test code
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type(
			"function fibonacci(n)\n  if n <= 1 then return n end\n  return fibonacci(n-1) + fibonacci(n-2)\nend"
		);

		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		if (sliderBox) {
			// First obfuscation at 20%
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.2, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const output20 = await page.locator(".monaco-editor .view-lines").nth(1).textContent();

			// Second obfuscation at 60%
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.6, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const output60 = await page.locator(".monaco-editor .view-lines").nth(1).textContent();

			// Third obfuscation at 100%
			await page.mouse.click(sliderBox.x + sliderBox.width, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const output100 = await page.locator(".monaco-editor .view-lines").nth(1).textContent();

			// All three outputs should be different
			expect(output20).not.toBe(output60);
			expect(output60).not.toBe(output100);
			expect(output20).not.toBe(output100);

			// All should be valid (non-empty)
			expect(output20!.length).toBeGreaterThan(0);
			expect(output60!.length).toBeGreaterThan(0);
			expect(output100!.length).toBeGreaterThan(0);
		}
	});

	test("should handle complex Lua code with multiple features", async ({ page }) => {
		// Complex Lua code with functions, tables, loops, conditionals
		const complexCode = `
			local inventory = {
				weapons = {},
				items = {},
				capacity = 100
			}

			function inventory:addItem(item, quantity)
				if self.items[item] then
					self.items[item] = self.items[item] + quantity
				else
					self.items[item] = quantity
				end
				return true
			end

			function inventory:getTotal()
				local total = 0
				for _, qty in pairs(self.items) do
					total = total + qty
				end
				return total
			end
		`;

		// Clear and enter complex code
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");

		// Type code line by line
		const lines = complexCode.trim().split("\n");
		for (const line of lines) {
			await page.keyboard.type(line);
			await page.keyboard.press("Enter");
		}

		// Enable all obfuscation techniques
		await page.locator("#mangle-names").click();
		await page.locator("#encode-strings").click();
		await page.locator("#encode-numbers").click();
		await page.locator("#minify").click();

		// Obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(1000); // Allow more time for complex code

		// Output should be generated
		const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(outputContent).toBeTruthy();
		expect(outputContent!.length).toBeGreaterThan(0);
	});

	test("should support copy-modify-reobfuscate workflow", async ({ page, context }) => {
		// Grant clipboard permissions
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);

		// Obfuscate code
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Copy output
		const copyButton = page.getByRole("button", { name: "Copy obfuscated code to clipboard" });
		await copyButton.click();
		await page.waitForTimeout(200);

		// Get clipboard content
		const copiedContent = await page.evaluate(() => navigator.clipboard.readText());
		expect(copiedContent).toBeTruthy();

		// Paste back into input
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.evaluate(content => navigator.clipboard.writeText(content), copiedContent);
		await page.keyboard.press("Meta+V");
		await page.waitForTimeout(300);

		// Modify settings
		await page.locator("#minify").click();

		// Re-obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Should produce new output
		const newOutput = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(newOutput).toBeTruthy();
	});

	test("should handle rapid successive obfuscations without errors", async ({ page }) => {
		// Perform multiple obfuscations quickly
		for (let i = 0; i < 5; i++) {
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(200);
		}

		// Should complete without errors and have output
		const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(outputContent).toBeTruthy();
		expect(outputContent!.length).toBeGreaterThan(0);
	});

	test("should maintain settings across multiple obfuscations", async ({ page }) => {
		// Enable specific settings
		await page.locator("#mangle-names").click();
		await page.locator("#encode-strings").click();

		// Verify they're enabled
		const mangleState1 = await page.locator("#mangle-names").getAttribute("data-state");
		const encodeState1 = await page.locator("#encode-strings").getAttribute("data-state");

		// Obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Settings should remain enabled
		const mangleState2 = await page.locator("#mangle-names").getAttribute("data-state");
		const encodeState2 = await page.locator("#encode-strings").getAttribute("data-state");

		expect(mangleState2).toBe(mangleState1);
		expect(encodeState2).toBe(encodeState1);
	});

	test("should support download after multiple obfuscations", async ({ page }) => {
		// Obfuscate multiple times with different settings
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		await page.locator("#encode-strings").click();
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Download button should be enabled for latest output
		const downloadButton = page.getByRole("button", { name: "Download obfuscated code as .lua file" });
		await expect(downloadButton).toBeEnabled();
	});

	test("should handle switching between valid and invalid code", async ({ page }) => {
		// Start with valid code (default)
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Verify output generated
		const validOutput = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(validOutput).toBeTruthy();

		// Switch to invalid code
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("invalid code @#$");

		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Error should be shown
		await expect(page.locator('[role="alert"]')).toBeVisible();

		// Switch back to valid code
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("local x = 5\nprint(x)");

		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Should work again
		const validOutput2 = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(validOutput2).toBeTruthy();
	});

	test("should handle obfuscation with all settings combinations", async ({ page }) => {
		// Test all possible combinations (2^4 = 16 combinations for 4 toggles, plus slider)
		const settings = ["mangle-names", "encode-strings", "encode-numbers", "minify"];

		// Test a few representative combinations
		const combinations = [
			[true, false, false, false], // Only mangle
			[false, true, false, false], // Only encode strings
			[true, true, false, false], // Mangle + encode strings
			[true, true, true, false], // All except minify
			[true, true, true, true], // All enabled
		];

		for (const combo of combinations) {
			// Reset all toggles
			for (const setting of settings) {
				const toggle = page.locator(`#${setting}`);
				const currentState = await toggle.getAttribute("data-state");
				if (currentState === "checked") {
					await toggle.click();
					await page.waitForTimeout(100);
				}
			}

			// Set combination
			for (let i = 0; i < combo.length; i++) {
				if (combo[i]) {
					await page.locator(`#${settings[i]}`).click();
					await page.waitForTimeout(100);
				}
			}

			// Obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Should produce valid output
			const output = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
			expect(output).toBeTruthy();
			expect(output!.length).toBeGreaterThan(0);
		}
	});

	test("should handle large code input efficiently", async ({ page }) => {
		// Generate large code (100 lines)
		let largeCode = "-- Large Lua code test\n";
		for (let i = 0; i < 50; i++) {
			largeCode += `local var${i} = ${i}\n`;
			largeCode += `function func${i}(x) return x + ${i} end\n`;
		}

		// Clear and enter large code
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");

		// Use evaluate to set editor content directly (faster than typing)
		await page.evaluate(code => {
			const editor = (window as any).monaco?.editor?.getModels()?.[0];
			if (editor) {
				editor.setValue(code);
			}
		}, largeCode);

		await page.waitForTimeout(500);

		// Obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(1500); // Allow more time for large code

		// Should complete and produce output
		const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(outputContent).toBeTruthy();
		expect(outputContent!.length).toBeGreaterThan(0);
	});

	test("should preserve custom code after failed obfuscation", async ({ page }) => {
		// Enter custom code
		const customCode = "local myFunction = function() return 42 end";
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type(customCode);

		// Break it
		await page.keyboard.type("\nlocal broken = ");

		// Try to obfuscate (will fail)
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Error should show
		await expect(page.locator('[role="alert"]')).toBeVisible();

		// Input should still contain the code
		const inputContent = await page.locator(".monaco-editor .view-lines").first().textContent();
		expect(inputContent).toContain("myFunction");
		expect(inputContent).toContain("broken");
	});

	test("should handle workflow with protection level adjustments", async ({ page }) => {
		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		if (sliderBox) {
			// Start at 0%
			await page.mouse.click(sliderBox.x, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Obfuscate (should be identical)
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const output0 = await page.locator(".monaco-editor .view-lines").nth(1).textContent();

			// Move to 50%
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.5, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Re-obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const output50 = await page.locator(".monaco-editor .view-lines").nth(1).textContent();

			// Move to 100%
			await page.mouse.click(sliderBox.x + sliderBox.width, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Re-obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const output100 = await page.locator(".monaco-editor .view-lines").nth(1).textContent();

			// All should be different
			expect(output0).not.toBe(output50);
			expect(output50).not.toBe(output100);
		}
	});

	test("should handle session continuity after browser refresh", async ({ page }) => {
		// Enter custom code
		const customCode = "local sessionTest = true";
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type(customCode);

		// Enable specific settings
		await page.locator("#mangle-names").click();
		await page.locator("#encode-strings").click();

		// Obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Refresh page
		await page.reload();
		await page.waitForLoadState("networkidle");

		// Default code should be restored (or empty)
		// Settings might be restored from localStorage (implementation-dependent)
		const afterRefresh = await page.locator(".monaco-editor .view-lines").first().textContent();
		expect(afterRefresh).toBeTruthy();
	});

	test("should support complete workflow: input → settings → obfuscate → copy → download", async ({
		page,
		context,
	}) => {
		// Grant permissions
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);

		// Step 1: Enter custom code
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");
		await page.keyboard.type("function test()\n  return 'workflow test'\nend");

		// Step 2: Configure settings
		await page.locator("#mangle-names").click();
		await page.locator("#encode-strings").click();

		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();
		if (sliderBox) {
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.7, sliderBox.y + sliderBox.height * 0.5);
		}
		await page.waitForTimeout(200);

		// Step 3: Obfuscate
		await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
		await page.waitForTimeout(500);

		// Verify output exists
		const output = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
		expect(output).toBeTruthy();
		expect(output!.length).toBeGreaterThan(0);

		// Step 4: Copy
		const copyButton = page.getByRole("button", { name: "Copy obfuscated code to clipboard" });
		await copyButton.click();
		await page.waitForTimeout(200);

		// Verify copied
		const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboardContent).toBeTruthy();
		expect(clipboardContent.length).toBeGreaterThan(0);

		// Step 5: Download should be enabled
		const downloadButton = page.getByRole("button", { name: "Download obfuscated code as .lua file" });
		await expect(downloadButton).toBeEnabled();

		// Complete workflow successful
	});

	test("should handle edge case of empty obfuscation output", async ({ page }) => {
		// Clear input completely
		const monaco = page.locator(".monaco-editor").first();
		await monaco.click();
		await page.keyboard.press("Meta+A");
		await page.keyboard.press("Backspace");

		// Try to obfuscate empty input
		const obfuscateButton = page.getByRole("button", { name: "Obfuscate Lua code" });

		// Button should be disabled for empty input
		await expect(obfuscateButton).toBeDisabled();
	});
});
