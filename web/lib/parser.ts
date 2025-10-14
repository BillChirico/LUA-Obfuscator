import * as luaparse from "luaparse";

/**
 * Input validation constants
 * These limits prevent DoS attacks via extremely large or complex input
 */
export const INPUT_LIMITS = {
	MAX_CODE_SIZE: 5 * 1024 * 1024, // 5MB
	MAX_LINES: 50000, // 50,000 lines
	PARSE_TIMEOUT: 5000, // 5 seconds
} as const;

export interface ParseError {
	message: string;
	line?: number;
	column?: number;
}

export interface ParseResult {
	success: boolean;
	ast?: any;
	error?: string;
	errorDetails?: ParseError;
}

/**
 * Parses Lua source code into an Abstract Syntax Tree (AST).
 * Extracts line and column information from parse errors for inline display.
 *
 * Includes input validation to prevent DoS attacks:
 * - Maximum code size: 5MB
 * - Maximum lines: 50,000
 *
 * @param code - The Lua source code to parse
 * @returns Parse result with AST on success or error details on failure
 */
export function parseLua(code: string): ParseResult {
	// Validate input size
	if (code.length > INPUT_LIMITS.MAX_CODE_SIZE) {
		const sizeMB = (code.length / (1024 * 1024)).toFixed(2);
		const maxSizeMB = (INPUT_LIMITS.MAX_CODE_SIZE / (1024 * 1024)).toFixed(0);
		return {
			success: false,
			error: `Code too large (${sizeMB}MB). Maximum allowed: ${maxSizeMB}MB`,
			errorDetails: {
				message: `Input exceeds maximum size of ${maxSizeMB}MB`,
			},
		};
	}

	// Validate line count
	const lineCount = code.split("\n").length;
	if (lineCount > INPUT_LIMITS.MAX_LINES) {
		return {
			success: false,
			error: `Code too complex (${lineCount.toLocaleString()} lines). Maximum allowed: ${INPUT_LIMITS.MAX_LINES.toLocaleString()} lines`,
			errorDetails: {
				message: `Input exceeds maximum of ${INPUT_LIMITS.MAX_LINES.toLocaleString()} lines`,
			},
		};
	}

	try {
		const ast = luaparse.parse(code, {
			locations: true,
			ranges: true,
			comments: false,
		});
		return { success: true, ast };
	} catch (error: any) {
		// luaparse errors typically have format: "[line:column] message"
		// or have line/column properties
		let errorMessage = error.message || "Failed to parse Lua code";
		let line: number | undefined;
		let column: number | undefined;

		// Try to extract line and column from error object properties
		if (error.line !== undefined) {
			line = error.line;
		}
		if (error.column !== undefined) {
			column = error.column;
		}

		// Try to parse from error message if not in properties
		if (line === undefined) {
			const match = errorMessage.match(/\[(\d+):(\d+)\]/);
			if (match) {
				line = parseInt(match[1], 10);
				column = parseInt(match[2], 10);
				// Clean up the error message to remove the location prefix
				errorMessage = errorMessage.replace(/\[\d+:\d+\]\s*/, "");
			}
		}

		// Try alternative format: "line X" or "at line X"
		if (line === undefined) {
			const lineMatch = errorMessage.match(/(?:at )?line (\d+)/i);
			if (lineMatch) {
				line = parseInt(lineMatch[1], 10);
			}
		}

		return {
			success: false,
			error: errorMessage,
			errorDetails: {
				message: errorMessage,
				line,
				column,
			},
		};
	}
}

/**
 * Validates Lua source code syntax.
 *
 * @param code - The Lua source code to validate
 * @returns true if the code is syntactically valid, false otherwise
 */
export function validateLua(code: string): boolean {
	const result = parseLua(code);
	return result.success;
}
