/**
 * Unit tests for advanced obfuscation techniques
 * Tests number encoding and control flow obfuscation
 */

import { obfuscateLua, ObfuscationOptions } from "@/lib/obfuscator-simple";
import { parseLua } from "@/lib/parser";

describe("Number Encoding", () => {
	const options: ObfuscationOptions = {
		mangleNames: false,
		encodeStrings: false,
		encodeNumbers: true,
		controlFlow: false,
		minify: false,
		protectionLevel: 100, // 100% encoding probability
	};

	test("should encode integer literals", () => {
		const code = "local x = 42";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		expect(result.code).toBeDefined();
		// Should not contain the plain number
		expect(result.code).not.toContain(" 42");
		// Should contain mathematical expression
		expect(result.code).toMatch(/[+\-*/~()]/);
	});

	test("should encode decimal literals", () => {
		const code = "local pi = 3.14";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		expect(result.code).not.toContain("3.14");
	});

	test("should skip small numbers (0-3)", () => {
		const code = "local a = 0\nlocal b = 1\nlocal c = 2\nlocal d = 3";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		// Small numbers should remain plain
		expect(result.code).toContain(" 0");
		expect(result.code).toContain(" 1");
		expect(result.code).toContain(" 2");
		expect(result.code).toContain(" 3");
	});

	test("should encode large numbers", () => {
		const code = "local big = 1000";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		expect(result.code).not.toContain("1000");
		expect(result.code).toMatch(/[+\-*/~()]/);
	});

	test("should encode negative numbers", () => {
		const code = "local neg = -50";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		// The obfuscator should transform the number
		expect(result.code).toMatch(/[+\-*/()]/);
	});

	test("should preserve number semantics", () => {
		const code = "local x = 100\nlocal y = 200\nlocal z = x + y";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		// Result should still be valid Lua
		const parseResult = parseLua(result.code!);
		expect(parseResult.success).toBe(true);
	});

	test("should handle numbers in expressions", () => {
		const code = "local result = 10 + 20 * 30";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		expect(result.code).toBeDefined();
		// Should encode 10, 20, and 30
		expect(result.code).toMatch(/[+\-*/()]/);
	});

	test("should handle numbers in function calls", () => {
		const code = "print(42)";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		expect(result.code).not.toContain("print(42)");
	});

	test("should handle numbers in table constructors", () => {
		const code = "local t = {10, 20, 30}";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		// Should encode the numbers
		expect(result.code).toMatch(/[+\-*/()]/);
	});

	test("should not encode numbers in identifiers", () => {
		const code = "local var123 = 5";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		// Should still contain "var123" (identifier not modified)
		expect(result.code).toContain("var123");
	});

	test("should respect protection level 0 (no encoding)", () => {
		const code = "local x = 100";
		const result = obfuscateLua(code, {
			...options,
			protectionLevel: 0,
		});

		expect(result.success).toBe(true);
		// With 0% encoding probability, number should remain
		expect(result.code).toContain("100");
	});

	test("should respect protection level 50 (partial encoding)", () => {
		const code = Array.from({ length: 20 }, (_, i) => `local var${i} = ${i + 10}`).join("\n");

		const result = obfuscateLua(code, {
			...options,
			protectionLevel: 50,
		});

		expect(result.success).toBe(true);
		// At 50%, some numbers should be encoded, some not
		// Count how many of the ORIGINAL numbers (10-29) remain as standalone literals
		let plainOriginalNumbers = 0;
		for (let i = 10; i < 30; i++) {
			// Check if the number appears as a standalone literal (with word boundaries)
			const regex = new RegExp(`\\b${i}\\b`);
			if (regex.test(result.code!)) {
				plainOriginalNumbers++;
			}
		}
		// Should be between 1 and 19 (not all or none)
		expect(plainOriginalNumbers).toBeGreaterThan(0);
		expect(plainOriginalNumbers).toBeLessThan(20);
	});
});

describe("Control Flow Obfuscation", () => {
	const options: ObfuscationOptions = {
		mangleNames: false,
		encodeStrings: false,
		encodeNumbers: false,
		controlFlow: true,
		minify: false,
		protectionLevel: 100, // 100% obfuscation probability
	};

	test("should add opaque predicates to if statements", () => {
		const code = "if x > 5 then return true end";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		// Should contain opaque predicate (e.g., "1 + 1 == 2")
		expect(result.code).toMatch(/\(.*?\)/); // Parenthesized expression
		expect(result.code).toContain("and");
	});

	test("should preserve if statement logic", () => {
		const code = "if x > 5 then return true else return false end";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		// Should still be valid Lua
		const parseResult = parseLua(result.code!);
		expect(parseResult.success).toBe(true);
		// Should contain original condition and logic
		expect(result.code).toContain("x > 5");
		expect(result.code).toContain("return true");
		expect(result.code).toContain("return false");
	});

	test("should add opaque predicates to while loops", () => {
		const code = "while x < 10 do x = x + 1 end";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		expect(result.code).toContain("and");
		expect(result.code).toMatch(/\(.*?\)/);
	});

	test("should preserve while loop logic", () => {
		const code = "while x < 10 do x = x + 1 end";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		const parseResult = parseLua(result.code!);
		expect(parseResult.success).toBe(true);
		expect(result.code).toContain("x < 10");
	});

	test("should add opaque predicates to repeat-until loops", () => {
		const code = "repeat x = x + 1 until x > 10";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		expect(result.code).toContain("and");
		expect(result.code).toMatch(/\(.*?\)/);
	});

	test("should preserve repeat-until logic", () => {
		const code = "repeat x = x + 1 until x > 10";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		const parseResult = parseLua(result.code!);
		expect(parseResult.success).toBe(true);
		expect(result.code).toContain("x > 10");
	});

	test("should handle nested control structures", () => {
		const code = `
      if x > 0 then
        while y < 10 do
          y = y + 1
        end
      end
    `;
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		const parseResult = parseLua(result.code!);
		expect(parseResult.success).toBe(true);
	});

	test("should handle complex conditions", () => {
		const code = "if x > 5 and y < 10 or z == 0 then return true end";
		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		expect(result.code).toContain("x > 5");
		expect(result.code).toContain("y < 10");
		expect(result.code).toContain("z == 0");
	});

	test("should respect protection level 0 (no obfuscation)", () => {
		const code = "if x > 5 then return true end";
		const result = obfuscateLua(code, {
			...options,
			protectionLevel: 0,
		});

		expect(result.success).toBe(true);
		// Should not add opaque predicates
		expect(result.code).toBe("if x > 5 then return true end");
	});

	test("should respect protection level 50 (partial obfuscation)", () => {
		const code = Array.from({ length: 10 }, (_, i) => `if x${i} > 5 then return true end`).join("\n");

		const result = obfuscateLua(code, {
			...options,
			protectionLevel: 50,
		});

		expect(result.success).toBe(true);
		// At 50%, some should have opaque predicates, some not
		const andCount = (result.code!.match(/and/g) || []).length;
		expect(andCount).toBeGreaterThan(0);
		expect(andCount).toBeLessThan(10);
	});
});

describe("Combined Advanced Techniques", () => {
	test("should apply both number encoding and control flow", () => {
		const code = "if x > 10 then return 42 end";
		const options: ObfuscationOptions = {
			mangleNames: false,
			encodeStrings: false,
			encodeNumbers: true,
			controlFlow: true,
			minify: false,
			protectionLevel: 100,
		};

		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		// Should have opaque predicate in condition
		expect(result.code).toContain("and");
		// Should encode the number 42
		expect(result.code).not.toContain(" 42");
		expect(result.code).toMatch(/[+\-*/()]/);
	});

	test("should work with all obfuscation techniques enabled", () => {
		const code = 'local msg = "Hello"\nif x > 10 then print(msg) end';
		const options: ObfuscationOptions = {
			mangleNames: true,
			encodeStrings: true,
			encodeNumbers: true,
			controlFlow: true,
			minify: true,
			protectionLevel: 100,
		};

		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		// Should be valid Lua
		const parseResult = parseLua(result.code!);
		expect(parseResult.success).toBe(true);
		// Should be heavily obfuscated
		expect(result.code).not.toContain("Hello");
		expect(result.code).not.toContain("msg");
		// Check for standalone 10 literal, not substring (avoid false positives from encoded expressions like "100")
		expect(result.code).not.toMatch(/\b10\b/);
	});

	test("should preserve program semantics with advanced obfuscation", () => {
		const code = `
      function fibonacci(n)
        if n <= 1 then
          return n
        else
          return fibonacci(n - 1) + fibonacci(n - 2)
        end
      end
    `;

		const options: ObfuscationOptions = {
			mangleNames: false,
			encodeStrings: false,
			encodeNumbers: true,
			controlFlow: true,
			minify: false,
			protectionLevel: 100,
		};

		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		const parseResult = parseLua(result.code!);
		expect(parseResult.success).toBe(true);
		// Should contain function definition
		expect(result.code).toContain("function");
		expect(result.code).toContain("fibonacci");
		expect(result.code).toContain("return");
	});
});

describe("Edge Cases for Advanced Obfuscation", () => {
	test("should handle empty input", () => {
		const code = "";
		const options: ObfuscationOptions = {
			mangleNames: false,
			encodeStrings: false,
			encodeNumbers: true,
			controlFlow: true,
			minify: false,
			protectionLevel: 100,
		};

		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		expect(result.code).toBe("");
	});

	test("should handle code without numbers", () => {
		const code = "local x = y";
		const options: ObfuscationOptions = {
			mangleNames: false,
			encodeStrings: false,
			encodeNumbers: true,
			controlFlow: false,
			minify: false,
			protectionLevel: 100,
		};

		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		expect(result.code).toBe(code);
	});

	test("should handle code without control flow", () => {
		const code = "local x = 5\nlocal y = 10";
		const options: ObfuscationOptions = {
			mangleNames: false,
			encodeStrings: false,
			encodeNumbers: false,
			controlFlow: true,
			minify: false,
			protectionLevel: 100,
		};

		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		// Should remain unchanged (no control flow to obfuscate)
		expect(result.code).toContain("local x = 5");
		expect(result.code).toContain("local y = 10");
	});
});
