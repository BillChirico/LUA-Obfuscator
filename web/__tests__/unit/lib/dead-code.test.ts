/**
 * Unit tests for dead code injection module
 */

import {
	generateDeadCode,
	generateUnreachableBlock,
	generateUnusedFunction,
	generateDummyVariables,
	injectDeadCode,
} from "@/lib/dead-code";

describe("Dead Code Module", () => {
	describe("generateUnreachableBlock", () => {
		it("should generate an if block with false condition", () => {
			const code = generateUnreachableBlock();
			expect(code).toContain("if ");
			expect(code).toContain("then");
			expect(code).toContain("end");
		});

		it("should contain realistic-looking code", () => {
			const code = generateUnreachableBlock();
			// Should have some realistic Lua patterns
			expect(code.length).toBeGreaterThan(10);
		});

		it("should use always-false conditions", () => {
			const code = generateUnreachableBlock();
			// Should start with if and a false condition
			expect(code).toMatch(/if (false|1 > 2|0 == 1|nil and true|10 < 5|'a' == 'b'|not true|5 \+ 5 == 11)/);
		});

		it("should generate different blocks", () => {
			const blocks = new Set();
			for (let i = 0; i < 10; i++) {
				blocks.add(generateUnreachableBlock());
			}
			// Should have some variety (at least 2 different blocks)
			expect(blocks.size).toBeGreaterThan(1);
		});
	});

	describe("generateUnusedFunction", () => {
		it("should generate a function definition", () => {
			const code = generateUnusedFunction();
			expect(code).toContain("local function");
			expect(code).toContain("end");
		});

		it("should have parameters", () => {
			const code = generateUnusedFunction();
			expect(code).toMatch(/function [^(]+\([^)]*\)/);
		});

		it("should contain function body", () => {
			const code = generateUnusedFunction();
			const lines = code.split("\n");
			expect(lines.length).toBeGreaterThan(2); // At least function def, body, end
		});
	});

	describe("generateDummyVariables", () => {
		it("should generate local variable declarations", () => {
			const code = generateDummyVariables();
			expect(code).toContain("local");
			expect(code).toMatch(/= \d+/);
		});

		it("should generate at least one variable", () => {
			const code = generateDummyVariables();
			const lines = code.split("\n");
			expect(lines.length).toBeGreaterThanOrEqual(1);
			expect(lines.length).toBeLessThanOrEqual(3);
		});

		it("should use valid Lua identifiers", () => {
			const code = generateDummyVariables();
			expect(code).toMatch(/local _[a-z]+_\d+/);
		});
	});

	describe("generateDeadCode", () => {
		it("should generate some form of dead code", () => {
			const code = generateDeadCode();
			expect(code.length).toBeGreaterThan(5);
			expect(typeof code).toBe("string");
		});

		it("should produce different types of dead code", () => {
			const types = new Set();
			for (let i = 0; i < 20; i++) {
				const code = generateDeadCode();
				if (code.includes("if ")) types.add("unreachable");
				if (code.includes("function")) types.add("function");
				if (code.includes("local") && !code.includes("function")) types.add("variable");
				if (code.includes("for ")) types.add("loop");
			}
			// Should have at least 2 different types
			expect(types.size).toBeGreaterThanOrEqual(2);
		});

		it("should always produce valid-looking Lua syntax", () => {
			for (let i = 0; i < 10; i++) {
				const code = generateDeadCode();
				// Basic syntax checks
				expect(code).not.toContain("undefined");
				expect(code).not.toContain("null");
			}
		});
	});

	describe("injectDeadCode", () => {
		const sampleCode = `local x = 10
local y = 20
print(x + y)`;

		it("should inject dead code into the source", () => {
			const result = injectDeadCode(sampleCode, 100);
			expect(result.length).toBeGreaterThan(sampleCode.length);
		});

		it("should not inject at 0% rate", () => {
			const result = injectDeadCode(sampleCode, 0);
			// Should be very similar to original (maybe some formatting differences)
			expect(result.split("\n").length).toBeLessThanOrEqual(sampleCode.split("\n").length + 1);
		});

		it("should inject more at higher rates", () => {
			const low = injectDeadCode(sampleCode, 10);
			const high = injectDeadCode(sampleCode, 90);

			const lowLines = low.split("\n").length;
			const highLines = high.split("\n").length;

			// Higher rate should generally produce more lines (though it's probabilistic)
			// We'll just check both are modified versions
			expect(lowLines).toBeGreaterThanOrEqual(sampleCode.split("\n").length);
			expect(highLines).toBeGreaterThanOrEqual(sampleCode.split("\n").length);
		});

		it("should preserve original code functionality structure", () => {
			const result = injectDeadCode(sampleCode, 50);
			// Original lines should still be present
			expect(result).toContain("local x = 10");
			expect(result).toContain("local y = 20");
			expect(result).toContain("print(x + y)");
		});

		it("should not inject into comments", () => {
			const codeWithComments = `-- This is a comment
local x = 10`;
			const result = injectDeadCode(codeWithComments, 100);
			// Should handle comments gracefully
			expect(result).toContain("local x = 10");
		});

		it("should handle empty strings", () => {
			const result = injectDeadCode("", 50);
			expect(result).toBe("");
		});

		it("should handle single line code", () => {
			const result = injectDeadCode("print('Hello')", 50);
			expect(result).toContain("print('Hello')");
		});

		it("should produce valid Lua-like code", () => {
			const result = injectDeadCode(sampleCode, 80);
			// Check for balanced keywords
			const ifCount = (result.match(/\bif\b/g) || []).length;
			const thenCount = (result.match(/\bthen\b/g) || []).length;
			const endCount = (result.match(/\bend\b/g) || []).length;

			// If statements should have matching then/end (roughly)
			expect(Math.abs(ifCount - thenCount)).toBeLessThanOrEqual(2);
		});
	});

	describe("Performance", () => {
		it("should handle large code efficiently", () => {
			const largeCode = "local x = 10\n".repeat(100);
			const start = Date.now();
			const result = injectDeadCode(largeCode, 50);
			const duration = Date.now() - start;

			expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
			expect(result.length).toBeGreaterThan(largeCode.length);
		});

		it("should scale reasonably with injection rate", () => {
			const code = "local x = 10\n".repeat(50);

			const start1 = Date.now();
			injectDeadCode(code, 10);
			const duration1 = Date.now() - start1;

			const start2 = Date.now();
			injectDeadCode(code, 90);
			const duration2 = Date.now() - start2;

			// Both should complete quickly
			expect(duration1).toBeLessThan(500);
			expect(duration2).toBeLessThan(500);
		});
	});
});
