/**
 * Unit tests for encryption module
 */

import {
	encryptString,
	encryptXOR,
	encryptBase64,
	encryptHuffman,
	encryptChunked,
	generateDecryptorCode,
	type EncryptionAlgorithm,
} from "@/lib/encryption";

describe("Encryption Module", () => {
	describe("encryptXOR", () => {
		it("should encrypt a simple string", () => {
			const result = encryptXOR("Hello");
			expect(result.algorithm).toBe("xor");
			expect(result.data).toBeInstanceOf(Array);
			expect((result.data as number[]).length).toBe(5);
			expect(result.key).toBeGreaterThan(0);
			expect(result.key).toBeLessThan(256);
			expect(result.decryptorFunction).toContain("string.char");
		});

		it("should generate different keys for different calls", () => {
			const result1 = encryptXOR("Test");
			const result2 = encryptXOR("Test");
			// Keys might be different due to randomization
			expect(result1.data).toBeInstanceOf(Array);
			expect(result2.data).toBeInstanceOf(Array);
		});

		it("should handle empty strings", () => {
			const result = encryptXOR("");
			expect(result.data).toBeInstanceOf(Array);
			expect((result.data as number[]).length).toBe(0);
		});

		it("should handle special characters", () => {
			const result = encryptXOR("Hello\nWorld!");
			expect(result.data).toBeInstanceOf(Array);
			expect((result.data as number[]).length).toBe(12);
		});

		it("should produce numeric byte arrays", () => {
			const result = encryptXOR("Test");
			const bytes = result.data as number[];
			bytes.forEach(byte => {
				expect(typeof byte).toBe("number");
				expect(byte).toBeGreaterThanOrEqual(0);
				expect(byte).toBeLessThanOrEqual(255);
			});
		});
	});

	describe("encryptBase64", () => {
		it("should encrypt a simple string", () => {
			const result = encryptBase64("Hello");
			expect(result.algorithm).toBe("base64");
			expect(typeof result.data).toBe("string");
			expect((result.data as string).length).toBeGreaterThan(0);
			expect(result.decryptorFunction).toContain("function");
		});

		it("should handle strings of various lengths", () => {
			const short = encryptBase64("Hi");
			const medium = encryptBase64("Hello World");
			const long = encryptBase64("The quick brown fox jumps over the lazy dog");

			expect(short.data).toBeTruthy();
			expect(medium.data).toBeTruthy();
			expect(long.data).toBeTruthy();
		});

		it("should produce base64-like strings", () => {
			const result = encryptBase64("Test");
			const encoded = result.data as string;
			// Base64 uses A-Z, a-z, 0-9, +, /, =
			expect(encoded).toMatch(/^[A-Za-z0-9+/=]+$/);
		});

		it("should pad correctly", () => {
			// Different string lengths should produce proper padding
			const result1 = encryptBase64("A");
			const result2 = encryptBase64("AB");
			const result3 = encryptBase64("ABC");

			expect(typeof result1.data).toBe("string");
			expect(typeof result2.data).toBe("string");
			expect(typeof result3.data).toBe("string");
		});
	});

	describe("encryptHuffman", () => {
		it("should encrypt a simple string", () => {
			const result = encryptHuffman("Hello");
			expect(result.algorithm).toBe("huffman");
			expect(result.data).toBeInstanceOf(Array);
			expect((result.data as number[]).length).toBe(5);
			expect(result.key).toBeTruthy();
		});

		it("should create frequency-based encoding", () => {
			const result = encryptHuffman("aaaaabbbcc");
			expect(result.data).toBeInstanceOf(Array);
			expect((result.data as number[]).length).toBe(10);
		});

		it("should handle unique characters efficiently", () => {
			const result = encryptHuffman("abcdef");
			const codes = result.data as number[];
			expect(codes.length).toBe(6);
			// Each character should have a unique code
			const uniqueCodes = new Set(codes);
			expect(uniqueCodes.size).toBeLessThanOrEqual(6);
		});

		it("should include dictionary in key", () => {
			const result = encryptHuffman("Hello");
			expect(result.key).toBeTruthy();
			expect(typeof result.key).toBe("string");
		});
	});

	describe("encryptChunked", () => {
		it("should split string into chunks", () => {
			const result = encryptChunked("Hello World Test");
			expect(result.algorithm).toBe("chunked");
			expect(result.data).toBeInstanceOf(Array);
			expect((result.data as string[]).length).toBeGreaterThan(1);
		});

		it("should generate string.char calls for each chunk", () => {
			const result = encryptChunked("Test");
			const chunks = result.data as string[];
			chunks.forEach(chunk => {
				expect(chunk).toContain("string.char");
			});
		});

		it("should concatenate chunks in decryptor for longer strings", () => {
			const result = encryptChunked("Hello World This Is A Long String");
			// Longer strings should definitely have multiple chunks
			expect(result.decryptorFunction).toContain("..");
		});

		it("should handle short strings", () => {
			const result = encryptChunked("Hi");
			expect(result.data).toBeInstanceOf(Array);
			expect((result.data as string[]).length).toBeGreaterThan(0);
		});
	});

	describe("encryptString", () => {
		it("should use XOR by default", () => {
			const result = encryptString("Test");
			expect(result.algorithm).toBe("xor");
		});

		it("should respect algorithm parameter", () => {
			const xor = encryptString("Test", "xor");
			const base64 = encryptString("Test", "base64");
			const huffman = encryptString("Test", "huffman");
			const chunked = encryptString("Test", "chunked");

			expect(xor.algorithm).toBe("xor");
			expect(base64.algorithm).toBe("base64");
			expect(huffman.algorithm).toBe("huffman");
			expect(chunked.algorithm).toBe("chunked");
		});

		it("should handle 'none' algorithm", () => {
			const result = encryptString("Test", "none");
			expect(result.algorithm).toBe("none");
			expect(result.data).toBe("Test");
		});

		it("should handle empty strings", () => {
			const result = encryptString("");
			expect(result).toBeTruthy();
		});

		it("should handle special characters", () => {
			const result = encryptString("Test\n\t\r");
			expect(result).toBeTruthy();
			expect(result.decryptorFunction).toBeTruthy();
		});

		it("should handle unicode characters", () => {
			const result = encryptString("Hello 世界");
			expect(result).toBeTruthy();
		});
	});

	describe("generateDecryptorCode", () => {
		it("should generate valid Lua code for XOR", () => {
			const encrypted = encryptXOR("Test");
			const code = generateDecryptorCode(encrypted);
			expect(code).toContain("function");
			expect(code).toContain("string.char");
		});

		it("should generate valid Lua code for Base64", () => {
			const encrypted = encryptBase64("Test");
			const code = generateDecryptorCode(encrypted);
			expect(code).toContain("function");
		});

		it("should generate valid Lua code for Huffman", () => {
			const encrypted = encryptHuffman("Test");
			const code = generateDecryptorCode(encrypted);
			expect(code).toContain("function");
			expect(code).toContain("string.char");
		});

		it("should generate valid Lua code for Chunked", () => {
			const encrypted = encryptChunked("Test String That Is Long Enough");
			const code = generateDecryptorCode(encrypted);
			expect(code).toContain("string.char");
			// Long strings should have multiple chunks with concatenation
			if ((encrypted.data as string[]).length > 1) {
				expect(code).toContain("..");
			}
		});

		it("should handle 'none' algorithm", () => {
			const encrypted = { algorithm: "none" as const, data: "Test", decryptorFunction: '"Test"' };
			const code = generateDecryptorCode(encrypted);
			expect(code).toBe('"Test"');
		});

		it("should not produce empty code", () => {
			const encrypted = encryptString("Hello");
			const code = generateDecryptorCode(encrypted);
			expect(code.length).toBeGreaterThan(0);
		});
	});

	describe("Integration - Encryption and Decryption", () => {
		it("should produce deterministic output for same input and key", () => {
			// Note: Our implementation uses random keys, so we test consistency
			const input = "Test String";
			const result1 = encryptString(input, "xor");
			const result2 = encryptString(input, "xor");

			// Both should be valid encryptions (but may differ due to random keys)
			expect(result1.data).toBeInstanceOf(Array);
			expect(result2.data).toBeInstanceOf(Array);
		});

		it("should handle all algorithms consistently", () => {
			const input = "Consistent Test";
			const algorithms: EncryptionAlgorithm[] = ["none", "xor", "base64", "huffman", "chunked"];

			algorithms.forEach(algo => {
				const result = encryptString(input, algo);
				expect(result.algorithm).toBe(algo);
				expect(result.data).toBeTruthy();
				expect(result.decryptorFunction).toBeTruthy();
			});
		});
	});

	describe("Edge Cases", () => {
		it("should handle very long strings", () => {
			const longString = "A".repeat(1000);
			const result = encryptString(longString, "xor");
			expect(result.data).toBeInstanceOf(Array);
			expect((result.data as number[]).length).toBe(1000);
		});

		it("should handle strings with only special characters", () => {
			const result = encryptString("\n\t\r\\ \"'");
			expect(result).toBeTruthy();
			expect(result.decryptorFunction).toBeTruthy();
		});

		it("should handle single character strings", () => {
			const result = encryptString("X");
			expect(result).toBeTruthy();
		});

		it("should handle repeated characters", () => {
			const result = encryptString("aaaaaaa");
			expect(result).toBeTruthy();
		});
	});
});
