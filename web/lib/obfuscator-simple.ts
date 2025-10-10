import { parseLua } from "./parser";

/**
 * Simplified Lua Obfuscator for MVP
 * Uses regex-based transformations instead of AST manipulation
 */

export interface ObfuscationOptions {
  mangleNames?: boolean;
  encodeStrings?: boolean;
  minify?: boolean;
}

export class LuaObfuscator {
  private nameMap = new Map<string, string>();
  private counter = 0;

  obfuscate(
    code: string,
    options: ObfuscationOptions = {
      mangleNames: true,
      encodeStrings: false, // Disable for MVP
      minify: true,
    }
  ): { success: boolean; code?: string; error?: string } {
    try {
      // Reset state
      this.nameMap.clear();
      this.counter = 0;

      // Validate it's valid Lua first
      const parseResult = parseLua(code);
      if (!parseResult.success) {
        return {
          success: false,
          error: parseResult.error || "Invalid Lua syntax",
        };
      }

      let obfuscatedCode = code;

      // Apply name mangling
      if (options.mangleNames) {
        obfuscatedCode = this.mangleNamesRegex(obfuscatedCode);
      }

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

  private mangleNamesRegex(code: string): string {
    // Protected Lua keywords and built-in functions
    const protectedNames = new Set([
      "and", "break", "do", "else", "elseif", "end", "false", "for",
      "function", "if", "in", "local", "nil", "not", "or", "repeat",
      "return", "then", "true", "until", "while",
      "print", "require", "pairs", "ipairs", "tonumber", "tostring",
      "type", "next", "select", "assert", "error", "pcall", "xpcall",
      "setmetatable", "getmetatable", "rawget", "rawset", "rawequal",
      "math", "string", "table", "io", "os", "debug", "coroutine",
    ]);

    // Find all identifiers (variable/function names)
    const identifierPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    const identifiers = new Set<string>();

    let match;
    while ((match = identifierPattern.exec(code)) !== null) {
      const name = match[1];
      if (!protectedNames.has(name)) {
        identifiers.add(name);
      }
    }

    // Create mapping for each identifier
    identifiers.forEach((name) => {
      if (!this.nameMap.has(name)) {
        this.nameMap.set(name, this.generateMangledName());
      }
    });

    // Replace all occurrences
    let result = code;
    this.nameMap.forEach((mangledName, originalName) => {
      // Use word boundaries to avoid partial replacements
      const regex = new RegExp(`\\b${originalName}\\b`, "g");
      result = result.replace(regex, mangledName);
    });

    return result;
  }

  private generateMangledName(): string {
    const hex = this.counter.toString(16).padStart(4, "0");
    this.counter++;
    return `_0x${hex}`;
  }

  private minify(code: string): string {
    // Remove comments
    code = code.replace(/--\[\[[\s\S]*?\]\]/g, ""); // Multi-line comments
    code = code.replace(/--[^\n]*/g, ""); // Single-line comments

    // Remove excessive whitespace while preserving structure
    code = code.replace(/\n\s*\n/g, "\n"); // Multiple blank lines
    code = code.replace(/[ \t]+/g, " "); // Multiple spaces/tabs to single space

    // Remove leading/trailing whitespace from each line
    code = code.split("\n").map(line => line.trim()).join("\n");

    // Remove blank lines
    code = code.split("\n").filter(line => line.length > 0).join("\n");

    return code.trim();
  }
}

export function obfuscateLua(
  code: string,
  options?: ObfuscationOptions
): { success: boolean; code?: string; error?: string } {
  const obfuscator = new LuaObfuscator();
  return obfuscator.obfuscate(code, options);
}
