/**
 * Unit tests for formatter module
 */

import {
	formatCode,
	addBlankLinesBetweenFunctions,
	formatWithIndent,
	normalizeLineEndings,
	type FormattingStyle,
} from "@/lib/formatter";

describe("Formatter Module", () => {
	const sampleCode = `local function greet(name)
  print("Hello, " .. name)
end

local x = 10
print(x)`;

	const minimalCode = `local x=10 print(x)`;

	const codeWithComments = `-- This is a comment
local x = 10  -- inline comment
--[[ multi-line
comment ]]
print(x)`;

	describe("formatCode", () => {
		it("should format with minified style by default", () => {
			const result = formatCode(sampleCode);
			expect(result.length).toBeLessThanOrEqual(sampleCode.length);
		});

		it("should respect style parameter", () => {
			const minified = formatCode(sampleCode, { style: "minified" });
			const pretty = formatCode(sampleCode, { style: "pretty" });

			expect(minified.length).toBeLessThan(pretty.length);
		});

		it("should handle all formatting styles", () => {
			const styles: FormattingStyle[] = ["minified", "pretty", "obfuscated", "single-line"];

			styles.forEach(style => {
				const result = formatCode(sampleCode, { style });
				expect(result).toBeTruthy();
				expect(result.length).toBeGreaterThan(0);
			});
		});
	});

	describe("Minified Formatting", () => {
		it("should remove comments", () => {
			const result = formatCode(codeWithComments, { style: "minified" });
			expect(result).not.toContain("--");
			expect(result).not.toContain("comment");
		});

		it("should remove extra blank lines", () => {
			const result = formatCode("local x = 10\n\n\nprint(x)", { style: "minified" });
			// Should not have consecutive blank lines
			expect(result).not.toContain("\n\n");
		});

		it("should remove blank lines", () => {
			const result = formatCode("local x = 10\n\n\nprint(x)", { style: "minified" });
			const lines = result.split("\n").filter(l => l.trim() === "");
			expect(lines.length).toBe(0);
		});

		it("should preserve code structure", () => {
			const result = formatCode(sampleCode, { style: "minified" });
			expect(result).toContain("local function");
			expect(result).toContain("print");
		});
	});

	describe("Pretty Formatting", () => {
		it("should add proper indentation to multi-line code", () => {
			const result = formatCode(sampleCode, { style: "pretty" });
			const lines = result.split("\n");
			// Should maintain multiple lines
			expect(lines.length).toBeGreaterThan(1);
		});

		it("should respect indent size option", () => {
			const result2 = formatCode(sampleCode, { style: "pretty", indentSize: 2 });
			const result4 = formatCode(sampleCode, { style: "pretty", indentSize: 4 });

			// 4-space indent should be longer
			expect(result4.length).toBeGreaterThanOrEqual(result2.length);
		});

		it("should handle tab indentation", () => {
			const result = formatCode(sampleCode, { style: "pretty", indentChar: "tab" });
			expect(result).toContain("\t");
		});

		it("should handle space indentation", () => {
			const result = formatCode(sampleCode, { style: "pretty", indentChar: "space" });
			expect(result).toMatch(/^\s+/m); // Should have leading spaces on some lines
		});

		it("should indent function bodies when code has newlines", () => {
			const code = "function test()\n  print('x')\nend";
			const result = formatCode(code, { style: "pretty" });
			expect(result).toContain("function test()");
			expect(result).toContain("print");
		});
	});

	describe("Obfuscated Formatting", () => {
		it("should add random whitespace", () => {
			const result = formatCode(sampleCode, { style: "obfuscated" });
			// Obfuscated should have inconsistent spacing
			expect(result).toBeTruthy();
		});

		it("should be different from minified", () => {
			const obfuscated = formatCode(sampleCode, { style: "obfuscated" });
			const minified = formatCode(sampleCode, { style: "minified" });

			// Obfuscated typically longer due to random spacing
			expect(obfuscated.length).toBeGreaterThanOrEqual(minified.length);
		});

		it("should vary between runs", () => {
			const results = new Set();
			for (let i = 0; i < 5; i++) {
				results.add(formatCode(sampleCode, { style: "obfuscated" }));
			}
			// Should have some variation due to randomness
			expect(results.size).toBeGreaterThan(1);
		});
	});

	describe("Single-Line Formatting", () => {
		it("should put everything on one line", () => {
			const result = formatCode(sampleCode, { style: "single-line" });
			const lines = result.split("\n");
			expect(lines.length).toBe(1);
		});

		it("should remove comments", () => {
			const result = formatCode(codeWithComments, { style: "single-line" });
			expect(result).not.toContain("--");
		});

		it("should preserve code keywords", () => {
			const result = formatCode(sampleCode, { style: "single-line" });
			expect(result).toContain("local");
			expect(result).toContain("function");
			expect(result).toContain("print");
		});

		it("should use spaces as separators", () => {
			const result = formatCode("local x = 10\nprint(x)", { style: "single-line" });
			expect(result).toContain(" ");
		});
	});

	describe("addBlankLinesBetweenFunctions", () => {
		const multipleFunctions = `function a()
end
function b()
end`;

		it("should add blank lines between functions", () => {
			const result = addBlankLinesBetweenFunctions(multipleFunctions);
			expect(result).toContain("end\n\nfunction");
		});

		it("should not add excessive blank lines", () => {
			const result = addBlankLinesBetweenFunctions(multipleFunctions);
			expect(result).not.toContain("\n\n\n");
		});

		it("should handle code without functions", () => {
			const code = "local x = 10\nprint(x)";
			const result = addBlankLinesBetweenFunctions(code);
			expect(result).toBe(code);
		});
	});

	describe("formatWithIndent", () => {
		it("should add indent to all lines", () => {
			const result = formatWithIndent("local x = 10\nprint(x)", 2, "space");
			const lines = result.split("\n");
			lines.forEach(line => {
				if (line.trim()) {
					expect(line).toMatch(/^\s{4}/); // 2 levels * 2 spaces
				}
			});
		});

		it("should use tabs when specified", () => {
			const result = formatWithIndent("local x = 10", 1, "tab");
			expect(result).toMatch(/^\t/);
		});

		it("should use spaces by default", () => {
			const result = formatWithIndent("local x = 10", 1);
			expect(result).toMatch(/^  /);
		});

		it("should handle empty lines", () => {
			const result = formatWithIndent("local x = 10\n\nprint(x)", 1);
			const lines = result.split("\n");
			expect(lines[1]).toBe(""); // Empty line should stay empty
		});
	});

	describe("normalizeLineEndings", () => {
		it("should convert CRLF to LF", () => {
			const result = normalizeLineEndings("line1\r\nline2\r\nline3");
			expect(result).toBe("line1\nline2\nline3");
		});

		it("should convert CR to LF", () => {
			const result = normalizeLineEndings("line1\rline2\rline3");
			expect(result).toBe("line1\nline2\nline3");
		});

		it("should leave LF unchanged", () => {
			const result = normalizeLineEndings("line1\nline2\nline3");
			expect(result).toBe("line1\nline2\nline3");
		});

		it("should handle mixed line endings", () => {
			const result = normalizeLineEndings("line1\nline2\r\nline3\rline4");
			expect(result).toBe("line1\nline2\nline3\nline4");
		});
	});

	describe("Edge Cases", () => {
		it("should handle empty string", () => {
			const styles: FormattingStyle[] = ["minified", "pretty", "obfuscated", "single-line"];
			styles.forEach(style => {
				const result = formatCode("", { style });
				expect(result).toBe("");
			});
		});

		it("should handle code with only whitespace", () => {
			const result = formatCode("   \n  \n   ", { style: "minified" });
			expect(result.trim()).toBe("");
		});

		it("should handle code with only comments", () => {
			const result = formatCode("-- comment\n-- another", { style: "minified" });
			expect(result.trim().length).toBe(0);
		});

		it("should preserve string literals when minifying", () => {
			const code = 'local x = "-- not a comment"';
			const result = formatCode(code, { style: "minified" });
			expect(result).toContain("-- not a comment");
		});
	});
});
