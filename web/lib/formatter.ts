/**
 * Configurable output formatting for obfuscated code
 * Provides various formatting styles for the generated code
 */

export type FormattingStyle = "minified" | "pretty" | "obfuscated" | "single-line";
export type IndentChar = "space" | "tab";

/**
 * Formatting options
 */
export interface FormattingOptions {
	style: FormattingStyle;
	indentSize?: number; // Number of spaces/tabs for indentation (default: 2)
	indentChar?: IndentChar; // Character to use for indentation (default: "space")
	lineWidth?: number; // Maximum line width for wrapping (default: 120)
}

/**
 * Default formatting options
 */
const DEFAULT_OPTIONS: Required<FormattingOptions> = {
	style: "minified",
	indentSize: 2,
	indentChar: "space",
	lineWidth: 120,
};

/**
 * Apply formatting to Lua code based on options
 *
 * @param code - Lua code to format
 * @param options - Formatting options
 * @returns Formatted code
 */
export function formatCode(code: string, options: FormattingOptions = DEFAULT_OPTIONS): string {
	const opts: Required<FormattingOptions> = {
		...DEFAULT_OPTIONS,
		...options,
	};

	switch (opts.style) {
		case "minified":
			return formatMinified(code);
		case "pretty":
			return formatPretty(code, opts.indentSize, opts.indentChar);
		case "obfuscated":
			return formatObfuscated(code);
		case "single-line":
			return formatSingleLine(code);
		default:
			return code;
	}
}

/**
 * Minified formatting - remove all unnecessary whitespace
 */
function formatMinified(code: string): string {
	// Remove comments
	code = removeComments(code);

	// Remove multiple blank lines
	code = code.replace(/\n\s*\n/g, "\n");

	// Remove leading/trailing whitespace from each line
	code = code
		.split("\n")
		.map(line => line.trim())
		.join("\n");

	// Remove blank lines
	code = code
		.split("\n")
		.filter(line => line.length > 0)
		.join("\n");

	return code.trim();
}

/**
 * Pretty formatting - readable with proper indentation
 */
function formatPretty(code: string, indentSize: number, indentChar: IndentChar): string {
	const lines = code.split("\n");
	const result: string[] = [];
	let indentLevel = 0;

	const indent = indentChar === "tab" ? "\t" : " ".repeat(indentSize);

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (line === "") continue;

		// Decrease indent for end, else, elseif, until
		if (line.startsWith("end") || line.startsWith("else") || line.startsWith("elseif") || line.startsWith("until")) {
			indentLevel = Math.max(0, indentLevel - 1);
		}

		// Add indented line
		result.push(indent.repeat(indentLevel) + line);

		// Increase indent after then, do, repeat, function
		if (
			line.endsWith("then") ||
			line.endsWith("do") ||
			line.startsWith("repeat") ||
			line.includes("function") ||
			line.startsWith("else")
		) {
			indentLevel++;
		}

		// Decrease indent after end (for next line)
		if (line.startsWith("end") || line.startsWith("until")) {
			// Already decreased above
		}
	}

	return result.join("\n");
}

/**
 * Obfuscated formatting - random whitespace and line breaks
 */
function formatObfuscated(code: string): string {
	const lines = code.split("\n").filter(line => line.trim() !== "");
	const result: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		// Random indentation (0-5 spaces)
		const randomIndent = " ".repeat(Math.floor(Math.random() * 6));
		result.push(randomIndent + line);

		// Randomly add extra blank lines
		if (Math.random() < 0.2) {
			result.push("");
		}
	}

	return result.join("\n");
}

/**
 * Single-line formatting - everything on one line
 */
function formatSingleLine(code: string): string {
	// Remove comments
	code = removeComments(code);

	// Join all lines with single space separator
	const lines = code
		.split("\n")
		.map(line => line.trim())
		.filter(line => line.length > 0);

	// Join with space, ensuring keywords have proper spacing
	return lines.join(" ");
}

/**
 * Remove comments from Lua code
 */
function removeComments(code: string): string {
	const result: string[] = [];
	const lines = code.split("\n");
	let inMultilineComment = false;

	for (const line of lines) {
		let processedLine = line;

		// Handle multi-line comments
		if (inMultilineComment) {
			const endIndex = processedLine.indexOf("]]");
			if (endIndex !== -1) {
				processedLine = processedLine.substring(endIndex + 2);
				inMultilineComment = false;
			} else {
				continue; // Skip this line
			}
		}

		// Check for multi-line comment start
		const multiStartIndex = processedLine.indexOf("--[[");
		if (multiStartIndex !== -1) {
			const endIndex = processedLine.indexOf("]]", multiStartIndex + 4);
			if (endIndex !== -1) {
				// Complete multi-line comment on same line
				processedLine = processedLine.substring(0, multiStartIndex) + processedLine.substring(endIndex + 2);
			} else {
				// Multi-line comment continues
				processedLine = processedLine.substring(0, multiStartIndex);
				inMultilineComment = true;
			}
		}

		// Remove single-line comments (but preserve in strings)
		const singleCommentIndex = findSingleLineCommentIndex(processedLine);
		if (singleCommentIndex !== -1) {
			processedLine = processedLine.substring(0, singleCommentIndex);
		}

		if (processedLine.trim().length > 0) {
			result.push(processedLine);
		}
	}

	return result.join("\n");
}

/**
 * Find the index of a single-line comment that's not inside a string
 */
function findSingleLineCommentIndex(line: string): number {
	let inString = false;
	let stringChar = "";

	for (let i = 0; i < line.length - 1; i++) {
		const char = line[i];
		const nextChar = line[i + 1];

		// Track string boundaries
		if ((char === '"' || char === "'") && (i === 0 || line[i - 1] !== "\\")) {
			if (!inString) {
				inString = true;
				stringChar = char;
			} else if (char === stringChar) {
				inString = false;
				stringChar = "";
			}
		}

		// Check for comment start outside strings
		if (!inString && char === "-" && nextChar === "-") {
			return i;
		}
	}

	return -1;
}

/**
 * Add blank lines between function definitions for readability
 */
export function addBlankLinesBetweenFunctions(code: string): string {
	const lines = code.split("\n");
	const result: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		// Add current line
		result.push(lines[i]);

		// Add blank line after 'end' if next line is a function
		if (line === "end" && i + 1 < lines.length) {
			const nextLine = lines[i + 1].trim();
			if (nextLine.startsWith("function") || nextLine.startsWith("local function")) {
				result.push("");
			}
		}
	}

	return result.join("\n");
}

/**
 * Format code with custom indent level
 */
export function formatWithIndent(code: string, indentLevel: number, indentChar: IndentChar = "space"): string {
	const indent = indentChar === "tab" ? "\t" : "  ";
	const indentStr = indent.repeat(indentLevel);

	return code
		.split("\n")
		.map(line => (line.trim() ? indentStr + line.trim() : ""))
		.join("\n");
}

/**
 * Normalize line endings to LF
 */
export function normalizeLineEndings(code: string): string {
	return code.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
