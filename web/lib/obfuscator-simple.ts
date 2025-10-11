import { parseLua } from "./parser";

/**
 * Simplified Lua Obfuscator for MVP
 * Uses regex-based transformations instead of AST manipulation
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

  obfuscate(
    code: string,
    options: ObfuscationOptions = {
      mangleNames: true,
      encodeStrings: false,
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

      // Validate it's valid Lua first
      const parseResult = parseLua(code);
      if (!parseResult.success) {
        return {
          success: false,
          error: parseResult.error || "Invalid Lua syntax",
        };
      }

      let obfuscatedCode = code;

      const protectionLevel = options.protectionLevel ?? 50;

      // Apply number encoding (before other transformations)
      if (options.encodeNumbers) {
        obfuscatedCode = this.encodeNumbers(obfuscatedCode, protectionLevel);
      }

      // Apply control flow obfuscation
      if (options.controlFlow) {
        obfuscatedCode = this.obfuscateControlFlow(obfuscatedCode, protectionLevel);
      }

      // Apply string encoding (before name mangling to avoid encoding mangled names)
      if (options.encodeStrings) {
        obfuscatedCode = this.encodeStrings(obfuscatedCode);
      }

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

  private encodeNumbers(code: string, protectionLevel: number): string {
    // Match numeric literals (integers and decimals)
    // Negative lookbehind/lookahead to avoid matching parts of identifiers or hex numbers
    const numberPattern = /(?<![a-zA-Z0-9_])(\d+(?:\.\d+)?)(?![a-zA-Z0-9_])/g;

    return code.replace(numberPattern, (match) => {
      const num = parseFloat(match);

      // Skip very small numbers (0-3) as encoding them is counterproductive
      if (num >= 0 && num <= 3) {
        return match;
      }

      // Protection level controls encoding probability (0-100%)
      // 0% = no encoding, 100% = encode all numbers
      const shouldEncode = Math.random() * 100 < protectionLevel;
      if (!shouldEncode) {
        return match;
      }

      // Use various encoding strategies randomly
      const strategy = Math.floor(Math.random() * 4);

      switch (strategy) {
        case 0: {
          // Strategy 1: Split and add (e.g., 100 becomes 50 + 50)
          const half = Math.floor(num / 2);
          const remainder = num - half;
          return `(${half} + ${remainder})`;
        }
        case 1: {
          // Strategy 2: Multiply and divide (e.g., 100 becomes 200 / 2)
          const multiplier = 2 + Math.floor(Math.random() * 3); // 2-4
          return `(${num * multiplier} / ${multiplier})`;
        }
        case 2: {
          // Strategy 3: Add and subtract (e.g., 100 becomes 150 - 50)
          const offset = 10 + Math.floor(Math.random() * 90); // 10-99
          return `(${num + offset} - ${offset})`;
        }
        case 3: {
          // Strategy 4: Bitwise XOR (e.g., 100 becomes 173 ^ 205)
          // Only for integers
          if (Number.isInteger(num)) {
            const xorKey = Math.floor(Math.random() * 256);
            return `(${(num ^ xorKey)} ~ ${xorKey})`;
          }
          // Fallback to strategy 0 for decimals
          const half = Math.floor(num / 2);
          const remainder = num - half;
          return `(${half} + ${remainder})`;
        }
        default:
          return match;
      }
    });
  }

  private obfuscateControlFlow(code: string, protectionLevel: number): string {
    // Add opaque predicates to if statements
    // Match: if <condition> then
    const ifPattern = /\bif\s+(.+?)\s+then\b/g;
    code = code.replace(ifPattern, (match, condition) => {
      // Protection level controls obfuscation probability (0-100%)
      const shouldObfuscate = Math.random() * 100 < protectionLevel;
      if (!shouldObfuscate) {
        return match;
      }

      const opaquePredicates = [
        "(1 + 1 == 2)",
        "(2 * 3 > 5)",
        "(10 - 5 == 5)",
        "(true or false)",
      ];
      const opaque = opaquePredicates[Math.floor(Math.random() * opaquePredicates.length)];
      return `if ${opaque} and ${condition} then`;
    });

    // Add opaque predicates to while statements
    // Match: while <condition> do
    const whilePattern = /\bwhile\s+(.+?)\s+do\b/g;
    code = code.replace(whilePattern, (match, condition) => {
      const shouldObfuscate = Math.random() * 100 < protectionLevel;
      if (!shouldObfuscate) {
        return match;
      }

      const opaque = "(1 * 1 >= 0)";
      return `while ${opaque} and ${condition} do`;
    });

    // Add opaque predicates to repeat-until statements
    // Match: until <condition>
    const untilPattern = /\buntil\s+(.+?)(?=\n|$)/g;
    code = code.replace(untilPattern, (match, condition) => {
      const shouldObfuscate = Math.random() * 100 < protectionLevel;
      if (!shouldObfuscate) {
        return match;
      }

      const opaque = "(1 == 1)";
      return `until ${opaque} and ${condition}`;
    });

    return code;
  }

  private encodeStrings(code: string): string {
    // Match string literals (both single and double quoted)
    // This regex handles:
    // - Double-quoted strings: "..."
    // - Single-quoted strings: '...'
    // - Escaped quotes inside strings
    const stringPattern = /(["'])(?:(?=(\\?))\2.)*?\1/g;

    return code.replace(stringPattern, (match) => {
      // Extract the string content without quotes
      const quote = match[0];
      const content = match.slice(1, -1);

      // Don't encode empty strings
      if (content.length === 0) {
        return match;
      }

      // Convert string to byte array
      const bytes: number[] = [];
      for (let i = 0; i < content.length; i++) {
        const char = content[i];

        // Handle escape sequences
        if (char === '\\' && i + 1 < content.length) {
          const nextChar = content[i + 1];
          switch (nextChar) {
            case 'n':
              bytes.push(10); // newline
              i++;
              continue;
            case 't':
              bytes.push(9); // tab
              i++;
              continue;
            case 'r':
              bytes.push(13); // carriage return
              i++;
              continue;
            case '\\':
              bytes.push(92); // backslash
              i++;
              continue;
            case '"':
              bytes.push(34); // double quote
              i++;
              continue;
            case "'":
              bytes.push(39); // single quote
              i++;
              continue;
            default:
              // For other escape sequences, just use the character as-is
              bytes.push(char.charCodeAt(0));
              continue;
          }
        }

        bytes.push(char.charCodeAt(0));
      }

      // Generate string.char() call
      return `string.char(${bytes.join(", ")})`;
    });
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
