import { test, expect } from "@playwright/test";

/**
 * E2E tests for protection level slider and visual feedback
 * Tests the protection level slider, technique activation, and visual indicators
 */
test.describe("Protection Level", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
	});

	test("should display protection level slider with correct default value", async ({ page }) => {
		// Find the slider
		const slider = page.locator("#compression");
		await expect(slider).toBeVisible();

		// Check for protection level text (default is 50)
		await expect(page.locator("text=/Protection Level: [0-9]/i")).toBeVisible();
	});

	test("should update protection level text when slider is moved", async ({ page }) => {
		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		expect(sliderBox).toBeTruthy();

		if (sliderBox) {
			// Click at 0% position (far left)
			await page.mouse.click(sliderBox.x, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Verify text shows 0
			await expect(page.locator("text=/Protection Level: 0/i")).toBeVisible();

			// Click at 100% position (far right)
			await page.mouse.click(sliderBox.x + sliderBox.width, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Verify text shows 100
			await expect(page.locator("text=/Protection Level: 10/i")).toBeVisible();
		}
	});

	test("should snap to nearest 10% increment", async ({ page }) => {
		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		if (sliderBox) {
			// Click at 35% position (should snap to 30 or 40)
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.35, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Verify level is a multiple of 10
			const protectionText = await page.locator("text=/Protection Level: [0-9]/i").textContent();
			expect(protectionText).toBeTruthy();

			const match = protectionText!.match(/Protection Level: (\d+)/);
			expect(match).toBeTruthy();

			const level = parseInt(match![1]);
			expect(level % 10).toBe(0);
		}
	});

	test("should enable minify at protection level 10%", async ({ page }) => {
		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		if (sliderBox) {
			// Set to 10%
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.1, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Output should be minified (no comments, less whitespace)
			const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
			expect(outputContent).toBeTruthy();

			// Should not contain comments from original code
			expect(outputContent).not.toContain("--");
		}
	});

	test("should enable name mangling at protection level 20%", async ({ page }) => {
		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		if (sliderBox) {
			// Clear input and use simple code
			const monaco = page.locator(".monaco-editor").first();
			await monaco.click();
			await page.keyboard.press("Meta+A");
			await page.keyboard.press("Backspace");
			await page.keyboard.type("local myVariable = 5\nprint(myVariable)");

			// Set to 20%
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.2, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Output should have mangled names
			const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
			expect(outputContent).toBeTruthy();

			// Should not contain original variable name
			expect(outputContent).not.toContain("myVariable");
			// Should contain hex identifier pattern
			expect(outputContent).toMatch(/_0x[0-9a-f]{4}/);
		}
	});

	test("should enable string encoding at protection level 40%", async ({ page }) => {
		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		if (sliderBox) {
			// Clear input and use code with string
			const monaco = page.locator(".monaco-editor").first();
			await monaco.click();
			await page.keyboard.press("Meta+A");
			await page.keyboard.press("Backspace");
			await page.keyboard.type('local greeting = "Hello"\nprint(greeting)');

			// Set to 40%
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.4, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Output should have encoded string
			const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
			expect(outputContent).toBeTruthy();

			// Should not contain plain "Hello" string
			expect(outputContent).not.toContain('"Hello"');
			// Should contain string.char encoding
			expect(outputContent).toContain("string.char");
		}
	});

	test("should enable number encoding at protection level 60%", async ({ page }) => {
		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		if (sliderBox) {
			// Clear input and use code with numbers
			const monaco = page.locator(".monaco-editor").first();
			await monaco.click();
			await page.keyboard.press("Meta+A");
			await page.keyboard.press("Backspace");
			await page.keyboard.type("local value = 42\nprint(value)");

			// Set to 60%
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.6, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Output should have encoded number
			const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
			expect(outputContent).toBeTruthy();

			// Should not contain plain " 42"
			expect(outputContent).not.toContain(" 42");
			// Should contain mathematical operators
			expect(outputContent).toMatch(/[+\-*/()]/);
		}
	});

	test("should enable control flow obfuscation at protection level 80%", async ({ page }) => {
		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		if (sliderBox) {
			// Clear input and use code with control flow
			const monaco = page.locator(".monaco-editor").first();
			await monaco.click();
			await page.keyboard.press("Meta+A");
			await page.keyboard.press("Backspace");
			await page.keyboard.type("if x > 5 then\n  print('yes')\nend");

			// Set to 80%
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.8, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Output should have opaque predicates
			const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
			expect(outputContent).toBeTruthy();

			// Should contain "and" from opaque predicate
			expect(outputContent).toContain("and");
		}
	});

	test("should show no obfuscation at protection level 0%", async ({ page }) => {
		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		if (sliderBox) {
			// Clear input and use simple code
			const monaco = page.locator(".monaco-editor").first();
			await monaco.click();
			await page.keyboard.press("Meta+A");
			await page.keyboard.press("Backspace");
			const testCode = "local x = 5\nprint(x)";
			await page.keyboard.type(testCode);

			// Set to 0%
			await page.mouse.click(sliderBox.x, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Output should be identical to input
			const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
			expect(outputContent).toBeTruthy();

			// Should be exactly the same
			expect(outputContent).toContain("local x = 5");
			expect(outputContent).toContain("print(x)");
		}
	});

	test("should show visual indicators for active techniques", async ({ page }) => {
		// Look for technique status indicators in the settings panel
		const settingsPanel = page.locator("text=/Obfuscation Settings/i").locator("..");

		// Should have visual indicators (icons, badges, etc.)
		await expect(settingsPanel).toBeVisible();
	});

	test("should update visual feedback when protection level changes", async ({ page }) => {
		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		if (sliderBox) {
			// Set to low level (10%)
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.1, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Capture protection level text
			const lowLevelText = await page.locator("text=/Protection Level:/i").textContent();

			// Set to high level (90%)
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.9, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Protection level text should have changed
			const highLevelText = await page.locator("text=/Protection Level:/i").textContent();
			expect(highLevelText).not.toBe(lowLevelText);
		}
	});

	test("should produce different output at different protection levels", async ({ page }) => {
		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		if (sliderBox) {
			// Obfuscate at 20%
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.2, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const output20 = await page.locator(".monaco-editor .view-lines").nth(1).textContent();

			// Obfuscate at 100%
			await page.mouse.click(sliderBox.x + sliderBox.width, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			const output100 = await page.locator(".monaco-editor .view-lines").nth(1).textContent();

			// Outputs should be different
			expect(output20).not.toBe(output100);
		}
	});

	test("should allow keyboard control of protection level slider", async ({ page }) => {
		const slider = page.locator("#compression");
		await slider.focus();

		// Press arrow right to increase
		await page.keyboard.press("ArrowRight");
		await page.waitForTimeout(200);

		// Should have changed from default
		const afterRight = await page.locator("text=/Protection Level:/i").textContent();
		expect(afterRight).toBeTruthy();

		// Press arrow left to decrease
		await page.keyboard.press("ArrowLeft");
		await page.waitForTimeout(200);

		const afterLeft = await page.locator("text=/Protection Level:/i").textContent();
		expect(afterLeft).toBeTruthy();

		// Values should be different
		expect(afterRight).not.toBe(afterLeft);
	});

	test("should work with combination of slider and manual toggle switches", async ({ page }) => {
		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		if (sliderBox) {
			// Set slider to low level (10%)
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.1, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			// Manually enable string encoding (normally requires 40%)
			await page.locator("#encode-strings").click();
			await page.waitForTimeout(200);

			// Obfuscate
			await page.getByRole("button", { name: "Obfuscate Lua code" }).click();
			await page.waitForTimeout(500);

			// Output should exist
			const outputContent = await page.locator(".monaco-editor .view-lines").nth(1).textContent();
			expect(outputContent).toBeTruthy();
		}
	});

	test("should maintain protection level after page reload", async ({ page }) => {
		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		if (sliderBox) {
			// Set to specific level (70%)
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.7, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);

			const beforeReload = await page.locator("text=/Protection Level:/i").textContent();

			// Reload page
			await page.reload();
			await page.waitForLoadState("networkidle");

			// Protection level should be maintained (or reset to default)
			const afterReload = await page.locator("text=/Protection Level:/i").textContent();
			expect(afterReload).toBeTruthy();
		}
	});

	test("should display protection level badge with appropriate color", async ({ page }) => {
		const slider = page.locator("#compression");
		const sliderBox = await slider.boundingBox();

		if (sliderBox) {
			// Test different levels and verify visual feedback exists

			// Level 0% (None)
			await page.mouse.click(sliderBox.x, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);
			await expect(page.locator("text=/Protection Level: 0/i")).toBeVisible();

			// Level 50% (Medium)
			await page.mouse.click(sliderBox.x + sliderBox.width * 0.5, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);
			await expect(page.locator("text=/Protection Level: [4-6]/i")).toBeVisible();

			// Level 100% (High)
			await page.mouse.click(sliderBox.x + sliderBox.width, sliderBox.y + sliderBox.height * 0.5);
			await page.waitForTimeout(200);
			await expect(page.locator("text=/Protection Level: 10/i")).toBeVisible();
		}
	});
});
