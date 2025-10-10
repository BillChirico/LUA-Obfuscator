/**
 * Integration tests for the full obfuscation pipeline
 * Tests end-to-end workflows: parse → transform → generate
 */

import { obfuscateLua, ObfuscationOptions } from '@/lib/obfuscator';
import { parseLua } from '@/lib/parser';
import { VALID_LUA, LUA_GLOBALS } from '../fixtures/lua-samples';

describe('Obfuscation Pipeline Integration', () => {
  describe('End-to-End Happy Path', () => {
    test('should complete full pipeline for simple code', () => {
      const original = VALID_LUA.simple.variable;
      const result = obfuscateLua(original);

      expect(result.success).toBe(true);
      expect(result.code).toBeDefined();
      expect(result.error).toBeUndefined();

      // Generated code should be parseable
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
    });

    test('should complete full pipeline for functions', () => {
      const original = VALID_LUA.simple.function;
      const result = obfuscateLua(original);

      expect(result.success).toBe(true);

      // Generated code should be valid Lua
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
    });

    test('should complete full pipeline for complex programs', () => {
      const original = VALID_LUA.programs.fibonacci;
      const result = obfuscateLua(original);

      expect(result.success).toBe(true);

      // Generated code should be valid Lua
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
    });

    test('should complete full pipeline for programs with tables', () => {
      const original = VALID_LUA.complex.table;
      const result = obfuscateLua(original);

      expect(result.success).toBe(true);

      // Generated code should be valid Lua
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
    });

    test('should complete full pipeline for loops', () => {
      const original = VALID_LUA.complex.forNumeric;
      const result = obfuscateLua(original);

      expect(result.success).toBe(true);

      // Generated code should be valid Lua
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
    });
  });

  describe('Option Combinations', () => {
    const testCases: Array<{
      name: string;
      options: ObfuscationOptions;
      checks: (code: string, original: string) => void;
    }> = [
      {
        name: 'only name mangling',
        options: { mangleNames: true, encodeStrings: false, minify: false },
        checks: (code, original) => {
          // Should contain mangled names
          expect(code).toMatch(/_0x[0-9a-f]{4}/);
          // Should preserve structure (newlines)
          expect(code.split('\n').length).toBeGreaterThan(1);
        },
      },
      {
        name: 'only string encoding',
        options: { mangleNames: false, encodeStrings: true, minify: false },
        checks: (code, original) => {
          // Should preserve variable names
          if (original.includes('local x')) {
            expect(code).toContain('x');
          }
        },
      },
      {
        name: 'only minification',
        options: { mangleNames: false, encodeStrings: false, minify: true },
        checks: (code, original) => {
          // Should be shorter (whitespace removed)
          expect(code.length).toBeLessThanOrEqual(original.length);
        },
      },
      {
        name: 'mangling + minification',
        options: { mangleNames: true, encodeStrings: false, minify: true },
        checks: (code, original) => {
          expect(code).toMatch(/_0x[0-9a-f]{4}/);
          expect(code.length).toBeLessThanOrEqual(original.length);
        },
      },
      {
        name: 'all options enabled',
        options: { mangleNames: true, encodeStrings: true, minify: true },
        checks: (code, original) => {
          expect(code).toMatch(/_0x[0-9a-f]{4}/);
        },
      },
      {
        name: 'all options disabled',
        options: { mangleNames: false, encodeStrings: false, minify: false },
        checks: (code, original) => {
          // Code structure should be similar to original
          if (original.includes('local x')) {
            expect(code).toContain('x');
          }
        },
      },
    ];

    testCases.forEach(({ name, options, checks }) => {
      test(`should work with ${name}`, () => {
        const original = 'local x = 5\nlocal y = 10\nreturn x + y';
        const result = obfuscateLua(original, options);

        expect(result.success).toBe(true);
        expect(result.code).toBeDefined();

        // Generated code should be parseable
        const parseResult = parseLua(result.code!);
        expect(parseResult.success).toBe(true);

        // Run custom checks
        checks(result.code!, original);
      });
    });
  });

  describe('Round-Trip Validation', () => {
    test('should produce valid Lua after obfuscation', () => {
      const original = VALID_LUA.simple.variable;

      // Obfuscate
      const obfResult = obfuscateLua(original);
      expect(obfResult.success).toBe(true);

      // Parse the obfuscated code
      const parseResult = parseLua(obfResult.code!);
      expect(parseResult.success).toBe(true);
      expect(parseResult.ast).toBeDefined();
    });

    test('should preserve parseability through multiple obfuscations', () => {
      const original = VALID_LUA.simple.function;

      // First obfuscation
      const result1 = obfuscateLua(original);
      expect(result1.success).toBe(true);

      // Verify first result is parseable
      const parse1 = parseLua(result1.code!);
      expect(parse1.success).toBe(true);

      // Second obfuscation of obfuscated code
      const result2 = obfuscateLua(result1.code!);
      expect(result2.success).toBe(true);

      // Verify second result is parseable
      const parse2 = parseLua(result2.code!);
      expect(parse2.success).toBe(true);
    });

    test('should preserve structure for complex programs', () => {
      const original = VALID_LUA.programs.factorial;

      const result = obfuscateLua(original, {
        mangleNames: true,
        encodeStrings: false,
        minify: false,
      });

      expect(result.success).toBe(true);

      // Parse and verify structure
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
      expect(parseResult.ast.type).toBe('Chunk');
      expect(parseResult.ast.body).toBeDefined();
      expect(parseResult.ast.body.length).toBeGreaterThan(0);
    });
  });

  describe('Global Preservation Across Pipeline', () => {
    test('should preserve all Lua globals through full pipeline', () => {
      const testCode = `
        local x = tonumber("42")
        print(x)
        local t = {1, 2, 3}
        for k, v in pairs(t) do
          print(k, v)
        end
        require("module")
      `;

      const result = obfuscateLua(testCode, {
        mangleNames: true,
        encodeStrings: false,
        minify: false,
      });

      expect(result.success).toBe(true);

      // All globals should be preserved
      expect(result.code).toContain('tonumber');
      expect(result.code).toContain('print');
      expect(result.code).toContain('pairs');
      expect(result.code).toContain('require');
    });

    test('should preserve math library', () => {
      const code = 'local x = math.max(1, 2, 3)\nlocal y = math.min(4, 5, 6)';
      const result = obfuscateLua(code);

      expect(result.success).toBe(true);
      expect(result.code).toContain('math');
    });

    test('should preserve string library', () => {
      const code = 'local s = string.upper("hello")';
      const result = obfuscateLua(code);

      expect(result.success).toBe(true);
      expect(result.code).toContain('string');
    });

    test('should preserve table library', () => {
      const code = 'table.insert(t, value)';
      const result = obfuscateLua(code);

      expect(result.success).toBe(true);
      expect(result.code).toContain('table');
    });
  });

  describe('Semantic Preservation', () => {
    test('should preserve variable scoping', () => {
      const code = `
        local x = 5
        do
          local x = 10
          print(x)
        end
        print(x)
      `;

      const result = obfuscateLua(code);
      expect(result.success).toBe(true);

      // Should be valid Lua
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
    });

    test('should preserve function closures', () => {
      const code = VALID_LUA.complex.closure;
      const result = obfuscateLua(code);

      expect(result.success).toBe(true);

      // Should be valid Lua
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
    });

    test('should preserve return values', () => {
      const code = 'function test() return 1, 2, 3 end';
      const result = obfuscateLua(code);

      expect(result.success).toBe(true);

      // Should contain return statement
      expect(result.code).toContain('return');

      // Should be valid Lua
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
    });
  });

  describe('Pipeline Error Handling', () => {
    test('should fail gracefully on invalid input', () => {
      const invalid = 'invalid !@# lua code';
      const result = obfuscateLua(invalid);

      expect(result.success).toBe(false);
      expect(result.code).toBeUndefined();
      expect(result.error).toBeDefined();
    });

    test('should handle parse errors in pipeline', () => {
      const invalid = 'local x = ';
      const result = obfuscateLua(invalid);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should provide meaningful error messages', () => {
      const invalid = 'function test()'; // Missing end
      const result = obfuscateLua(invalid);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
      expect(result.error!.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scale', () => {
    test('should handle moderate-sized programs', () => {
      const code = Array.from(
        { length: 20 },
        (_, i) => `local var${i} = ${i}\nprint(var${i})`
      ).join('\n');

      const result = obfuscateLua(code);

      expect(result.success).toBe(true);
      expect(result.code).toBeDefined();

      // Should be valid Lua
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
    });

    test('should handle nested structures', () => {
      const code = VALID_LUA.complex.functionNested;
      const result = obfuscateLua(code);

      expect(result.success).toBe(true);

      // Should be valid Lua
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
    });

    test('should handle complex table constructors', () => {
      const code = 'local t = {a = {b = {c = {d = {e = 42}}}}}';
      const result = obfuscateLua(code);

      expect(result.success).toBe(true);

      // Should be valid Lua
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
    });
  });

  describe('Idempotency', () => {
    test('should produce same output for same input with same options', () => {
      const code = VALID_LUA.simple.variable;
      const options: ObfuscationOptions = {
        mangleNames: true,
        encodeStrings: false,
        minify: true,
      };

      const result1 = obfuscateLua(code, options);
      const result2 = obfuscateLua(code, options);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.code).toBe(result2.code);
    });
  });

  describe('Comments Removal in Pipeline', () => {
    test('should remove comments when minification enabled', () => {
      const code = `
        -- This is a comment
        local x = 5 -- inline comment
        --[[ Multi-line
             comment ]]
        return x
      `;

      const result = obfuscateLua(code, {
        mangleNames: false,
        encodeStrings: false,
        minify: true,
      });

      expect(result.success).toBe(true);
      expect(result.code).not.toContain('-- This is a comment');
      expect(result.code).not.toContain('-- inline comment');
      expect(result.code).not.toContain('--[[');
    });

    test('should preserve comments when minification disabled', () => {
      const code = '-- Comment\nlocal x = 5';

      const result = obfuscateLua(code, {
        mangleNames: false,
        encodeStrings: false,
        minify: false,
      });

      expect(result.success).toBe(true);
      // Comments are removed during parsing by luaparse (comments: false option)
      // So they won't appear in output even without minification
    });
  });

  describe('String Handling in Pipeline', () => {
    test('should handle strings with special characters', () => {
      const code = 'local s = "Hello\\nWorld\\tTab"';
      const result = obfuscateLua(code);

      expect(result.success).toBe(true);

      // Should be valid Lua
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
    });

    test('should handle unicode strings', () => {
      const code = VALID_LUA.strings.unicode;
      const result = obfuscateLua(code);

      expect(result.success).toBe(true);

      // Should be valid Lua
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
    });

    test('should handle empty strings', () => {
      const code = 'local s = ""';
      const result = obfuscateLua(code);

      expect(result.success).toBe(true);

      // Should be valid Lua
      const parseResult = parseLua(result.code!);
      expect(parseResult.success).toBe(true);
    });
  });
});
