import { Page, Locator, expect } from "@playwright/test";

/**
 * Test helpers for E2E tests
 * Provides robust utilities for interacting with the application
 */

/**
 * Helper for interacting with Monaco editor
 */
export class MonacoHelper {
	constructor(private page: Page) {}

	/**
	 * Get Monaco editor by index (0 = input, 1 = output)
	 */
	async getEditor(index: number = 0): Promise<Locator> {
		return this.page.locator(".monaco-editor").nth(index);
	}

	/**
	 * Set the content of the input editor
	 */
	async setInputCode(code: string) {
		const editor = await this.getEditor(0);
		await editor.click();
		
		// Wait for editor to be ready
		await this.page.waitForTimeout(200);
		
		// Select all and delete
		const isMac = process.platform === "darwin";
		await this.page.keyboard.press(isMac ? "Meta+A" : "Control+A");
		await this.page.keyboard.press("Backspace");
		
		// Wait a bit for deletion
		await this.page.waitForTimeout(100);
		
		// Type new code
		await this.page.keyboard.type(code, { delay: 10 });
		
		// Wait for typing to complete
		await this.page.waitForTimeout(200);
	}

	/**
	 * Get the content of an editor
	 */
	async getEditorContent(index: number = 0): Promise<string> {
		const editor = await this.getEditor(index);
		const viewLines = editor.locator(".view-lines");
		await viewLines.waitFor({ state: "visible", timeout: 5000 });
		const content = await viewLines.textContent();
		return content || "";
	}

	/**
	 * Wait for output to be generated
	 * @param timeout Maximum time to wait in milliseconds (default 10000ms for complex operations)
	 */
	async waitForOutput(timeout: number = 10000): Promise<string> {
		await this.page.waitForTimeout(500); // Initial wait
		
		let retries = Math.floor(timeout / 500);
		while (retries > 0) {
			const content = await this.getEditorContent(1);
			if (content && content.length > 10) {
				return content;
			}
			await this.page.waitForTimeout(500);
			retries--;
		}
		
		throw new Error("Timeout waiting for output");
	}

	/**
	 * Clear the input editor
	 */
	async clearInput() {
		const editor = await this.getEditor(0);
		await editor.click();
		await this.page.waitForTimeout(100);
		
		const isMac = process.platform === "darwin";
		await this.page.keyboard.press(isMac ? "Meta+A" : "Control+A");
		await this.page.keyboard.press("Backspace");
		await this.page.waitForTimeout(200);
	}
}

/**
 * Helper for common UI interactions
 */
export class UIHelper {
	constructor(private page: Page) {}

	/**
	 * Click the obfuscate button and wait for processing
	 * @param waitForOutput Whether to wait for obfuscation to complete
	 */
	async clickObfuscate(waitForOutput: boolean = true): Promise<void> {
		// Use exact name to avoid strict mode violations
		const button = this.page.getByRole("button", { name: "Obfuscate Lua code" }).first();
		await button.click();
		
		if (waitForOutput) {
			// Wait for loading state to appear and disappear
			await this.page.waitForTimeout(1000);
		}
	}

	/**
	 * Click obfuscate button for complex operations (longer timeout)
	 * Use for advanced features, large code, or edge cases
	 */
	async clickObfuscateComplex(): Promise<void> {
		const button = this.page.getByRole("button", { name: "Obfuscate Lua code" }).first();
		await button.click();
		// Wait longer for complex operations
		await this.page.waitForTimeout(2000);
	}

	/**
	 * Get a toggle switch by ID
	 */
	async getSwitch(id: string): Promise<Locator> {
		return this.page.locator(`#${id}`);
	}

	/**
	 * Toggle a switch and wait for state change
	 */
	async toggleSwitch(id: string): Promise<void> {
		const switchElement = await this.getSwitch(id);
		const initialState = await switchElement.getAttribute("data-state");
		
		await switchElement.click();
		await this.page.waitForTimeout(300);
		
		// Verify state changed
		const newState = await switchElement.getAttribute("data-state");
		if (newState === initialState) {
			throw new Error(`Switch ${id} state did not change`);
		}
	}

	/**
	 * Get the protection level slider
	 */
	async getProtectionSlider(): Promise<Locator> {
		return this.page.locator("#compression");
	}

	/**
	 * Set protection level via slider
	 */
	async setProtectionLevel(level: number): Promise<void> {
		const slider = await this.getProtectionSlider();
		await slider.fill(level.toString());
		await this.page.waitForTimeout(300);
	}

	/**
	 * Wait for and get error alert
	 */
	async waitForError(timeout: number = 3000): Promise<Locator> {
		// Get the first visible alert (there might be multiple toast/alert containers)
		const alert = this.page.locator('[role="alert"]').first();
		await alert.waitFor({ state: "visible", timeout });
		return alert;
	}

	/**
	 * Check if error is visible
	 */
	async hasError(): Promise<boolean> {
		try {
			// Check if any alert is visible
			const alert = this.page.locator('[role="alert"]').first();
			const visible = await alert.isVisible({ timeout: 1000 });
			if (!visible) return false;
			
			// Check if it has error-related content
			const text = await alert.textContent();
			return text ? text.length > 0 : false;
		} catch {
			return false;
		}
	}

	/**
	 * Get copy button
	 */
	async getCopyButton(): Promise<Locator> {
		return this.page.getByRole("button", { name: /Copy/i });
	}

	/**
	 * Get download button
	 */
	async getDownloadButton(): Promise<Locator> {
		return this.page.getByRole("button", { name: /Download/i });
	}

	/**
	 * Check if metrics card is visible
	 */
	async isMetricsVisible(): Promise<boolean> {
		try {
			const metrics = this.page.locator("text=/Obfuscation Metrics/i");
			return await metrics.isVisible({ timeout: 2000 });
		} catch {
			return false;
		}
	}
}

/**
 * Create test helpers for a page
 */
export function createHelpers(page: Page) {
	return {
		monaco: new MonacoHelper(page),
		ui: new UIHelper(page),
	};
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageReady(page: Page): Promise<void> {
	try {
		// Try networkidle first (works on most browsers)
		await page.waitForLoadState("networkidle", { timeout: 10000 });
	} catch {
		// Fallback for browsers that don't support networkidle well (Safari/Firefox)
		await page.waitForLoadState("domcontentloaded");
	}
	
	// Wait for Monaco editor to be present
	try {
		await page.locator(".monaco-editor").first().waitFor({ state: "visible", timeout: 5000 });
	} catch {
		// Monaco might not be immediately visible, that's ok
	}
	
	// Additional buffer for initialization
	await page.waitForTimeout(800);
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retry<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	delayMs: number = 1000
): Promise<T> {
	let lastError: Error | undefined;
	
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			if (i < maxRetries - 1) {
				await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
			}
		}
	}
	
	throw lastError || new Error("Retry failed");
}
