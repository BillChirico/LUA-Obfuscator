import { parseLua } from "./parser";
import { generateLua } from "./generator";

/**
 * Lua Obfuscator
 * Implements three basic obfuscation techniques:
 * 1. Variable/function name mangling
 * 2. String encoding
 * 3. Minification
 */

export interface ObfuscationOptions {
	mangleNames?: boolean;
	encodeStrings?: boolean;
	encodeNumbers?: boolean;
	controlFlow?: boolean;
	minify?: boolean;
	protectionLevel?: number;
}

export class LuaObfuscator {
	private nameMap = new Map<string, string>();
	private counter = 0;

	/**
	 * Main obfuscation entry point
	 */
	obfuscate(
		code: string,
		options: ObfuscationOptions = {
			mangleNames: true,
			encodeStrings: true,
			encodeNumbers: false,
			controlFlow: false,
			minify: true,
			protectionLevel: 50,
		}
	): { success: boolean; code?: string; error?: string } {
		try {
			// Reset state
			this.nameMap.clear();
			this.counter = 0;

			// Parse the code
			const parseResult = parseLua(code);
			if (!parseResult.success) {
				return {
					success: false,
					error: parseResult.error || "Failed to parse Lua code",
				};
			}

			let ast = parseResult.ast;

			const protectionLevel = options.protectionLevel ?? 50;

			// Apply transformations
			if (options.mangleNames) {
				ast = this.mangleNames(ast);
			}

			if (options.encodeStrings) {
				ast = this.encodeStrings(ast);
			}

			if (options.encodeNumbers) {
				ast = this.encodeNumbers(ast, protectionLevel);
			}

			if (options.controlFlow) {
				ast = this.obfuscateControlFlow(ast, protectionLevel);
			}

			// Generate code from AST
			let obfuscatedCode = generateLua(ast);

			// Apply minification
			if (options.minify) {
				obfuscatedCode = this.minify(obfuscatedCode);
			}

			return { success: true, code: obfuscatedCode };
		} catch (error: any) {
			return {
				success: false,
				error: error.message || "Obfuscation failed",
			};
		}
	}

	/**
	 * Technique 1: Variable and function name mangling
	 * Replaces meaningful names with obscure identifiers
	 */
	private mangleNames(ast: any): any {
		return this.walkAST(ast, node => {
			// Mangle local variables and functions
			if (node.type === "Identifier" && node.name) {
				// Don't mangle global functions like print, require, etc.
				const globalFunctions = new Set([
					"print",
					"require",
					"pairs",
					"ipairs",
					"tonumber",
					"tostring",
					"type",
					"next",
					"select",
					"assert",
					"error",
					"pcall",
					"xpcall",
					"setmetatable",
					"getmetatable",
					"rawget",
					"rawset",
					"rawequal",
					"math",
					"string",
					"table",
					"io",
					"os",
					"debug",
					"coroutine",
				]);

				if (!globalFunctions.has(node.name)) {
					if (!this.nameMap.has(node.name)) {
						this.nameMap.set(node.name, this.generateMangledName());
					}
					node.name = this.nameMap.get(node.name);
				}
			}
			return node;
		});
	}

	/**
	 * Generate a mangled name like _0x1a2b
	 */
	private generateMangledName(): string {
		const hex = this.counter.toString(16).padStart(4, "0");
		this.counter++;
		return `_0x${hex}`;
	}

	/**
	 * Technique 2: String encoding
	 * Encodes string literals to make them less readable
	 */
	private encodeStrings(ast: any): any {
		return this.walkAST(ast, node => {
			if (node.type === "StringLiteral" && node.raw) {
				// Extract string value from raw (remove quotes)
				// node.raw includes quotes, e.g., '"hello"' or "'hello'"
				const stringValue: string = node.raw.slice(1, -1); // Remove first and last character (quotes)

				// Convert to byte array (browser-compatible, no Buffer needed)
				const bytes = Array.from(stringValue).map((char: string) => char.charCodeAt(0));

				node.encodedValue = bytes;
				node.wasEncoded = true;
			}
			return node;
		});
	}

	/**
	 * Technique 3: Minification
	 * Removes unnecessary whitespace and comments
	 */
	private minify(code: string): string {
		// Remove comments (but preserve string content)
		// Split by strings to avoid removing comment-like content inside strings
		const parts: string[] = [];
		let inString = false;
		let stringChar = "";
		let current = "";

		for (let i = 0; i < code.length; i++) {
			const char = code[i];
			const prevChar = i > 0 ? code[i - 1] : "";

			// Track string boundaries
			if ((char === '"' || char === "'") && prevChar !== "\\") {
				if (!inString) {
					// Starting a string
					inString = true;
					stringChar = char;
				} else if (char === stringChar) {
					// Ending a string
					inString = false;
					stringChar = "";
				}
			}

			current += char;

			// If we're at the start of a comment (outside strings), process accumulated code
			if (!inString && char === "-" && i + 1 < code.length && code[i + 1] === "-") {
				// Remove the current part's trailing '--'
				current = current.slice(0, -1);
				parts.push(current);

				// Skip the comment
				if (i + 3 < code.length && code[i + 2] === "[" && code[i + 3] === "[") {
					// Multi-line comment
					i += 4;
					while (i < code.length - 1) {
						if (code[i] === "]" && code[i + 1] === "]") {
							i += 2;
							break;
						}
						i++;
					}
					i--; // Adjust because loop will increment
				} else {
					// Single-line comment
					while (i < code.length && code[i] !== "\n") {
						i++;
					}
				}
				current = "";
			}
		}

		parts.push(current);
		code = parts.join("");

		// Remove excessive whitespace
		code = code.replace(/\n\s*\n/g, "\n"); // Multiple blank lines
		code = code.replace(/^\s+/gm, ""); // Leading whitespace

		// Preserve necessary whitespace around keywords
		code = code.replace(/\n+/g, " ");

		return code.trim();
	}

	/**
	 * Technique 4: Number encoding
	 * Encodes numeric literals using mathematical expressions to obscure values
	 */
	private encodeNumbers(ast: any, protectionLevel: number): any {
		return this.walkAST(ast, node => {
			if (node.type === "NumericLiteral" && typeof node.value === "number") {
				// Skip very small numbers (0-3) as encoding them is often counterproductive
				if (node.value >= 0 && node.value <= 3) {
					return node;
				}

				// Protection level controls encoding probability (0-100%)
				const shouldEncode = Math.random() * 100 < protectionLevel;
				if (!shouldEncode) {
					return node;
				}

				// Use various encoding strategies
				const strategy = Math.floor(Math.random() * 4);

				switch (strategy) {
					case 0: {
						// Strategy 1: Split and add (e.g., 100 becomes 50 + 50)
						const half = Math.floor(node.value / 2);
						const remainder = node.value - half;
						node.encodedExpression = {
							type: "BinaryExpression",
							operator: "+",
							left: { type: "NumericLiteral", value: half },
							right: { type: "NumericLiteral", value: remainder },
						};
						node.wasEncoded = true;
						break;
					}
					case 1: {
						// Strategy 2: Multiply and divide (e.g., 100 becomes 200 / 2)
						const multiplier = 2 + Math.floor(Math.random() * 3); // 2-4
						node.encodedExpression = {
							type: "BinaryExpression",
							operator: "/",
							left: { type: "NumericLiteral", value: node.value * multiplier },
							right: { type: "NumericLiteral", value: multiplier },
						};
						node.wasEncoded = true;
						break;
					}
					case 2: {
						// Strategy 3: Add and subtract (e.g., 100 becomes 150 - 50)
						const offset = 10 + Math.floor(Math.random() * 90); // 10-99
						node.encodedExpression = {
							type: "BinaryExpression",
							operator: "-",
							left: { type: "NumericLiteral", value: node.value + offset },
							right: { type: "NumericLiteral", value: offset },
						};
						node.wasEncoded = true;
						break;
					}
					case 3: {
						// Strategy 4: Bitwise XOR (e.g., 100 becomes 173 ^ 205)
						const xorKey = Math.floor(Math.random() * 256);
						node.encodedExpression = {
							type: "BinaryExpression",
							operator: "^",
							left: { type: "NumericLiteral", value: node.value ^ xorKey },
							right: { type: "NumericLiteral", value: xorKey },
						};
						node.wasEncoded = true;
						break;
					}
				}
			}
			return node;
		});
	}

	/**
	 * Technique 5: Control flow obfuscation
	 * Adds opaque predicates and complicates control flow to make analysis harder
	 */
	private obfuscateControlFlow(ast: any, protectionLevel: number): any {
		return this.walkAST(ast, node => {
			// Wrap if statements with opaque predicates
			if (node.type === "IfStatement" && node.clauses && node.clauses.length > 0) {
				// Protection level controls obfuscation probability (0-100%)
				const shouldObfuscate = Math.random() * 100 < protectionLevel;
				if (!shouldObfuscate) {
					return node;
				}

				// Create an opaque predicate (always true but hard to analyze)
				// e.g., (x * x >= 0) or (x == x)
				const opaquePredicateType = Math.floor(Math.random() * 3);
				let opaquePredicate;

				switch (opaquePredicateType) {
					case 0: {
						// Always true: (1 + 1 == 2)
						opaquePredicate = {
							type: "BinaryExpression",
							operator: "==",
							left: {
								type: "BinaryExpression",
								operator: "+",
								left: { type: "NumericLiteral", value: 1 },
								right: { type: "NumericLiteral", value: 1 },
							},
							right: { type: "NumericLiteral", value: 2 },
						};
						break;
					}
					case 1: {
						// Always true: (2 * 3 > 5)
						opaquePredicate = {
							type: "BinaryExpression",
							operator: ">",
							left: {
								type: "BinaryExpression",
								operator: "*",
								left: { type: "NumericLiteral", value: 2 },
								right: { type: "NumericLiteral", value: 3 },
							},
							right: { type: "NumericLiteral", value: 5 },
						};
						break;
					}
					case 2: {
						// Always true: (10 - 5 == 5)
						opaquePredicate = {
							type: "BinaryExpression",
							operator: "==",
							left: {
								type: "BinaryExpression",
								operator: "-",
								left: { type: "NumericLiteral", value: 10 },
								right: { type: "NumericLiteral", value: 5 },
							},
							right: { type: "NumericLiteral", value: 5 },
						};
						break;
					}
					default:
						opaquePredicate = null;
				}

				if (opaquePredicate) {
					// Wrap the original condition with the opaque predicate using 'and'
					const originalCondition = node.clauses[0].condition;
					node.clauses[0].condition = {
						type: "LogicalExpression",
						operator: "and",
						left: opaquePredicate,
						right: originalCondition,
					};
					node.wasObfuscated = true;
				}
			}

			// Add opaque predicates to while loops
			if (node.type === "WhileStatement" && node.condition) {
				const shouldObfuscate = Math.random() * 100 < protectionLevel;
				if (!shouldObfuscate) {
					return node;
				}

				const opaquePredicate = {
					type: "BinaryExpression",
					operator: ">=",
					left: {
						type: "BinaryExpression",
						operator: "*",
						left: { type: "NumericLiteral", value: 1 },
						right: { type: "NumericLiteral", value: 1 },
					},
					right: { type: "NumericLiteral", value: 0 },
				};

				// Wrap condition with opaque predicate
				const originalCondition = node.condition;
				node.condition = {
					type: "LogicalExpression",
					operator: "and",
					left: opaquePredicate,
					right: originalCondition,
				};
				node.wasObfuscated = true;
			}

			return node;
		});
	}

	/**
	 * Helper: Walk the AST and apply a transformation function to each node
	 */
	private walkAST(node: any, transform: (node: any) => any): any {
		if (!node || typeof node !== "object") {
			return node;
		}

		// Apply transformation to current node
		node = transform(node);

		// Recursively walk children
		if (Array.isArray(node)) {
			return node.map(child => this.walkAST(child, transform));
		}

		for (const key in node) {
			if (node.hasOwnProperty(key) && key !== "parent") {
				node[key] = this.walkAST(node[key], transform);
			}
		}

		return node;
	}
}

/**
 * Convenience function for quick obfuscation
 */
export function obfuscateLua(
	code: string,
	options?: ObfuscationOptions
): { success: boolean; code?: string; error?: string } {
	const obfuscator = new LuaObfuscator();
	return obfuscator.obfuscate(code, options);
}
