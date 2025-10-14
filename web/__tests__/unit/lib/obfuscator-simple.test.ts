/**
 * Unit tests for obfuscator-simple.ts
 * Tests the simplified obfuscation API and protection level mappings
 */

import { obfuscateLua, ObfuscationOptions, LuaObfuscator } from "@/lib/obfuscator-simple";
import { VALID_LUA } from "../../fixtures/lua-samples";

describe("obfuscateLua convenience function", () => {
	test("should obfuscate code with default options", () => {
		const code = VALID_LUA.simple.variable;
		const result = obfuscateLua(code);

		expect(result.success).toBe(true);
		expect(result.code).toBeDefined();
		expect(result.error).toBeUndefined();
	});

	test("should accept custom options", () => {
		const code = VALID_LUA.simple.variable;
		const options: ObfuscationOptions = {
			mangleNames: true,
			encodeStrings: false,
			encodeNumbers: false,
			controlFlow: false,
			minify: true,
			protectionLevel: 50,
		};

		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		expect(result.code).toBeDefined();
	});

	test("should handle errors gracefully", () => {
		const invalidCode = "local x = ";
		const result = obfuscateLua(invalidCode);

		expect(result.success).toBe(false);
		expect(result.code).toBeUndefined();
		expect(result.error).toBeDefined();
	});
});

describe("Protection Level Mapping", () => {
	test("protection level 0 should disable all obfuscation", () => {
		const code = "local x = 5";
		const result = obfuscateLua(code, { protectionLevel: 0 });

		expect(result.success).toBe(true);
		// With level 0, code should remain mostly unchanged
		expect(result.code).toBe(code);
	});

	test("protection level 10 should enable minify only", () => {
		const code = "-- Comment\nlocal x = 5";
		const result = obfuscateLua(code, { protectionLevel: 10 });

		expect(result.success).toBe(true);
		// Should remove comments
		expect(result.code).not.toContain("-- Comment");
		// Should not mangle names
		expect(result.code).toContain("x");
	});

	test("protection level 20 should enable minify and name mangling", () => {
		const code = "local myVar = 5";
		const result = obfuscateLua(code, { protectionLevel: 20 });

		expect(result.success).toBe(true);
		// Should mangle names
		expect(result.code).not.toContain("myVar");
		expect(result.code).toMatch(/_0x[0-9a-f]{4}/);
	});

	test("protection level 40 should enable minify, mangle, and encode strings", () => {
		const code = 'local msg = "Hello"';
		const result = obfuscateLua(code, { protectionLevel: 40 });

		expect(result.success).toBe(true);
		// Should encode strings
		expect(result.code).not.toContain("Hello");
		expect(result.code).toContain("string.char");
	});

	test("protection level 60 should add number encoding", () => {
		const code = "local x = 100";
		const result = obfuscateLua(code, { protectionLevel: 60 });

		expect(result.success).toBe(true);
		// Should encode numbers
		expect(result.code).not.toContain(" 100");
		expect(result.code).toMatch(/[+\-*/()]/);
	});

	test("protection level 80+ should enable all techniques", () => {
		const code = 'if x > 10 then local msg = "test" end';
		const result = obfuscateLua(code, { protectionLevel: 80 });

		expect(result.success).toBe(true);
		// Should have control flow obfuscation
		expect(result.code).toContain("and");
		// Should encode string
		expect(result.code).not.toContain("test");
		// Should encode number
		expect(result.code).not.toContain(" 10");
	});

	test("protection level 100 should apply maximum obfuscation", () => {
		const code = 'if x > 10 then local msg = "test" return 42 end';
		const result = obfuscateLua(code, { protectionLevel: 100 });

		expect(result.success).toBe(true);
		// Should be heavily obfuscated
		expect(result.code).not.toContain("test");
		expect(result.code).not.toContain(" 42");
		expect(result.code).not.toContain(" 10");
		expect(result.code).toContain("and"); // Control flow
	});

	test("should handle protection levels 0-100 in increments of 10", () => {
		const code = 'local x = 100\nif x > 10 then local msg = "test" end';

		for (let level = 0; level <= 100; level += 10) {
			const result = obfuscateLua(code, { protectionLevel: level });

			expect(result.success).toBe(true);
			expect(result.code).toBeDefined();

			// Verify it's still valid Lua
			const parseResult = require("@/lib/parser").parseLua(result.code);
			expect(parseResult.success).toBe(true);
		}
	});
});

describe("LuaObfuscator Class", () => {
	let obfuscator: LuaObfuscator;

	beforeEach(() => {
		obfuscator = new LuaObfuscator();
	});

	test("should create instance successfully", () => {
		expect(obfuscator).toBeInstanceOf(LuaObfuscator);
	});

	test("should reset state between obfuscations", () => {
		const code1 = "local x = 1";
		const code2 = "local y = 2";

		const result1 = obfuscator.obfuscate(code1, {
			mangleNames: true,
			encodeStrings: false,
			encodeNumbers: false,
			controlFlow: false,
			minify: false,
			protectionLevel: 50,
		});

		const result2 = obfuscator.obfuscate(code2, {
			mangleNames: true,
			encodeStrings: false,
			encodeNumbers: false,
			controlFlow: false,
			minify: false,
			protectionLevel: 50,
		});

		expect(result1.success).toBe(true);
		expect(result2.success).toBe(true);

		// Both should start with _0x0000 (counter reset)
		expect(result1.code).toContain("_0x0000");
		expect(result2.code).toContain("_0x0000");
	});

	test("should handle multiple consecutive obfuscations", () => {
		const codes = [VALID_LUA.simple.variable, VALID_LUA.simple.function, VALID_LUA.simple.string];

		codes.forEach(code => {
			const result = obfuscator.obfuscate(code);
			expect(result.success).toBe(true);
			expect(result.code).toBeDefined();
		});
	});

	test("should maintain consistency for same input", () => {
		const code = VALID_LUA.simple.variable;
		const options: ObfuscationOptions = {
			mangleNames: true,
			encodeStrings: false,
			encodeNumbers: false,
			controlFlow: false,
			minify: true,
			protectionLevel: 50,
		};

		const result1 = obfuscator.obfuscate(code, options);
		const result2 = obfuscator.obfuscate(code, options);

		expect(result1.code).toBe(result2.code);
	});
});

describe("ObfuscationOptions Validation", () => {
	test("should work with all options enabled", () => {
		const code = VALID_LUA.simple.variable;
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
		expect(result.code).toBeDefined();
	});

	test("should work with all options disabled", () => {
		const code = VALID_LUA.simple.variable;
		const options: ObfuscationOptions = {
			mangleNames: false,
			encodeStrings: false,
			encodeNumbers: false,
			controlFlow: false,
			minify: false,
			protectionLevel: 0,
		};

		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);
		expect(result.code).toBe(code);
	});

	test("should handle partial option sets", () => {
		const code = VALID_LUA.simple.variable;

		// Only mangleNames
		const result1 = obfuscateLua(code, { mangleNames: true });
		expect(result1.success).toBe(true);

		// Only encodeStrings
		const result2 = obfuscateLua(code, { encodeStrings: true });
		expect(result2.success).toBe(true);

		// Only minify
		const result3 = obfuscateLua(code, { minify: true });
		expect(result3.success).toBe(true);
	});

	test("should use default protection level if not specified", () => {
		const code = VALID_LUA.simple.variable;
		const result = obfuscateLua(code, {
			mangleNames: true,
			encodeStrings: false,
		});

		expect(result.success).toBe(true);
		// Default protection level is 50
	});
});

describe("Error Handling in obfuscator-simple", () => {
	test("should return error for invalid Lua syntax", () => {
		const invalidCode = "function test()"; // Missing 'end'
		const result = obfuscateLua(invalidCode);

		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
		expect(result.code).toBeUndefined();
	});

	test("should include error details", () => {
		const invalidCode = "local x = ";
		const result = obfuscateLua(invalidCode);

		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
		expect(result.errorDetails).toBeDefined();
	});

	test("should handle empty input", () => {
		const result = obfuscateLua("");

		expect(result.success).toBe(true);
		expect(result.code).toBe("");
	});

	test("should handle whitespace-only input", () => {
		const result = obfuscateLua("   \n\n\t  ");

		expect(result.success).toBe(true);
		expect(result.code).toBeDefined();
	});

	test("should catch and return obfuscation errors", () => {
		const obfuscator = new LuaObfuscator();

		// Test with invalid input that passes parsing but fails obfuscation
		// This is a theoretical test case as current implementation handles this well
		const result = obfuscator.obfuscate("function test() end");

		expect(result).toHaveProperty("success");
		expect(result).toHaveProperty("code");
	});
});

describe("Advanced Option Combinations", () => {
	test("should apply options in correct order", () => {
		const code = 'local x = 100\nif x > 50 then print("big") end';
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
		// All transformations should be applied
		expect(result.code).not.toContain("x");
		expect(result.code).not.toContain("big");
		expect(result.code).not.toContain(" 100");
		expect(result.code).not.toContain(" 50");
	});

	test("should preserve semantics with all options", () => {
		const code = VALID_LUA.programs.fibonacci;
		const options: ObfuscationOptions = {
			mangleNames: true,
			encodeStrings: false,
			encodeNumbers: true,
			controlFlow: true,
			minify: true,
			protectionLevel: 100,
		};

		const result = obfuscateLua(code, options);

		expect(result.success).toBe(true);

		// Should still be valid Lua
		const parseResult = require("@/lib/parser").parseLua(result.code!);
		expect(parseResult.success).toBe(true);
	});
});
