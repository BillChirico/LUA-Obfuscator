/**
 * Comprehensive Lua code samples for testing
 * Organized by category: valid, invalid, and edge cases
 */

export const VALID_LUA = {
  // Simple cases
  simple: {
    variable: 'local x = 5',
    string: 'local msg = "Hello, World!"',
    function: 'function greet() print("Hi") end',
    functionWithParams: 'function add(a, b) return a + b end',
    localFunction: 'local function multiply(x, y) return x * y end',
    multipleVars: 'local a, b, c = 1, 2, 3',
  },

  // Complex structures
  complex: {
    table: 'local t = {a = 1, b = 2, c = 3}',
    tableWithMixedKeys: 'local t = {a = 1, [2] = "two", [3] = "three"}',
    tableNested: 'local t = {x = {y = {z = 42}}}',
    tableArray: 'local arr = {1, 2, 3, 4, 5}',

    ifStatement: 'if x > 5 then return true else return false end',
    ifElseif: 'if x > 10 then return "big" elseif x > 5 then return "medium" else return "small" end',

    whileLoop: 'while x < 10 do x = x + 1 end',
    repeatLoop: 'repeat x = x + 1 until x > 10',
    forNumeric: 'for i = 1, 10 do print(i) end',
    forNumericStep: 'for i = 1, 10, 2 do print(i) end',
    forGeneric: 'for k, v in pairs(t) do print(k, v) end',

    functionNested: 'function outer() local function inner() return 42 end return inner() end',
    closure: 'function counter() local count = 0 return function() count = count + 1 return count end end',
  },

  // String variations
  strings: {
    doubleQuote: 'local s = "hello"',
    singleQuote: "local s = 'hello'",
    withEscapes: 'local s = "line1\\nline2\\ttab"',
    withQuotes: 'local s = "He said \\"Hello\\""',
    empty: 'local s = ""',
    unicode: 'local emoji = "🚀"',
    multiline: 'local s = "line1\\nline2\\nline3"',
  },

  // Comments (for minification testing)
  comments: {
    single: '-- This is a comment\nlocal x = 1',
    inline: 'local x = 1 -- inline comment',
    multiple: '-- Comment 1\n-- Comment 2\nlocal x = 1',
    multiline: '--[[ This is\na multiline\ncomment ]]\nlocal x = 1',
  },

  // Binary and unary expressions
  expressions: {
    arithmetic: 'local x = a + b * c - d / e',
    comparison: 'local result = x > 5 and y < 10 or z == 0',
    logical: 'local result = not flag and (x or y)',
    concatenation: 'local fullName = firstName .. " " .. lastName',
    unary: 'local neg = -x',
    length: 'local len = #array',
  },

  // Member and index expressions
  access: {
    memberAccess: 'local value = obj.property',
    indexAccess: 'local value = arr[1]',
    chainedMember: 'local value = obj.nested.deep.property',
    chainedIndex: 'local value = matrix[1][2]',
    mixed: 'local value = obj.arr[1].prop',
  },

  // Function calls
  calls: {
    simple: 'print("Hello")',
    withArgs: 'math.max(1, 2, 3)',
    nested: 'print(tostring(tonumber("42")))',
    method: 'obj:method(arg)',
  },

  // Return statements
  returns: {
    simple: 'return 42',
    multiple: 'return x, y, z',
    empty: 'return',
    expression: 'return a + b',
  },

  // Do blocks
  blocks: {
    doBlock: 'do local x = 5 print(x) end',
    nested: 'do do do local x = 1 end end end',
  },

  // Break statements
  breaks: {
    inWhile: 'while true do if x > 10 then break end x = x + 1 end',
    inFor: 'for i = 1, 100 do if i > 10 then break end end',
  },

  // Complete programs
  programs: {
    fibonacci: `function fib(n)
  if n <= 1 then
    return n
  else
    return fib(n - 1) + fib(n - 2)
  end
end`,

    factorial: `function factorial(n)
  if n == 0 then
    return 1
  else
    return n * factorial(n - 1)
  end
end`,

    quicksort: `function quicksort(arr, low, high)
  if low < high then
    local pi = partition(arr, low, high)
    quicksort(arr, low, pi - 1)
    quicksort(arr, pi + 1, high)
  end
end`,
  },
};

export const INVALID_LUA = {
  syntaxErrors: {
    incomplete: 'local x = ',
    unclosedFunction: 'function test()',
    unclosedString: 'local s = "hello',
    invalidKeyword: 'local end = 5',
    missingEnd: 'if x > 5 then return true',
    extraEnd: 'local x = 1 end',
  },
};

export const EDGE_CASES = {
  empty: '',
  whitespaceOnly: '   \n\n\t  ',
  commentsOnly: '-- Just a comment\n-- Another comment',

  // Strings that look like code
  stringWithLuaCode: 'local s = "local x = 1"',
  stringWithComments: 'local s = "-- not a comment"',

  // Very long identifiers
  longIdentifier: 'local very_long_variable_name_that_exceeds_normal_length = 42',

  // Many variables
  manyVariables: Array.from({ length: 50 }, (_, i) => `local var${i} = ${i}`).join('\n'),

  // Deep nesting
  deepNesting: 'local x = {a = {b = {c = {d = {e = {f = {g = {h = {i = {j = 42}}}}}}}}}}',

  // Mixed whitespace
  weirdWhitespace: 'local\tx\n=\r\n5',
};

// Global functions that should never be mangled
export const LUA_GLOBALS = [
  'print',
  'require',
  'pairs',
  'ipairs',
  'tonumber',
  'tostring',
  'type',
  'next',
  'select',
  'assert',
  'error',
  'pcall',
  'xpcall',
  'setmetatable',
  'getmetatable',
  'rawget',
  'rawset',
  'rawequal',
  'math',
  'string',
  'table',
  'io',
  'os',
  'debug',
  'coroutine',
];
