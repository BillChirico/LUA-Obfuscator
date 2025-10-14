// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

/**
 * Browser API Mocks for Jest Tests
 * Mocks browser-specific APIs that aren't available in jsdom
 */

// Mock navigator.clipboard for copy functionality tests
Object.assign(navigator, {
	clipboard: {
		writeText: jest.fn(() => Promise.resolve()),
		readText: jest.fn(() => Promise.resolve("")),
	},
});

// Mock URL.createObjectURL and URL.revokeObjectURL for download tests
global.URL.createObjectURL = jest.fn(() => "mock-url");
global.URL.revokeObjectURL = jest.fn();

// Mock HTMLAnchorElement click for download tests
HTMLAnchorElement.prototype.click = jest.fn();
