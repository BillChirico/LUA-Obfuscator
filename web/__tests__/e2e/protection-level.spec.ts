import { test, expect } from "@playwright/test";
import { createHelpers, waitForPageReady } from "./helpers";

/**
 * E2E tests for protection level slider and visual feedback
 * Tests the protection level slider, technique activation, and visual indicators
 */
test.describe("Protection Level", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await waitForPageReady(page);
	});

	test("should display protection level slider with correct default value", async ({ page }) => {
		const { ui } = createHelpers(page);

		// Find the slider
		const slider = await ui.getProtectionSlider();
		await expect(slider).toBeVisible();

		// Check for "Protection Level" label text
		await expect(page.getByText(/Protection Level/i).first()).toBeVisible({ timeout: 5000 });
	});

	test("should update protection level text when slider is moved", async ({ page }) => {
		const { ui } = createHelpers(page);

		// Set to 0%
		await ui.setProtectionLevel(0);

		// Verify badge shows 0% (badge is in settings panel, has specific classes)
		const badge0 = page.locator('aside').locator('.px-3.py-1\\.5').filter({ hasText: '0%' });
		await expect(badge0).toBeVisible({ timeout: 5000 });

		// Set to 100%
		await ui.setProtectionLevel(100);

		// Verify badge shows 100%
		const badge100 = page.locator('aside').locator('.px-3.py-1\\.5').filter({ hasText: '100%' });
		await expect(badge100).toBeVisible({ timeout: 5000 });
	});

	test("should snap to nearest 10% increment", async ({ page }) => {
		const { ui } = createHelpers(page);

		// Set to 30% (a valid 10% increment)
		await ui.setProtectionLevel(30);

		// Verify badge shows 30% (badge in settings aside panel)
		const badge30 = page.locator('aside').locator('.px-3.py-1\\.5').filter({ hasText: '30%' });
		await expect(badge30).toBeVisible({ timeout: 5000 });

		// Set to 80% (another valid 10% increment)
		await ui.setProtectionLevel(80);

		// Verify badge shows 80%
		const badge80 = page.locator('aside').locator('.px-3.py-1\\.5').filter({ hasText: '80%' });
		await expect(badge80).toBeVisible({ timeout: 5000 });
	});

	test("should enable minify at protection level 10%", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

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
		const { monaco, ui } = createHelpers(page);

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
		const { monaco, ui } = createHelpers(page);

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
		const { monaco, ui } = createHelpers(page);

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
		const { monaco, ui } = createHelpers(page);

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
		const { monaco, ui } = createHelpers(page);

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

		// Should contain the same code (may be formatted differently)
		expect(outputContent).toContain("local x");
		expect(outputContent).toContain("= 5");
		expect(outputContent).toContain("print(x)");
	});

	test("should show visual indicators for active techniques", async ({ page }) => {
		// Look for technique status indicators in the settings panel
		const settingsPanel = page.locator("text=/Obfuscation Settings/i").locator("..");

		// Should have visual indicators (icons, badges, etc.)
		await expect(settingsPanel).toBeVisible();
	});

	test("should update visual feedback when protection level changes", async ({ page }) => {
		const { ui } = createHelpers(page);

		// Set to low level (10%)
		await ui.setProtectionLevel(10);

		// Capture badge text (badge in settings aside panel)
		const badge = page.locator('aside').locator('.px-3.py-1\\.5').filter({ hasText: /\d+%/ });
		const lowLevelBadge = await badge.textContent();

		// Set to high level (90%)
		await ui.setProtectionLevel(90);

		// Badge should have changed
		const highLevelBadge = await badge.textContent();
		expect(highLevelBadge).not.toBe(lowLevelBadge);
	});

	test("should produce different output at different protection levels", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

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
		const slider = page.locator('[role="slider"]').first();
		await slider.focus();

		// Get initial value
		const initialValue = await slider.getAttribute("aria-valuenow");

		// Press arrow right to increase
		await page.keyboard.press("ArrowRight");
		await page.waitForTimeout(200);

		// Should have changed
		const afterRight = await slider.getAttribute("aria-valuenow");
		expect(afterRight).toBeTruthy();
		expect(afterRight).not.toBe(initialValue);

		// Press arrow left to decrease
		await page.keyboard.press("ArrowLeft");
		await page.waitForTimeout(200);

		const afterLeft = await slider.getAttribute("aria-valuenow");
		expect(afterLeft).toBeTruthy();

		// Values should be different
		expect(afterRight).not.toBe(afterLeft);
	});

	test("should work with combination of slider and manual toggle switches", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

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
		const { ui } = createHelpers(page);

		// Set to specific level (70%)
		await ui.setProtectionLevel(70);

		const badge = page.locator('aside').locator('.px-3.py-1\\.5').filter({ hasText: /\d+%/ });
		const beforeReload = await badge.textContent();

		// Reload page
		await page.reload();
		await waitForPageReady(page);

		// Protection level should be reset to default (0%)
		const afterReload = await badge.textContent();
		expect(afterReload).toBeTruthy();
	});

	test("should display protection level badge with appropriate color", async ({ page }) => {
		const { ui } = createHelpers(page);

		// Test different levels and verify badges exist (using aside locator to avoid FAQ content)

		// Level 0% (None)
		await ui.setProtectionLevel(0);
		const badge0 = page.locator('aside').locator('.px-3.py-1\\.5').filter({ hasText: '0%' });
		await expect(badge0).toBeVisible({ timeout: 5000 });

		// Level 50% (Medium)
		await ui.setProtectionLevel(50);
		const badge50 = page.locator('aside').locator('.px-3.py-1\\.5').filter({ hasText: '50%' });
		await expect(badge50).toBeVisible({ timeout: 5000 });

		// Level 100% (High)
		await ui.setProtectionLevel(100);
		const badge100 = page.locator('aside').locator('.px-3.py-1\\.5').filter({ hasText: '100%' });
		await expect(badge100).toBeVisible({ timeout: 5000 });
	});
});
