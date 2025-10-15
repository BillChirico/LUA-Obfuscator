import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E browser testing
 * Tests the Lua Obfuscator web application across multiple devices and viewports
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	// Test directory
	testDir: "./__tests__/e2e",

	// Maximum time one test can run for
	// Increased to 60s for complex obfuscation operations (advanced features, edge cases)
	timeout: 60 * 1000,

	// Run tests in files in parallel
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// Retry on CI only
	retries: process.env.CI ? 2 : 0,

	// Limit parallel workers to prevent server overload
	// Use 1 worker on CI, 4 workers locally (was unlimited before)
	// workers: process.env.CI ? 1 : 4,

	// Reporter to use
	reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],

	// Shared settings for all the projects below
	use: {
		// Base URL to use in actions like `await page.goto('/')`
		baseURL: "http://localhost:3000",

		// Collect trace when retrying the failed test
		trace: "on-first-retry",

		// Screenshot on failure
		screenshot: "only-on-failure",

		// Video on first retry
		video: "retain-on-failure",

		// Navigation timeout - increased for slow page loads
		navigationTimeout: 20 * 1000,

		// Action timeout - increased for complex interactions
		actionTimeout: 15 * 1000,
	},

	// Configure projects for major browsers and devices
	projects: [
		{
			name: "Desktop Chrome",
			use: { ...devices["Desktop Chrome"] },
		},

		{
			name: "Desktop Firefox",
			use: { ...devices["Desktop Firefox"] },
		},

		{
			name: "Desktop Safari",
			use: { ...devices["Desktop Safari"] },
		},

		// Mobile viewports
		{
			name: "Mobile Chrome",
			use: { ...devices["Pixel 5"] },
		},

		{
			name: "Mobile Safari",
			use: { ...devices["iPhone 12"] },
		},

		// Tablet viewports
		{
			name: "iPad",
			use: { ...devices["iPad Pro"] },
		},
	],

	// Run your local dev server before starting the tests
	webServer: {
		command: "npm run dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
});
