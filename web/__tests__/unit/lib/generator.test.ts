/**
 * Unit tests for generator.ts
 * Tests AST to Lua code generation for all node types
 */

import { generateLua } from '@/lib/generator';
import { parseLua } from '@/lib/parser';
import { VALID_LUA, EDGE_CASES } from '../../fixtures/lua-samples';

describe('generateLua', () => {
  describe('Happy Path - Basic Node Types', () => {
    test('should generate code from empty AST', () => {
      const result = parseLua(EDGE_CASES.empty);
      const code = generateLua(result.ast);

      expect(code).toBeDefined();
      expect(typeof code).toBe('string');
    });

    test('should generate variable declaration', () => {
      const result = parseLua(VALID_LUA.simple.variable);
      const code = generateLua(result.ast);

      expect(code).toContain('local');
      expect(code).toContain('x');
      expect(code).toContain('5');
    });

    test('should generate function declaration', () => {
      const result = parseLua(VALID_LUA.simple.function);
      const code = generateLua(result.ast);

      expect(code).toContain('function');
      expect(code).toContain('greet');
      expect(code).toContain('end');
    });

    test('should generate local function', () => {
      const result = parseLua(VALID_LUA.simple.localFunction);
      const code = generateLua(result.ast);

      expect(code).toContain('local');
      expect(code).toContain('function');
      expect(code).toContain('multiply');
    });

    test('should generate return statement', () => {
      const result = parseLua(VALID_LUA.returns.simple);
      const code = generateLua(result.ast);

      expect(code).toContain('return');
      expect(code).toContain('42');
    });

    test('should generate multiple return values', () => {
      const result = parseLua(VALID_LUA.returns.multiple);
      const code = generateLua(result.ast);

      expect(code).toContain('return');
      expect(code).toContain('x');
      expect(code).toContain('y');
      expect(code).toContain('z');
    });

    test('should generate empty return', () => {
      const result = parseLua(VALID_LUA.returns.empty);
      const code = generateLua(result.ast);

      expect(code).toBe('return');
    });
  });

  describe('String Literals', () => {
    test('should generate simple string literal', () => {
      const result = parseLua(VALID_LUA.strings.doubleQuote);
      const code = generateLua(result.ast);

      expect(code).toContain('hello');
    });

    test('should handle double quotes', () => {
      const result = parseLua(VALID_LUA.strings.doubleQuote);
      const code = generateLua(result.ast);

      expect(code).toMatch(/["']hello["']/);
    });

    test('should handle single quotes', () => {
      const result = parseLua(VALID_LUA.strings.singleQuote);
      const code = generateLua(result.ast);

      expect(code).toMatch(/["']hello["']/);
    });

    test('should escape special characters', () => {
      const result = parseLua(VALID_LUA.strings.withEscapes);
      const code = generateLua(result.ast);

      expect(code).toBeDefined();
      // Check that escape sequences are preserved in the output
      expect(code).toContain('\\n'); // Newline escape sequence
      expect(code).toContain('\\t'); // Tab escape sequence
    });

    test('should handle empty strings', () => {
      const result = parseLua(VALID_LUA.strings.empty);
      const code = generateLua(result.ast);

      expect(code).toMatch(/["']["']/);
    });

    test('should handle unicode strings', () => {
      const result = parseLua(VALID_LUA.strings.unicode);
      const code = generateLua(result.ast);

      expect(code).toContain('🚀');
    });
  });

  describe('Table Constructors', () => {
    test('should generate empty table', () => {
      const result = parseLua('local t = {}');
      const code = generateLua(result.ast);

      expect(code).toContain('{}');
    });

    test('should generate table with named fields', () => {
      const result = parseLua(VALID_LUA.complex.table);
      const code = generateLua(result.ast);

      expect(code).toContain('{');
      expect(code).toContain('}');
      expect(code).toContain('a');
      expect(code).toContain('=');
    });

    test('should generate table with bracket keys', () => {
      const result = parseLua(VALID_LUA.complex.tableWithMixedKeys);
      const code = generateLua(result.ast);

      expect(code).toContain('[');
      expect(code).toContain(']');
    });

    test('should generate array-style table', () => {
      const result = parseLua(VALID_LUA.complex.tableArray);
      const code = generateLua(result.ast);

      expect(code).toContain('{');
      expect(code).toContain('}');
    });

    test('should generate nested tables', () => {
      const result = parseLua(VALID_LUA.complex.tableNested);
      const code = generateLua(result.ast);

      expect(code).toContain('{');
      expect(code).toContain('x');
      expect(code).toContain('y');
      expect(code).toContain('z');
    });
  });

  describe('Control Flow Statements', () => {
    test('should generate if statement', () => {
      const result = parseLua(VALID_LUA.complex.ifStatement);
      const code = generateLua(result.ast);

      expect(code).toContain('if');
      expect(code).toContain('then');
      expect(code).toContain('else');
      expect(code).toContain('end');
    });

    test('should generate if-elseif-else statement', () => {
      const result = parseLua(VALID_LUA.complex.ifElseif);
      const code = generateLua(result.ast);

      expect(code).toContain('if');
      expect(code).toContain('elseif');
      expect(code).toContain('else');
      expect(code).toContain('end');
    });

    test('should generate while loop', () => {
      const result = parseLua(VALID_LUA.complex.whileLoop);
      const code = generateLua(result.ast);

      expect(code).toContain('while');
      expect(code).toContain('do');
      expect(code).toContain('end');
    });

    test('should generate repeat-until loop', () => {
      const result = parseLua(VALID_LUA.complex.repeatLoop);
      const code = generateLua(result.ast);

      expect(code).toContain('repeat');
      expect(code).toContain('until');
    });

    test('should generate numeric for loop', () => {
      const result = parseLua(VALID_LUA.complex.forNumeric);
      const code = generateLua(result.ast);

      expect(code).toContain('for');
      expect(code).toContain('=');
      expect(code).toContain('do');
      expect(code).toContain('end');
    });

    test('should generate numeric for loop with step', () => {
      const result = parseLua(VALID_LUA.complex.forNumericStep);
      const code = generateLua(result.ast);

      expect(code).toContain('for');
      expect(code).toContain(',');
    });

    test('should generate generic for loop', () => {
      const result = parseLua(VALID_LUA.complex.forGeneric);
      const code = generateLua(result.ast);

      expect(code).toContain('for');
      expect(code).toContain('in');
      expect(code).toContain('do');
      expect(code).toContain('end');
    });

    test('should generate break statement', () => {
      const result = parseLua(VALID_LUA.breaks.inWhile);
      const code = generateLua(result.ast);

      expect(code).toContain('break');
    });

    test('should generate do block', () => {
      const result = parseLua(VALID_LUA.blocks.doBlock);
      const code = generateLua(result.ast);

      expect(code).toContain('do');
      expect(code).toContain('end');
    });
  });

  describe('Expressions', () => {
    test('should generate binary expressions', () => {
      const result = parseLua(VALID_LUA.expressions.arithmetic);
      const code = generateLua(result.ast);

      expect(code).toContain('+');
      expect(code).toContain('*');
      expect(code).toContain('-');
      expect(code).toContain('/');
    });

    test('should generate comparison expressions', () => {
      const result = parseLua(VALID_LUA.expressions.comparison);
      const code = generateLua(result.ast);

      expect(code).toContain('>');
      expect(code).toContain('<');
      expect(code).toContain('==');
      expect(code).toMatch(/\band\b/);
      expect(code).toMatch(/\bor\b/);
    });

    test('should generate unary expressions', () => {
      const result = parseLua(VALID_LUA.expressions.unary);
      const code = generateLua(result.ast);

      expect(code).toContain('-');
    });

    test('should generate length operator', () => {
      const result = parseLua(VALID_LUA.expressions.length);
      const code = generateLua(result.ast);

      expect(code).toContain('#');
    });

    test('should generate string concatenation', () => {
      const result = parseLua(VALID_LUA.expressions.concatenation);
      const code = generateLua(result.ast);

      expect(code).toContain('..');
    });

    test('should generate logical expressions', () => {
      const result = parseLua(VALID_LUA.expressions.logical);
      const code = generateLua(result.ast);

      expect(code).toMatch(/\bnot\b/);
      expect(code).toMatch(/\band\b/);
      expect(code).toMatch(/\bor\b/);
    });
  });

  describe('Member and Index Access', () => {
    test('should generate member access', () => {
      const result = parseLua(VALID_LUA.access.memberAccess);
      const code = generateLua(result.ast);

      expect(code).toContain('.');
      expect(code).toContain('obj');
      expect(code).toContain('property');
    });

    test('should generate index access', () => {
      const result = parseLua(VALID_LUA.access.indexAccess);
      const code = generateLua(result.ast);

      expect(code).toContain('[');
      expect(code).toContain(']');
    });

    test('should generate chained member access', () => {
      const result = parseLua(VALID_LUA.access.chainedMember);
      const code = generateLua(result.ast);

      expect(code).toContain('.');
      expect(code).toContain('obj');
      expect(code).toContain('nested');
      expect(code).toContain('deep');
    });

    test('should generate chained index access', () => {
      const result = parseLua(VALID_LUA.access.chainedIndex);
      const code = generateLua(result.ast);

      expect(code).toContain('[');
      expect(code).toContain(']');
    });
  });

  describe('Function Calls', () => {
    test('should generate simple function call', () => {
      const result = parseLua(VALID_LUA.calls.simple);
      const code = generateLua(result.ast);

      expect(code).toContain('print');
      expect(code).toContain('(');
      expect(code).toContain(')');
    });

    test('should generate function call with arguments', () => {
      const result = parseLua(VALID_LUA.calls.withArgs);
      const code = generateLua(result.ast);

      expect(code).toContain('math.max');
      expect(code).toContain('(');
      expect(code).toContain(',');
      expect(code).toContain(')');
    });

    test('should generate nested function calls', () => {
      const result = parseLua(VALID_LUA.calls.nested);
      const code = generateLua(result.ast);

      expect(code).toContain('print');
      expect(code).toContain('tostring');
      expect(code).toContain('tonumber');
    });
  });

  describe('Numeric and Boolean Literals', () => {
    test('should generate numeric literal', () => {
      const result = parseLua('local x = 42');
      const code = generateLua(result.ast);

      expect(code).toContain('42');
    });

    test('should generate decimal literal', () => {
      const result = parseLua('local x = 3.14');
      const code = generateLua(result.ast);

      expect(code).toContain('3.14');
    });

    test('should generate boolean true', () => {
      const result = parseLua('local x = true');
      const code = generateLua(result.ast);

      expect(code).toMatch(/\btrue\b/);
    });

    test('should generate boolean false', () => {
      const result = parseLua('local x = false');
      const code = generateLua(result.ast);

      expect(code).toMatch(/\bfalse\b/);
    });

    test('should generate nil literal', () => {
      const result = parseLua('local x = nil');
      const code = generateLua(result.ast);

      expect(code).toMatch(/\bnil\b/);
    });
  });

  describe('Complex Programs', () => {
    test('should generate fibonacci function', () => {
      const result = parseLua(VALID_LUA.programs.fibonacci);
      const code = generateLua(result.ast);

      expect(code).toContain('function');
      expect(code).toContain('fib');
      expect(code).toContain('if');
      expect(code).toContain('return');
    });

    test('should generate factorial function', () => {
      const result = parseLua(VALID_LUA.programs.factorial);
      const code = generateLua(result.ast);

      expect(code).toContain('function');
      expect(code).toContain('factorial');
      expect(code).toContain('return');
    });
  });

  describe('Edge Cases', () => {
    test('should handle null node', () => {
      const code = generateLua(null);
      expect(code).toBe('');
    });

    test('should handle undefined node', () => {
      const code = generateLua(undefined);
      expect(code).toBe('');
    });

    test('should handle unknown node types gracefully', () => {
      // Create a spy on console.warn to verify it's called
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const unknownNode = { type: 'UnknownNodeType' };
      const code = generateLua(unknownNode);

      expect(code).toBe('');
      expect(consoleSpy).toHaveBeenCalledWith('Unknown node type: UnknownNodeType');

      consoleSpy.mockRestore();
    });

    test('should handle empty chunk', () => {
      const result = parseLua('');
      const code = generateLua(result.ast);

      expect(code).toBe('');
    });

    test('should handle deeply nested structures', () => {
      const result = parseLua(EDGE_CASES.deepNesting);
      const code = generateLua(result.ast);

      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThan(0);
    });
  });

  describe('Round-Trip Generation', () => {
    test('should generate code that can be parsed again', () => {
      const original = VALID_LUA.simple.variable;
      const parseResult1 = parseLua(original);
      const generated = generateLua(parseResult1.ast);
      const parseResult2 = parseLua(generated);

      expect(parseResult2.success).toBe(true);
    });

    test('should preserve semantics for functions', () => {
      const original = VALID_LUA.simple.function;
      const parseResult1 = parseLua(original);
      const generated = generateLua(parseResult1.ast);
      const parseResult2 = parseLua(generated);

      expect(parseResult2.success).toBe(true);
      expect(parseResult2.ast.type).toBe('Chunk');
    });

    test('should preserve semantics for complex programs', () => {
      const original = VALID_LUA.programs.fibonacci;
      const parseResult1 = parseLua(original);
      const generated = generateLua(parseResult1.ast);
      const parseResult2 = parseLua(generated);

      expect(parseResult2.success).toBe(true);
    });
  });

  describe('Assignment Statements', () => {
    test('should generate simple assignment', () => {
      const result = parseLua('x = 5');
      const code = generateLua(result.ast);

      expect(code).toContain('x');
      expect(code).toContain('=');
      expect(code).toContain('5');
    });

    test('should generate multiple assignment', () => {
      const result = parseLua('x, y = 1, 2');
      const code = generateLua(result.ast);

      expect(code).toContain('x');
      expect(code).toContain('y');
      expect(code).toContain('=');
      expect(code).toContain('1');
      expect(code).toContain('2');
    });
  });
});
