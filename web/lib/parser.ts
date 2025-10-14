import * as luaparse from "luaparse";

export interface ParseResult {
	success: boolean;
	ast?: any;
	error?: string;
}

export function parseLua(code: string): ParseResult {
	try {
		const ast = luaparse.parse(code, {
			locations: true,
			ranges: true,
			comments: false,
		});
		return { success: true, ast };
	} catch (error: any) {
		return {
			success: false,
			error: error.message || "Failed to parse Lua code",
		};
	}
}

export function validateLua(code: string): boolean {
	const result = parseLua(code);
	return result.success;
}
