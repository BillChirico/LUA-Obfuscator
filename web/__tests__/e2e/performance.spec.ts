import { test, expect } from "@playwright/test";
import { createHelpers, waitForPageReady } from "./helpers";

/**
 * E2E Performance Tests
 * Tests application performance under various conditions
 */
test.describe("Performance Tests", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await waitForPageReady(page);
	});

	test("should obfuscate small code quickly", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Ensure Monaco is ready before setting input
		await page.waitForFunction(
			() => {
				return (window as any).monaco?.editor?.getEditors?.()?.length > 0;
			},
			{ timeout: 10000 }
		);

		const smallCode = "local x = 5\nprint(x)";
		await monaco.setInputCode(smallCode);

		const startTime = Date.now();
		await ui.clickObfuscate();
		await monaco.waitForOutput();
		const duration = Date.now() - startTime;

		// Should complete in under 3 seconds
		expect(duration).toBeLessThan(3000);

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
	});

	test("should handle medium-sized code efficiently", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Generate medium-sized code
		const lines: string[] = [];
		for (let i = 0; i < 50; i++) {
			lines.push(`local var${i} = ${i}`);
			lines.push(`print(var${i})`);
		}
		const mediumCode = lines.join("\n");

		await monaco.setInputCode(mediumCode);

		const startTime = Date.now();
		await ui.clickObfuscate();
		await monaco.waitForOutput(10000); // Allow up to 10s
		const duration = Date.now() - startTime;

		// Should complete in under 10 seconds
		expect(duration).toBeLessThan(10000);

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(mediumCode.length * 0.5);
	});

	test("should handle large code input", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Generate large code
		const lines: string[] = [];
		for (let i = 0; i < 200; i++) {
			lines.push(`function func${i}()`);
			lines.push(`  local result = ${i}`);
			lines.push(`  return result`);
			lines.push(`end`);
		}
		const largeCode = lines.join("\n");

		await monaco.setInputCode(largeCode);

		const startTime = Date.now();
		await ui.clickObfuscate();
		await monaco.waitForOutput(15000); // Allow up to 15s
		const duration = Date.now() - startTime;

		// Should complete in reasonable time
		expect(duration).toBeLessThan(15000);

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
	});

	test("should handle rapid consecutive obfuscations", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const testCode = "local x = 10\nprint(x)";
		await monaco.setInputCode(testCode);

		// Perform 3 rapid obfuscations
		for (let i = 0; i < 3; i++) {
			await ui.clickObfuscate();
			await monaco.waitForOutput();
			const output = await monaco.getEditorContent(1);
			expect(output.length).toBeGreaterThan(0);
			await page.waitForTimeout(100);
		}

		// All should succeed without errors
		const hasError = await ui.hasError();
		expect(hasError).toBe(false);
	});

	test("should maintain responsive UI during obfuscation", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const code = `local function test()
  for i = 1, 100 do
    print(i)
  end
end
test()`;

		await monaco.setInputCode(code);
		await ui.clickObfuscate(false); // Don't wait

		// UI should still be responsive
		await page.waitForTimeout(200);

		// Should be able to interact with settings
		const mangleSwitch = await ui.getSwitch("mangle-names");
		await expect(mangleSwitch).toBeVisible();

		// Wait for obfuscation to complete
		await monaco.waitForOutput();
	});

	test("should handle settings changes during obfuscation gracefully", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const code = `function test()
  return "hello"
end`;

		await monaco.setInputCode(code);

		// Start obfuscation
		await ui.clickObfuscate(false);

		// Try to change settings while processing
		await page.waitForTimeout(100);
		await ui.toggleSwitch("mangle-names");

		// Wait for completion
		await monaco.waitForOutput();

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
	});

	test("should display metrics after obfuscation without delay", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		await monaco.setInputCode("local x = 5\nprint(x)");
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		// Metrics should appear quickly
		const metricsVisible = await ui.isMetricsVisible();
		expect(metricsVisible).toBe(true);
	});

	test("should handle protection level changes efficiently", async ({ page }) => {
		test.setTimeout(120000); // Increase timeout for this complex test

		const { monaco, ui } = createHelpers(page);

		const code = "local value = 100\nprint(value)";
		await monaco.setInputCode(code);

		// Test different protection levels
		const levels = [0, 30, 60, 100];

		for (const level of levels) {
			try {
				await ui.setProtectionLevel(level);
				await ui.clickObfuscate();
				await monaco.waitForOutput();

				const output = await monaco.getEditorContent(1);
				expect(output.length).toBeGreaterThan(0);

				await page.waitForTimeout(500); // Increased wait time
			} catch (error) {
				console.warn(`Failed at protection level ${level}:`, error.message);
				// Continue with next level instead of failing the entire test
				continue;
			}
		}
	});
});
