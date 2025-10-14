# API Reference

Complete API documentation for the Lua Obfuscator engine.

## Table of Contents

- [Core Functions](#core-functions)
- [Type Definitions](#type-definitions)
- [Obfuscation Options](#obfuscation-options)
- [Error Handling](#error-handling)
- [Code Examples](#code-examples)

---

## Core Functions

### `obfuscateLua(code, options?)`

Main entry point for obfuscating Lua source code.

**Signature:**

```typescript
function obfuscateLua(code: string, options?: ObfuscationOptions): ObfuscationResult;
```

**Parameters:**

| Parameter | Type                 | Required | Description                       |
| --------- | -------------------- | -------- | --------------------------------- |
| `code`    | `string`             | Yes      | Lua source code to obfuscate      |
| `options` | `ObfuscationOptions` | No       | Configuration options (see below) |

**Returns:** `ObfuscationResult`

**Example:**

```typescript
import { obfuscateLua } from "@/lib/obfuscator-simple";

const result = obfuscateLua("local x = 5\nprint(x)", {
	mangleNames: true,
	encodeStrings: true,
	minify: true,
	protectionLevel: 50,
});

if (result.success) {
	console.log(result.code);
} else {
	console.error(result.error);
}
```

---

### `parseLua(code)`

Parses Lua source code into an Abstract Syntax Tree (AST).

**Signature:**

```typescript
function parseLua(code: string): ParseResult;
```

**Parameters:**

| Parameter | Type     | Required | Description              |
| --------- | -------- | -------- | ------------------------ |
| `code`    | `string` | Yes      | Lua source code to parse |

**Returns:** `ParseResult`

**Example:**

```typescript
import { parseLua } from "@/lib/parser";

const result = parseLua("local x = 5");

if (result.success) {
	console.log("AST:", result.ast);
} else {
	console.error("Parse error:", result.error);
	console.error("Line:", result.errorDetails?.line);
	console.error("Column:", result.errorDetails?.column);
}
```

---

### `validateLua(code)`

Validates Lua source code syntax.

**Signature:**

```typescript
function validateLua(code: string): boolean;
```

**Parameters:**

| Parameter | Type     | Required | Description                 |
| --------- | -------- | -------- | --------------------------- |
| `code`    | `string` | Yes      | Lua source code to validate |

**Returns:** `boolean` - `true` if valid, `false` otherwise

**Example:**

```typescript
import { validateLua } from "@/lib/parser";

if (validateLua("local x = 5")) {
	console.log("Valid Lua code");
}
```

---

### `generateLua(ast)`

Converts an AST back to Lua source code.

**Signature:**

```typescript
function generateLua(ast: any): string;
```

**Parameters:**

| Parameter | Type  | Required | Description           |
| --------- | ----- | -------- | --------------------- |
| `ast`     | `any` | Yes      | Lua AST from luaparse |

**Returns:** `string` - Generated Lua code

**Example:**

```typescript
import { parseLua } from "@/lib/parser";
import { generateLua } from "@/lib/generator";

const parseResult = parseLua("local x = 5");
if (parseResult.success) {
	const code = generateLua(parseResult.ast);
	console.log(code); // 'local x = 5'
}
```

---

## Type Definitions

### `ObfuscationOptions`

Configuration options for the obfuscation process.

```typescript
interface ObfuscationOptions {
	// Basic options (v1.0)
	/** Replace variable/function names with hex identifiers */
	mangleNames?: boolean;

	/** Encode string literals using string.char() */
	encodeStrings?: boolean;

	/** Encode numeric literals as mathematical expressions */
	encodeNumbers?: boolean;

	/** Add opaque predicates to control flow */
	controlFlow?: boolean;

	/** Remove comments and whitespace */
	minify?: boolean;

	/** Protection level (0-100%) */
	protectionLevel?: number;

	// Advanced options (v1.1)
	/** Encryption algorithm for strings: "none", "xor", "base64", "huffman", "chunked" */
	encryptionAlgorithm?: EncryptionAlgorithm;

	/** Transform code into state machine patterns */
	controlFlowFlattening?: boolean;

	/** Inject unreachable code blocks */
	deadCodeInjection?: boolean;

	/** Add anti-debugging runtime checks */
	antiDebugging?: boolean;

	/** Output formatting style: "minified", "pretty", "obfuscated", "single-line" */
	formattingStyle?: FormattingStyle;

	/** Indent size for pretty formatting (default: 2) */
	indentSize?: number;

	/** Indent character: "space" or "tab" (default: "space") */
	indentChar?: IndentChar;
}
```

**Default Values:**

```typescript
{
  // Basic options
  mangleNames: true,
  encodeStrings: false,
  encodeNumbers: false,
  controlFlow: false,
  minify: true,
  protectionLevel: 50,

  // Advanced options (v1.1)
  encryptionAlgorithm: "none",
  controlFlowFlattening: false,
  deadCodeInjection: false,
  antiDebugging: false,
  formattingStyle: "minified",
  indentSize: 2,
  indentChar: "space"
}
```

**Protection Level Mapping:**

| Level   | Enabled Techniques                                           |
| ------- | ------------------------------------------------------------ |
| 0%      | None (manual control only)                                   |
| 10-19%  | Minify                                                       |
| 20-29%  | Minify + Mangle Names                                        |
| 30-49%  | Minify + Mangle Names + Encode Strings                       |
| 50-59%  | Minify + Mangle Names + Encode Strings + Encode Numbers      |
| 60-69%  | All Basic + Control Flow                                     |
| 70-74%  | All Basic + XOR Encryption (v1.1)                            |
| 75-84%  | Advanced + Dead Code Injection (v1.1)                        |
| 85-89%  | Advanced + Control Flow Flattening (v1.1)                    |
| 90-100% | Maximum Protection (All techniques including Anti-Debugging) |

---

### `ObfuscationResult`

Result object returned by `obfuscateLua()`.

```typescript
interface ObfuscationResult {
	/** Whether obfuscation succeeded */
	success: boolean;

	/** Obfuscated code (if successful) */
	code?: string;

	/** Error message (if failed) */
	error?: string;

	/** Detailed error information (if parse failed) */
	errorDetails?: ParseError;

	/** Obfuscation metrics and statistics (v1.1) */
	metrics?: ObfuscationMetrics;
}
```

### `ObfuscationMetrics` (v1.1)

```typescript
interface ObfuscationMetrics {
	inputSize: number; // Original code size in bytes
	outputSize: number; // Obfuscated code size in bytes
	sizeRatio: number; // output / input ratio
	compressionRatio: number; // 1 - (output / input)
	inputLines: number; // Original line count
	outputLines: number; // Obfuscated line count
	transformations: {
		namesMangled: number;
		stringsEncoded: number;
		numbersEncoded: number;
		deadCodeBlocks: number;
		controlFlowFlattened: number;
		antiDebugChecks: number;
	};
	duration: number; // Processing time in ms
	encryptionAlgorithm?: string; // Encryption method used
	processingMode?: "client"; // Always client-side
}
```

**Success Example:**

```typescript
{
  success: true,
  code: "local _0x0000 = 5\nprint(_0x0000)"
}
```

**Failure Example:**

```typescript
{
  success: false,
  error: "Unexpected symbol 'end' near 'do'",
  errorDetails: {
    message: "Unexpected symbol 'end' near 'do'",
    line: 3,
    column: 1
  }
}
```

---

### `ParseResult`

Result object returned by `parseLua()`.

```typescript
interface ParseResult {
	/** Whether parsing succeeded */
	success: boolean;

	/** Abstract Syntax Tree (if successful) */
	ast?: any;

	/** Error message (if failed) */
	error?: string;

	/** Detailed error information */
	errorDetails?: ParseError;
}
```

---

### `ParseError`

Detailed parse error information.

```typescript
interface ParseError {
	/** Error message */
	message: string;

	/** Line number where error occurred */
	line?: number;

	/** Column number where error occurred */
	column?: number;
}
```

---

## Obfuscation Techniques

### 1. Name Mangling (`mangleNames`)

Replaces all variable and function names with hexadecimal identifiers like `_0x0000`, `_0x0001`, etc.

**Protected Names:** Lua keywords and standard library functions are preserved:

- Keywords: `and`, `or`, `not`, `if`, `then`, `else`, `end`, `while`, `for`, `do`, `function`, `local`, `return`, etc.
- Standard library: `print`, `pairs`, `ipairs`, `math`, `string`, `table`, `io`, `os`, etc.

**Before:**

```lua
local playerName = "Hero"
function getPlayerName()
  return playerName
end
```

**After:**

```lua
local _0x0000 = "Hero"
function _0x0001()
  return _0x0000
end
```

---

### 2. String Encoding (`encodeStrings`)

Converts string literals to byte arrays using `string.char()`.

**Before:**

```lua
print("Hello, World!")
```

**After:**

```lua
print(string.char(72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33))
```

**Special Handling:**

- Empty strings are not encoded
- Escape sequences (`\n`, `\t`, `\r`, `\\`, `\"`, `\'`) are properly converted to their byte values

---

### 3. Number Encoding (`encodeNumbers`)

Transforms numeric literals into mathematical expressions.

**Strategies:**

1. **Split and Add:** `100` → `(50 + 50)`
2. **Multiply and Divide:** `100` → `(200 / 2)`
3. **Add and Subtract:** `100` → `(150 - 50)`
4. **Bitwise XOR:** `100` → `(173 ^ 205)`

**Before:**

```lua
local health = 100
local damage = 25
```

**After:**

```lua
local health = (50 + 50)
local damage = (50 / 2)
```

**Notes:**

- Small numbers (0-3) are not encoded for efficiency
- Protection level controls encoding probability
- Decimals use appropriate strategies to avoid precision loss

---

### 4. Control Flow Obfuscation (`controlFlow`)

Adds opaque predicates (always-true conditions) to complicate analysis.

**Before:**

```lua
if x > 5 then
  print("High")
end
```

**After:**

```lua
if (1 + 1 == 2) and x > 5 then
  print("High")
end
```

**Opaque Predicates:**

- `(1 + 1 == 2)` - Always true
- `(2 * 3 > 5)` - Always true
- `(10 - 5 == 5)` - Always true
- `(1 * 1 >= 0)` - Always true

**Applies to:**

- `if` statements
- `while` loops
- `repeat-until` loops

---

### 5. Code Minification (`minify`)

Removes unnecessary content to reduce code size.

**Removes:**

- Single-line comments (`--`)
- Multi-line comments (`--[[ ]]`)
- Excessive whitespace
- Blank lines
- Leading/trailing whitespace

**Before:**

```lua
-- Calculate total
local x = 5  -- initial value

-- Print result
print(x)
```

**After:**

```lua
local x = 5
print(x)
```

---

## Error Handling

### Common Errors

#### Syntax Errors

**Error:**

```typescript
{
  success: false,
  error: "Unexpected symbol 'end' near 'do'",
  errorDetails: {
    message: "Unexpected symbol 'end' near 'do'",
    line: 3,
    column: 1
  }
}
```

**Cause:** Invalid Lua syntax in input code

**Solution:** Fix the syntax error at the specified line and column

---

#### Invalid Lua Version

**Error:**

```typescript
{
  success: false,
  error: "goto statement not supported in Lua 5.1"
}
```

**Cause:** Using Lua 5.2+ syntax when targeting Lua 5.1

**Solution:** Remove or replace unsupported syntax

---

### Error Recovery

```typescript
const result = obfuscateLua(code, options);

if (!result.success) {
	console.error("Obfuscation failed:", result.error);

	if (result.errorDetails) {
		const { line, column, message } = result.errorDetails;
		console.error(`Parse error at line ${line}, column ${column}: ${message}`);

		// Highlight error in editor
		editor.highlightLine(line);
	}
}
```

---

### 6. Custom String Encryption (`encryptionAlgorithm`) - v1.1

Advanced encryption algorithms for string obfuscation beyond basic byte arrays.

**XOR Cipher** (`"xor"`): Rotating key encryption with position-dependent keys

**Base64 Encoding** (`"base64"`): Custom alphabet base64 with scrambling

**Huffman Compression** (`"huffman"`): Frequency-based dictionary encoding

**Chunked Strings** (`"chunked"`): Multi-variable string distribution

**Example:**

```typescript
const result = obfuscateLua(code, {
	encodeStrings: true,
	encryptionAlgorithm: "xor", // Use XOR cipher
	protectionLevel: 70,
});
```

---

### 7. Dead Code Injection (`deadCodeInjection`) - v1.1

Injects syntactically valid but unreachable code blocks to confuse analysis.

**Injection Types:**

- Unreachable blocks with false conditionals
- Unused function definitions
- Dummy variable declarations
- Fake loops and table operations

---

### 8. Control Flow Flattening (`controlFlowFlattening`) - v1.1

Transforms linear code into state machine patterns (CPU intensive).

**Note**: This technique significantly increases code size and processing time.

---

### 9. Anti-Debugging (`antiDebugging`) - v1.1

Adds runtime checks to detect debuggers and modified environments.

**Checks Include:**

- Debug library detection
- Execution timing validation
- Environment integrity checks

---

### 10. Output Formatting (`formattingStyle`) - v1.1

Control output code style: `"minified"`, `"pretty"`, `"obfuscated"`, or `"single-line"`.

---

## Code Examples

### Basic Usage

```typescript
import { obfuscateLua } from "@/lib/obfuscator-simple";

const code = `
local function greet(name)
  print("Hello, " .. name)
end
greet("World")
`;

const result = obfuscateLua(code);
console.log(result.code);
```

---

### Custom Configuration

```typescript
const result = obfuscateLua(code, {
	mangleNames: true,
	encodeStrings: true,
	encodeNumbers: true,
	controlFlow: true,
	minify: true,
	protectionLevel: 100, // Maximum protection
});
```

---

### Protection Level Presets

```typescript
// Light protection (fast execution)
const light = obfuscateLua(code, { protectionLevel: 20 });

// Balanced protection
const balanced = obfuscateLua(code, { protectionLevel: 50 });

// Maximum protection (slower execution)
const maximum = obfuscateLua(code, { protectionLevel: 100 });
```

---

### Advanced Features (v1.1)

```typescript
// Using custom encryption algorithm
const encrypted = obfuscateLua(code, {
	encodeStrings: true,
	encryptionAlgorithm: "xor", // XOR cipher
	protectionLevel: 70,
});

// With dead code injection and anti-debugging
const advanced = obfuscateLua(code, {
	mangleNames: true,
	encodeStrings: true,
	deadCodeInjection: true,
	antiDebugging: true,
	protectionLevel: 85,
});

// Maximum protection with all v1.1 features
const maximum = obfuscateLua(code, {
	protectionLevel: 95, // Automatically enables most features
	encryptionAlgorithm: "xor",
	controlFlowFlattening: true,
	deadCodeInjection: true,
	antiDebugging: true,
	formattingStyle: "single-line",
});

// Access obfuscation metrics
if (maximum.success && maximum.metrics) {
	console.log(`Input: ${maximum.metrics.inputSize} bytes`);
	console.log(`Output: ${maximum.metrics.outputSize} bytes`);
	console.log(`Size Ratio: ${maximum.metrics.sizeRatio.toFixed(2)}x`);
	console.log(`Duration: ${maximum.metrics.duration}ms`);
	console.log(`Names Mangled: ${maximum.metrics.transformations.namesMangled}`);
	console.log(`Strings Encrypted: ${maximum.metrics.transformations.stringsEncoded}`);
}
```

---

### Validation Before Obfuscation

```typescript
import { validateLua } from "@/lib/parser";
import { obfuscateLua } from "@/lib/obfuscator-simple";

if (validateLua(code)) {
	const result = obfuscateLua(code);
	// Process result...
} else {
	console.error("Invalid Lua syntax");
}
```

---

### Round-Trip Validation

```typescript
import { parseLua } from "@/lib/parser";
import { generateLua } from "@/lib/generator";
import { obfuscateLua } from "@/lib/obfuscator-simple";

// Obfuscate code
const obfResult = obfuscateLua(code);

// Validate obfuscated code is still valid Lua
if (obfResult.success) {
	const parseResult = parseLua(obfResult.code!);

	if (parseResult.success) {
		console.log("✓ Obfuscated code is valid");
	} else {
		console.error("✗ Obfuscation corrupted code");
	}
}
```

---

### React Component Integration

```typescript
'use client';
import { useState } from 'react';
import { obfuscateLua, ObfuscationOptions } from '@/lib/obfuscator-simple';

export function LuaObfuscator() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');

  const handleObfuscate = () => {
    const options: ObfuscationOptions = {
      mangleNames: true,
      encodeStrings: true,
      minify: true,
      protectionLevel: 50
    };

    const obfResult = obfuscateLua(code, options);

    if (obfResult.success) {
      setResult(obfResult.code!);
    } else {
      alert(obfResult.error);
    }
  };

  return (
    <div>
      <textarea
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Enter Lua code..."
      />
      <button onClick={handleObfuscate}>Obfuscate</button>
      <pre>{result}</pre>
    </div>
  );
}
```

---

## Performance Considerations

### Execution Time

| Technique      | Performance Impact                     |
| -------------- | -------------------------------------- |
| Minify         | Minimal (faster execution)             |
| Mangle Names   | Minimal                                |
| Encode Strings | Low (runtime decoding overhead)        |
| Encode Numbers | Low (runtime calculation overhead)     |
| Control Flow   | Moderate (additional condition checks) |

### Code Size

| Technique      | Size Impact                     |
| -------------- | ------------------------------- |
| Minify         | -30% to -50% (reduces size)     |
| Mangle Names   | Minimal                         |
| Encode Strings | +100% to +300% (increases size) |
| Encode Numbers | +50% to +150% (increases size)  |
| Control Flow   | +20% to +40% (increases size)   |

### Recommendations

**For Production Use:**

- Enable `mangleNames` and `minify`
- Use `protectionLevel: 40-60` for balanced protection
- Avoid `encodeNumbers` and `controlFlow` unless high security is critical

**For Maximum Protection:**

- Use `protectionLevel: 100`
- All techniques enabled
- Accept performance trade-offs

**For Development/Testing:**

- Use `protectionLevel: 0-20`
- Keep code readable for debugging
- Enable `minify` only

---

## Browser Compatibility

The obfuscator runs entirely in the browser:

| Feature           | Requirement        |
| ----------------- | ------------------ |
| JavaScript Engine | ES2015+            |
| Memory            | 50MB minimum       |
| Processing        | Modern CPU (2015+) |

**Supported Browsers:**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Limitations

1. **Lua Version:** Targets Lua 5.1/5.2/5.3 syntax
2. **Obfuscation Strength:** Not cryptographically secure, provides code obscurity only
3. **Reversibility:** Obfuscation can be reversed with sufficient effort
4. **Dynamic Code:** Does not protect against runtime analysis or debugging
5. **String Encoding:** Encoded strings are visible in memory during execution

---

## Support

**Bug Reports:** [GitHub Issues](https://github.com/BillChirico/LUA-Obfuscator/issues)

**Documentation:** [Project README](../README.md)

**License:** See LICENSE file
