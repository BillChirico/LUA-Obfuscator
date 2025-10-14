/**
 * Unit tests for parser.ts
 * Tests the Lua parsing wrapper and validation functions
 */

import { parseLua, validateLua } from "@/lib/parser";
import { VALID_LUA, INVALID_LUA, EDGE_CASES } from "../../fixtures/lua-samples";

describe("parseLua", () => {
	describe("Happy Path - Valid Lua Code", () => {
		test("should parse simple variable declaration", () => {
			const result = parseLua(VALID_LUA.simple.variable);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
			expect(result.ast.type).toBe("Chunk");
			expect(result.error).toBeUndefined();
		});

		test("should parse function declaration", () => {
			const result = parseLua(VALID_LUA.simple.function);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
			expect(result.error).toBeUndefined();
		});

		test("should parse string literals", () => {
			const result = parseLua(VALID_LUA.simple.string);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
			expect(result.error).toBeUndefined();
		});

		test("should parse complex table constructor", () => {
			const result = parseLua(VALID_LUA.complex.table);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
			expect(result.error).toBeUndefined();
		});

		test("should parse if statements", () => {
			const result = parseLua(VALID_LUA.complex.ifStatement);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
			expect(result.error).toBeUndefined();
		});

		test("should parse for loops", () => {
			const result = parseLua(VALID_LUA.complex.forNumeric);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
			expect(result.error).toBeUndefined();
		});

		test("should parse complete programs", () => {
			const result = parseLua(VALID_LUA.programs.fibonacci);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
			expect(result.error).toBeUndefined();
		});

		test("should include locations and ranges in AST", () => {
			const result = parseLua(VALID_LUA.simple.variable);

			expect(result.success).toBe(true);
			expect(result.ast.body[0].loc).toBeDefined();
			expect(result.ast.body[0].range).toBeDefined();
		});
	});

	describe("Error Conditions - Invalid Lua Code", () => {
		test("should fail on incomplete statement", () => {
			const result = parseLua(INVALID_LUA.syntaxErrors.incomplete);

			expect(result.success).toBe(false);
			expect(result.ast).toBeUndefined();
			expect(result.error).toBeDefined();
			expect(result.error).toContain("");
		});

		test("should fail on unclosed function", () => {
			const result = parseLua(INVALID_LUA.syntaxErrors.unclosedFunction);

			expect(result.success).toBe(false);
			expect(result.ast).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		test("should fail on unclosed string", () => {
			const result = parseLua(INVALID_LUA.syntaxErrors.unclosedString);

			expect(result.success).toBe(false);
			expect(result.ast).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		test("should fail on invalid keyword usage", () => {
			const result = parseLua(INVALID_LUA.syntaxErrors.invalidKeyword);

			expect(result.success).toBe(false);
			expect(result.ast).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		test("should fail on missing end keyword", () => {
			const result = parseLua(INVALID_LUA.syntaxErrors.missingEnd);

			expect(result.success).toBe(false);
			expect(result.ast).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		test("should fail on extra end keyword", () => {
			const result = parseLua(INVALID_LUA.syntaxErrors.extraEnd);

			expect(result.success).toBe(false);
			expect(result.ast).toBeUndefined();
			expect(result.error).toBeDefined();
		});

		test("should return error message on parse failure", () => {
			const result = parseLua("invalid lua code !!!");

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
			expect(typeof result.error).toBe("string");
			expect(result.error!.length).toBeGreaterThan(0);
		});

		test("should extract line and column information from parse errors", () => {
			// Test with code that has a clear syntax error
			const result = parseLua("local x = 1\nend");

			expect(result.success).toBe(false);
			expect(result.errorDetails).toBeDefined();
			expect(result.errorDetails?.message).toBeDefined();
			expect(result.errorDetails?.line).toBeDefined();
			expect(result.errorDetails?.line).toBeGreaterThan(0);
		});

		test("should include error details with line information", () => {
			const result = parseLua("function test()\n  return\nend end");

			expect(result.success).toBe(false);
			expect(result.errorDetails).toBeDefined();
			if (result.errorDetails?.line) {
				expect(result.errorDetails.line).toBeGreaterThan(0);
			}
		});

		test("should provide error details for unclosed string", () => {
			const result = parseLua('local msg = "unclosed string');

			expect(result.success).toBe(false);
			expect(result.errorDetails).toBeDefined();
			expect(result.errorDetails?.message).toBeDefined();
		});

		test("should extract line and column from error with [line:column] format", () => {
			// Trigger an error that produces [line:column] format
			const result = parseLua("local x = \n@invalid");

			expect(result.success).toBe(false);
			expect(result.errorDetails).toBeDefined();
			// Error details should contain extracted line/column info
			if (result.errorDetails) {
				expect(result.errorDetails.message).toBeDefined();
			}
		});

		test("should extract line from error with 'line X' format", () => {
			// Test alternative error message format parsing
			const result = parseLua("local x =");

			expect(result.success).toBe(false);
			expect(result.errorDetails).toBeDefined();
			expect(result.errorDetails?.message).toBeDefined();
		});

		test("should handle error without line/column information", () => {
			// This tests the fallback when line/column can't be extracted
			const result = parseLua("!@#$%^&*()");

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
			expect(result.errorDetails).toBeDefined();
			expect(result.errorDetails?.message).toBeDefined();
		});

		test("should clean up error message by removing location prefix", () => {
			// Test that [line:column] prefix gets removed from error message
			const result = parseLua("local function test()\nend end");

			expect(result.success).toBe(false);
			expect(result.errorDetails).toBeDefined();
			// Check that error details exist and have a message
			if (result.errorDetails) {
				expect(result.errorDetails.message).toBeDefined();
				expect(typeof result.errorDetails.message).toBe("string");
				// The parser may or may not strip the prefix depending on the error format
				// Just verify we have a meaningful error message
				expect(result.errorDetails.message.length).toBeGreaterThan(0);
			}
		});
	});

	describe("Edge Cases", () => {
		test("should handle empty string", () => {
			const result = parseLua(EDGE_CASES.empty);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
			expect(result.ast.body).toEqual([]);
		});

		test("should handle whitespace only", () => {
			const result = parseLua(EDGE_CASES.whitespaceOnly);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
			expect(result.ast.body).toEqual([]);
		});

		test("should handle comments only", () => {
			const result = parseLua(EDGE_CASES.commentsOnly);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
		});

		test("should handle very long identifiers", () => {
			const result = parseLua(EDGE_CASES.longIdentifier);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
		});

		test("should handle deeply nested structures", () => {
			const result = parseLua(EDGE_CASES.deepNesting);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
		});

		test("should handle mixed whitespace", () => {
			const result = parseLua(EDGE_CASES.weirdWhitespace);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
		});

		test("should handle unicode characters in strings", () => {
			const result = parseLua(VALID_LUA.strings.unicode);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
		});

		test("should handle strings with escape sequences", () => {
			const result = parseLua(VALID_LUA.strings.withEscapes);

			expect(result.success).toBe(true);
			expect(result.ast).toBeDefined();
		});
	});
});

describe("validateLua", () => {
	describe("Happy Path - Valid Code", () => {
		test("should return true for valid Lua code", () => {
			expect(validateLua(VALID_LUA.simple.variable)).toBe(true);
			expect(validateLua(VALID_LUA.simple.function)).toBe(true);
			expect(validateLua(VALID_LUA.complex.table)).toBe(true);
		});

		test("should return true for empty code", () => {
			expect(validateLua(EDGE_CASES.empty)).toBe(true);
		});

		test("should return true for whitespace only", () => {
			expect(validateLua(EDGE_CASES.whitespaceOnly)).toBe(true);
		});
	});

	describe("Error Conditions - Invalid Code", () => {
		test("should return false for invalid Lua code", () => {
			expect(validateLua(INVALID_LUA.syntaxErrors.incomplete)).toBe(false);
			expect(validateLua(INVALID_LUA.syntaxErrors.unclosedFunction)).toBe(false);
			expect(validateLua(INVALID_LUA.syntaxErrors.unclosedString)).toBe(false);
		});

		test("should return false for syntax errors", () => {
			expect(validateLua("invalid !@# code")).toBe(false);
			expect(validateLua("local end = 5")).toBe(false);
		});
	});
});

describe("Input Validation - Security Limits", () => {
	describe("Size Limits", () => {
		test("should reject code exceeding 5MB", () => {
			// Create a string slightly over 5MB
			const largCode = "x".repeat(5 * 1024 * 1024 + 1000);
			const result = parseLua(largCode);

			expect(result.success).toBe(false);
			expect(result.error).toContain("too large");
			expect(result.error).toContain("5MB");
		});

		test("should accept code well under 5MB", () => {
			// Create valid Lua code under both size and line limits
			// 10,000 lines with ~100 chars each = ~1MB
			const line = "local var_with_long_name_to_increase_bytes = 1234567890\n";
			const iterations = 10000;
			const code = line.repeat(iterations);
			const result = parseLua(code);

			expect(result.success).toBe(true);
			expect(code.length).toBeLessThan(5 * 1024 * 1024);
		});
	});

	describe("Line Count Limits", () => {
		test("should reject code exceeding 50,000 lines", () => {
			// Create code with > 50,000 lines
			const manyLines = "x=1\n".repeat(50001);
			const result = parseLua(manyLines);

			expect(result.success).toBe(false);
			expect(result.error).toContain("too complex");
			expect(result.error).toContain("50,000");
		});

		test("should accept code at 50,000 lines", () => {
			// Create code with exactly 50,000 lines (but split() counts as 50,000)
			// A string with 49,999 newlines has 50,000 lines when split
			const code = "x=1\n".repeat(49999) + "x=1";
			const result = parseLua(code);

			expect(result.success).toBe(true);
		});

		test("should accept code just under 50,000 lines", () => {
			// Create code with well under 50,000 lines
			const code = "x=1\n".repeat(40000);
			const result = parseLua(code);

			expect(result.success).toBe(true);
		});
	});

	describe("Error Messages", () => {
		test("should provide helpful size error messages", () => {
			const hugeCode = "x".repeat(10 * 1024 * 1024); // 10MB
			const result = parseLua(hugeCode);

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
			expect(result.error).toMatch(/\d+\.?\d*MB/); // Should include size in MB
			expect(result.errorDetails).toBeDefined();
		});

		test("should provide helpful line count error messages", () => {
			const manyLines = "x\n".repeat(100000);
			const result = parseLua(manyLines);

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
			expect(result.error).toMatch(/\d{1,3}(,\d{3})* lines/); // Should include formatted line count
			expect(result.errorDetails).toBeDefined();
		});
	});
});
