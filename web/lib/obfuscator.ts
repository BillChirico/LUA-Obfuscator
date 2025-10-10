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
  minify?: boolean;
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
      minify: true,
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

      // Apply transformations
      if (options.mangleNames) {
        ast = this.mangleNames(ast);
      }

      if (options.encodeStrings) {
        ast = this.encodeStrings(ast);
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
    return this.walkAST(ast, (node) => {
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
    return this.walkAST(ast, (node) => {
      if (node.type === "StringLiteral" && node.value) {
        // Convert to byte array (browser-compatible, no Buffer needed)
        const bytes = Array.from(node.value as string).map((char: string) =>
          char.charCodeAt(0)
        );

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
    // Remove comments
    code = code.replace(/--\[\[[\s\S]*?\]\]/g, ""); // Multi-line comments
    code = code.replace(/--[^\n]*/g, ""); // Single-line comments

    // Remove excessive whitespace
    code = code.replace(/\n\s*\n/g, "\n"); // Multiple blank lines
    code = code.replace(/^\s+/gm, ""); // Leading whitespace

    // Preserve necessary whitespace around keywords
    code = code.replace(/\n+/g, " ");

    return code.trim();
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
      return node.map((child) => this.walkAST(child, transform));
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
