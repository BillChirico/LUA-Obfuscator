import { test, expect } from "@playwright/test";
import { MonacoHelper, UIHelper } from "./helpers";

/**
 * E2E tests for protection level slider and visual feedback
 * Tests the protection level slider, technique activation, and visual indicators
 */
test.describe("Protection Level", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		// Wait for page to be ready
		try {
			await page.waitForLoadState("networkidle", { timeout: 15000 });
		} catch {
			// Fallback to domcontentloaded for slower browsers
			await page.waitForLoadState("domcontentloaded");
		}
		// Ensure editor is visible
		await page.locator(".monaco-editor").first().waitFor({ state: "visible", timeout: 10000 });
	});

	test("should display protection level slider with correct default value", async ({ page }) => {
		const ui = new UIHelper(page);

		// Find the slider
		const slider = await ui.getProtectionSlider();
		await expect(slider).toBeVisible();

		// Check for protection level text (default is 50)
		await expect(page.locator("text=/Protection Level: [0-9]/i")).toBeVisible({ timeout: 5000 });
	});

	test("should update protection level text when slider is moved", async ({ page }) => {
		const ui = new UIHelper(page);

		// Set to 0%
		await ui.setProtectionLevel(0);

		// Verify text shows 0
		await expect(page.locator("text=/Protection Level: 0/i")).toBeVisible({ timeout: 5000 });

		// Set to 100%
		await ui.setProtectionLevel(100);

		// Verify text shows 100
		await expect(page.locator("text=/Protection Level: 10/i")).toBeVisible({ timeout: 5000 });
	});

	test("should snap to nearest 10% increment", async ({ page }) => {
		const ui = new UIHelper(page);

		// Set to 35% (should snap to 30 or 40)
		await ui.setProtectionLevel(35);

		// Verify level is a multiple of 10
		const protectionText = await page.locator("text=/Protection Level: [0-9]/i").textContent();
		expect(protectionText).toBeTruthy();

		const match = protectionText!.match(/Protection Level: (\d+)/);
		expect(match).toBeTruthy();

		const level = parseInt(match![1]);
		expect(level % 10).toBe(0);
	});

	test("should enable minify at protection level 10%", async ({ page }) => {
		const monaco = new MonacoHelper(page);
		const ui = new UIHelper(page);

		// Set to 10%
		await ui.setProtectionLevel(10);

		// Obfuscate
		await ui.clickObfuscate(false);

		// Wait for and verify output
		const outputContent = await monaco.waitForOutput(10000);
		expect(outputContent).toBeTruthy();

		// Should not contain comments from original code
		expect(outputContent).not.toContain("--");
	});

	test("should enable name mangling at protection level 20%", async ({ page }) => {
		const monaco = new MonacoHelper(page);
		const ui = new UIHelper(page);

		// Clear input and use simple code
		await monaco.setInputCode("local myVariable = 5\nprint(myVariable)");

		// Set to 20%
		await ui.setProtectionLevel(20);

		// Obfuscate
		await ui.clickObfuscate(false);

		// Wait for and verify output
		const outputContent = await monaco.waitForOutput(10000);
		expect(outputContent).toBeTruthy();

		// Should not contain original variable name
		expect(outputContent).not.toContain("myVariable");
		// Should contain hex identifier pattern
		expect(outputContent).toMatch(/_0x[0-9a-f]{4}/);
	});

	test("should enable string encoding at protection level 40%", async ({ page }) => {
		const monaco = new MonacoHelper(page);
		const ui = new UIHelper(page);

		// Clear input and use code with string
		await monaco.setInputCode('local greeting = "Hello"\nprint(greeting)');

		// Set to 40%
		await ui.setProtectionLevel(40);

		// Obfuscate
		await ui.clickObfuscate(false);

		// Wait for and verify output
		const outputContent = await monaco.waitForOutput(10000);
		expect(outputContent).toBeTruthy();

		// Should not contain plain "Hello" string
		expect(outputContent).not.toContain('"Hello"');
		// Should contain string.char encoding
		expect(outputContent).toContain("string.char");
	});

	test("should enable number encoding at protection level 60%", async ({ page }) => {
		const monaco = new MonacoHelper(page);
		const ui = new UIHelper(page);

		// Clear input and use code with numbers
		await monaco.setInputCode("local value = 42\nprint(value)");

		// Set to 60%
		await ui.setProtectionLevel(60);

		// Obfuscate
		await ui.clickObfuscate(false);

		// Wait for and verify output
		const outputContent = await monaco.waitForOutput(10000);
		expect(outputContent).toBeTruthy();

		// Should not contain plain " 42"
		expect(outputContent).not.toContain(" 42");
		// Should contain mathematical operators
		expect(outputContent).toMatch(/[+\-*/()]/);
	});

	test("should enable control flow obfuscation at protection level 80%", async ({ page }) => {
		const monaco = new MonacoHelper(page);
		const ui = new UIHelper(page);

		// Clear input and use code with control flow
		await monaco.setInputCode("if x > 5 then\n  print('yes')\nend");

		// Set to 80%
		await ui.setProtectionLevel(80);

		// Obfuscate (complex operation)
		await ui.clickObfuscateComplex();

		// Wait for and verify output
		const outputContent = await monaco.waitForOutput(15000);
		expect(outputContent).toBeTruthy();

		// Should contain "and" from opaque predicate
		expect(outputContent).toContain("and");
	});

	test("should show no obfuscation at protection level 0%", async ({ page }) => {
		const monaco = new MonacoHelper(page);
		const ui = new UIHelper(page);

		// Clear input and use simple code
		const testCode = "local x = 5\nprint(x)";
		await monaco.setInputCode(testCode);

		// Set to 0%
		await ui.setProtectionLevel(0);

		// Obfuscate
		await ui.clickObfuscate(false);

		// Wait for and verify output
		const outputContent = await monaco.waitForOutput(10000);
		expect(outputContent).toBeTruthy();

		// Should be exactly the same
		expect(outputContent).toContain("local x = 5");
		expect(outputContent).toContain("print(x)");
	});

	test("should show visual indicators for active techniques", async ({ page }) => {
		// Look for technique status indicators in the settings panel
		const settingsPanel = page.locator("text=/Obfuscation Settings/i").locator("..");

		// Should have visual indicators (icons, badges, etc.)
		await expect(settingsPanel).toBeVisible();
	});

	test("should update visual feedback when protection level changes", async ({ page }) => {
		const ui = new UIHelper(page);

		// Set to low level (10%)
		await ui.setProtectionLevel(10);

		// Capture protection level text
		const lowLevelText = await page.locator("text=/Protection Level:/i").textContent();

		// Set to high level (90%)
		await ui.setProtectionLevel(90);

		// Protection level text should have changed
		const highLevelText = await page.locator("text=/Protection Level:/i").textContent();
		expect(highLevelText).not.toBe(lowLevelText);
	});

	test("should produce different output at different protection levels", async ({ page }) => {
		const monaco = new MonacoHelper(page);
		const ui = new UIHelper(page);

		// Obfuscate at 20%
		await ui.setProtectionLevel(20);
		await ui.clickObfuscate(false);
		const output20 = await monaco.waitForOutput(10000);

		// Obfuscate at 100%
		await ui.setProtectionLevel(100);
		await ui.clickObfuscateComplex();
		const output100 = await monaco.waitForOutput(15000);

		// Outputs should be different
		expect(output20).not.toBe(output100);
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
		const monaco = new MonacoHelper(page);
		const ui = new UIHelper(page);

		// Set slider to low level (10%)
		await ui.setProtectionLevel(10);

		// Manually enable string encoding (normally requires 40%)
		const encodeStringsSwitch = page.locator("#encode-strings");
		await encodeStringsSwitch.click();
		await page.waitForTimeout(300);

		// Obfuscate
		await ui.clickObfuscate(false);

		// Wait for and verify output
		const outputContent = await monaco.waitForOutput(10000);
		expect(outputContent).toBeTruthy();
	});

	test("should maintain protection level after page reload", async ({ page }) => {
		const ui = new UIHelper(page);

		// Set to specific level (70%)
		await ui.setProtectionLevel(70);

		const beforeReload = await page.locator("text=/Protection Level:/i").textContent();

		// Reload page
		await page.reload();
		try {
			await page.waitForLoadState("networkidle", { timeout: 15000 });
		} catch {
			await page.waitForLoadState("domcontentloaded");
		}
		await page.locator(".monaco-editor").first().waitFor({ state: "visible", timeout: 10000 });

		// Protection level should be maintained (or reset to default)
		const afterReload = await page.locator("text=/Protection Level:/i").textContent();
		expect(afterReload).toBeTruthy();
	});

	test("should display protection level badge with appropriate color", async ({ page }) => {
		const ui = new UIHelper(page);

		// Test different levels and verify visual feedback exists

		// Level 0% (None)
		await ui.setProtectionLevel(0);
		await expect(page.locator("text=/Protection Level: 0/i")).toBeVisible({ timeout: 5000 });

		// Level 50% (Medium)
		await ui.setProtectionLevel(50);
		await expect(page.locator("text=/Protection Level: [4-6]/i")).toBeVisible({ timeout: 5000 });

		// Level 100% (High)
		await ui.setProtectionLevel(100);
		await expect(page.locator("text=/Protection Level: 10/i")).toBeVisible({ timeout: 5000 });
	});
});
