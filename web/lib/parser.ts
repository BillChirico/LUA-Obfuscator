import * as luaparse from "luaparse";

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
 * @param code - The Lua source code to parse
 * @returns Parse result with AST on success or error details on failure
 */
export function parseLua(code: string): ParseResult {
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
