/**
 * Unit tests for parser.ts
 * Tests the Lua parsing wrapper and validation functions
 */

import { parseLua, validateLua } from '@/lib/parser';
import { VALID_LUA, INVALID_LUA, EDGE_CASES } from '../../fixtures/lua-samples';

describe('parseLua', () => {
  describe('Happy Path - Valid Lua Code', () => {
    test('should parse simple variable declaration', () => {
      const result = parseLua(VALID_LUA.simple.variable);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.ast.type).toBe('Chunk');
      expect(result.error).toBeUndefined();
    });

    test('should parse function declaration', () => {
      const result = parseLua(VALID_LUA.simple.function);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should parse string literals', () => {
      const result = parseLua(VALID_LUA.simple.string);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should parse complex table constructor', () => {
      const result = parseLua(VALID_LUA.complex.table);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should parse if statements', () => {
      const result = parseLua(VALID_LUA.complex.ifStatement);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should parse for loops', () => {
      const result = parseLua(VALID_LUA.complex.forNumeric);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should parse complete programs', () => {
      const result = parseLua(VALID_LUA.programs.fibonacci);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    test('should include locations and ranges in AST', () => {
      const result = parseLua(VALID_LUA.simple.variable);

      expect(result.success).toBe(true);
      expect(result.ast.body[0].loc).toBeDefined();
      expect(result.ast.body[0].range).toBeDefined();
    });
  });

  describe('Error Conditions - Invalid Lua Code', () => {
    test('should fail on incomplete statement', () => {
      const result = parseLua(INVALID_LUA.syntaxErrors.incomplete);

      expect(result.success).toBe(false);
      expect(result.ast).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error).toContain('');
    });

    test('should fail on unclosed function', () => {
      const result = parseLua(INVALID_LUA.syntaxErrors.unclosedFunction);

      expect(result.success).toBe(false);
      expect(result.ast).toBeUndefined();
      expect(result.error).toBeDefined();
    });

    test('should fail on unclosed string', () => {
      const result = parseLua(INVALID_LUA.syntaxErrors.unclosedString);

      expect(result.success).toBe(false);
      expect(result.ast).toBeUndefined();
      expect(result.error).toBeDefined();
    });

    test('should fail on invalid keyword usage', () => {
      const result = parseLua(INVALID_LUA.syntaxErrors.invalidKeyword);

      expect(result.success).toBe(false);
      expect(result.ast).toBeUndefined();
      expect(result.error).toBeDefined();
    });

    test('should fail on missing end keyword', () => {
      const result = parseLua(INVALID_LUA.syntaxErrors.missingEnd);

      expect(result.success).toBe(false);
      expect(result.ast).toBeUndefined();
      expect(result.error).toBeDefined();
    });

    test('should fail on extra end keyword', () => {
      const result = parseLua(INVALID_LUA.syntaxErrors.extraEnd);

      expect(result.success).toBe(false);
      expect(result.ast).toBeUndefined();
      expect(result.error).toBeDefined();
    });

    test('should return error message on parse failure', () => {
      const result = parseLua('invalid lua code !!!');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
      expect(result.error!.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string', () => {
      const result = parseLua(EDGE_CASES.empty);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.ast.body).toEqual([]);
    });

    test('should handle whitespace only', () => {
      const result = parseLua(EDGE_CASES.whitespaceOnly);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.ast.body).toEqual([]);
    });

    test('should handle comments only', () => {
      const result = parseLua(EDGE_CASES.commentsOnly);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
    });

    test('should handle very long identifiers', () => {
      const result = parseLua(EDGE_CASES.longIdentifier);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
    });

    test('should handle deeply nested structures', () => {
      const result = parseLua(EDGE_CASES.deepNesting);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
    });

    test('should handle mixed whitespace', () => {
      const result = parseLua(EDGE_CASES.weirdWhitespace);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
    });

    test('should handle unicode characters in strings', () => {
      const result = parseLua(VALID_LUA.strings.unicode);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
    });

    test('should handle strings with escape sequences', () => {
      const result = parseLua(VALID_LUA.strings.withEscapes);

      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
    });
  });
});

describe('validateLua', () => {
  describe('Happy Path - Valid Code', () => {
    test('should return true for valid Lua code', () => {
      expect(validateLua(VALID_LUA.simple.variable)).toBe(true);
      expect(validateLua(VALID_LUA.simple.function)).toBe(true);
      expect(validateLua(VALID_LUA.complex.table)).toBe(true);
    });

    test('should return true for empty code', () => {
      expect(validateLua(EDGE_CASES.empty)).toBe(true);
    });

    test('should return true for whitespace only', () => {
      expect(validateLua(EDGE_CASES.whitespaceOnly)).toBe(true);
    });
  });

  describe('Error Conditions - Invalid Code', () => {
    test('should return false for invalid Lua code', () => {
      expect(validateLua(INVALID_LUA.syntaxErrors.incomplete)).toBe(false);
      expect(validateLua(INVALID_LUA.syntaxErrors.unclosedFunction)).toBe(false);
      expect(validateLua(INVALID_LUA.syntaxErrors.unclosedString)).toBe(false);
    });

    test('should return false for syntax errors', () => {
      expect(validateLua('invalid !@# code')).toBe(false);
      expect(validateLua('local end = 5')).toBe(false);
    });
  });
});
