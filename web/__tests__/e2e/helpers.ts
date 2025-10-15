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
	 * Set the content of the input editor using Monaco API
	 * This is more reliable than keyboard simulation
	 */
	async setInputCode(code: string) {
		// Use Monaco's setValue API directly through the global monaco object
		await this.page.evaluate((newCode) => {
			// Find Monaco editors on the page
			const monacoEditors = (window as any).monaco?.editor?.getEditors?.();
			if (monacoEditors && monacoEditors.length > 0) {
				// Set value on the first editor (input editor)
				monacoEditors[0].setValue(newCode);
				// Trigger change event
				monacoEditors[0].trigger('test', 'editor.action.formatDocument', {});
			} else {
				throw new Error("Monaco editor not found");
			}
		}, code);

		// Wait for React state to update
		await this.page.waitForTimeout(300);
	}

	/**
	 * Get the content of an editor using Monaco API
	 * This preserves newlines and formatting
	 */
	async getEditorContent(index: number = 0): Promise<string> {
		const content = await this.page.evaluate((editorIndex) => {
			const monacoEditors = (window as any).monaco?.editor?.getEditors?.();
			if (monacoEditors && monacoEditors.length > editorIndex) {
				return monacoEditors[editorIndex].getValue();
			}
			return "";
		}, index);
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
	 * Set protection level via slider using DOM manipulation
	 * Radix UI Slider doesn't work well with keyboard/fill approaches in Playwright
	 * so we use page.evaluate() to directly set the aria-valuenow and trigger events
	 */
	async setProtectionLevel(level: number): Promise<void> {
		// Wait for slider to be visible
		const slider = this.page.locator('[role="slider"]').first();
		await slider.waitFor({ state: "visible", timeout: 5000 });
		await slider.scrollIntoViewIfNeeded();
		await this.page.waitForTimeout(100);

		// Use page.evaluate to directly manipulate the slider via DOM
		await this.page.evaluate((targetLevel) => {
			// Find the slider element
			const sliderElement = document.querySelector('[role="slider"]') as HTMLElement;
			if (!sliderElement) {
				throw new Error("Slider element not found");
			}

			// Set the aria-valuenow attribute
			sliderElement.setAttribute("aria-valuenow", targetLevel.toString());

			// Try to trigger React's onChange by dispatching various events
			// These events should trigger Radix UI's internal handlers
			const events = [
				new PointerEvent("pointerdown", { bubbles: true, cancelable: true }),
				new PointerEvent("pointermove", { bubbles: true, cancelable: true }),
				new PointerEvent("pointerup", { bubbles: true, cancelable: true }),
				new Event("change", { bubbles: true }),
				new Event("input", { bubbles: true }),
			];

			events.forEach((event) => sliderElement.dispatchEvent(event));

			// Also try to find and call the React setter if accessible
			// This is a more direct approach but may not always work
			const reactKey = Object.keys(sliderElement).find((key) =>
				key.startsWith("__react")
			);
			if (reactKey) {
				const reactInstance = (sliderElement as any)[reactKey];
				if (reactInstance && reactInstance.return) {
					// Navigate up the fiber tree to find the props with onValueChange
					let fiber = reactInstance;
					while (fiber) {
						if (fiber.memoizedProps && fiber.memoizedProps.onValueChange) {
							// Call the onChange handler directly
							fiber.memoizedProps.onValueChange([targetLevel]);
							break;
						}
						fiber = fiber.return;
					}
				}
			}
		}, level);

		// Wait for React state updates and re-render
		await this.page.waitForTimeout(500);
	}

	/**
	 * Get Select component trigger button by label text
	 * Works with shadcn Select components where Label and Select are siblings
	 */
	async getSelectTrigger(labelText: string): Promise<Locator> {
		const label = this.page.locator(`label:has-text("${labelText}")`);
		await label.waitFor({ state: "visible", timeout: 5000 });

		const container = label.locator("..");
		const trigger = container.locator('button[role="combobox"]').first();
		await trigger.waitFor({ state: "visible", timeout: 5000 });

		return trigger;
	}

	/**
	 * Select an option from a Select component
	 */
	async selectOption(labelText: string, optionText: string): Promise<void> {
		const trigger = await this.getSelectTrigger(labelText);
		await trigger.click();
		await this.page.waitForTimeout(300);

		const option = this.page.getByRole("option", { name: optionText });
		await option.waitFor({ state: "visible", timeout: 5000 });
		await option.click();
		await this.page.waitForTimeout(300);
	}

	/**
	 * Check if a Select component is disabled
	 */
	async isSelectDisabled(labelText: string): Promise<boolean> {
		try {
			const trigger = await this.getSelectTrigger(labelText);
			const disabled = await trigger.getAttribute("disabled");
			const ariaDisabled = await trigger.getAttribute("aria-disabled");
			return disabled !== null || ariaDisabled === "true";
		} catch {
			return true;
		}
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
