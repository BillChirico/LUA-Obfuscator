/**
 * Anti-debugging measures for Lua obfuscation
 * Adds runtime checks to detect and thwart debugging attempts
 */

/**
 * Generate debug library detection code
 * Checks if the debug library is available and terminates if found
 */
export function generateDebugDetection(): string {
	return `if type(debug) == "table" then error("Debug library detected", 0) end`;
}

/**
 * Generate execution timing check
 * Measures execution time to detect debugger slowdown
 */
export function generateTimingCheck(): string {
	const iterations = Math.floor(Math.random() * 1000) + 500;
	const threshold = "0.1";

	return `do
  local _t1 = os.clock and os.clock() or 0
  for _i = 1, ${iterations} do end
  local _t2 = os.clock and os.clock() or 0
  if _t2 - _t1 > ${threshold} then error("Timing anomaly detected", 0) end
end`;
}

/**
 * Generate stack depth validation
 * Detects unusual call stack depths that might indicate debugging
 */
export function generateStackDepthCheck(): string {
	return `do
  local _d = 0
  local function _c()
    _d = _d + 1
    if _d > 100 then return end
    _c()
  end
  if debug and debug.traceback then
    local _s = debug.traceback()
    if _s and #_s > 10000 then error("Stack anomaly detected", 0) end
  end
end`;
}

/**
 * Generate integrity check
 * Validates that code hasn't been modified (simplified checksum)
 */
export function generateIntegrityCheck(seed: number = Math.floor(Math.random() * 10000)): string {
	return `do
  local _chk = ${seed}
  local _val = 0
  for i = 1, 10 do
    _val = (_val + i * _chk) % 65536
  end
  if _val ~= ${(seed * 55) % 65536} then error("Integrity check failed", 0) end
end`;
}

/**
 * Generate environment validation
 * Checks for suspicious global variables or modified standard functions
 */
export function generateEnvironmentCheck(): string {
	return `do
  if _G._DEBUG or _G._TRACE or _G._HOOK then error("Debug environment detected", 0) end
  if type(print) ~= "function" then error("Modified environment detected", 0) end
end`;
}

/**
 * Generate getfenv/setfenv detection (Lua 5.1)
 * Detects if environment manipulation functions are being used
 */
export function generateEnvFunctionCheck(): string {
	return `do
  if getfenv and getfenv(0) ~= _G then error("Environment manipulation detected", 0) end
end`;
}

/**
 * Generate comprehensive anti-debug function
 * Combines multiple checks into a single function
 *
 * @param checks - Array of check types to include
 * @returns Complete anti-debug function code
 */
export function generateAntiDebugFunction(
	checks: Array<"debug" | "timing" | "stack" | "integrity" | "environment" | "envfunc"> = [
		"debug",
		"timing",
		"environment",
	]
): string {
	const funcName = `_ad_${Math.floor(Math.random() * 10000)}`;
	const checkCode: string[] = [];

	// Add selected checks
	if (checks.includes("debug")) {
		checkCode.push(generateDebugDetection());
	}
	if (checks.includes("timing")) {
		checkCode.push(generateTimingCheck());
	}
	if (checks.includes("stack")) {
		checkCode.push(generateStackDepthCheck());
	}
	if (checks.includes("integrity")) {
		checkCode.push(generateIntegrityCheck());
	}
	if (checks.includes("environment")) {
		checkCode.push(generateEnvironmentCheck());
	}
	if (checks.includes("envfunc")) {
		checkCode.push(generateEnvFunctionCheck());
	}

	// Wrap in a function
	return `local function ${funcName}()
  ${checkCode.join("\n  ")}
end
${funcName}()`;
}

/**
 * Inject anti-debug checks at strategic points in code
 *
 * @param code - Original Lua code
 * @param frequency - How often to inject (0-100, higher = more checks)
 * @param checks - Array of check types to use
 * @returns Code with anti-debug checks injected
 */
export function injectAntiDebugChecks(
	code: string,
	frequency: number = 30,
	checks: Array<"debug" | "timing" | "stack" | "integrity" | "environment" | "envfunc"> = ["debug", "environment"]
): string {
	const lines = code.split("\n");
	const result: string[] = [];

	// Add initial anti-debug check at the start
	result.push(generateAntiDebugFunction(checks));
	result.push("");

	// Inject checks throughout the code
	for (let i = 0; i < lines.length; i++) {
		result.push(lines[i]);

		const trimmed = lines[i].trim();

		// Inject after function declarations
		if (trimmed.startsWith("function ") || trimmed.startsWith("local function ")) {
			const shouldInject = Math.random() * 100 < frequency;
			if (shouldInject) {
				// Inject a simple inline check
				const inlineCheck = checks[Math.floor(Math.random() * checks.length)];
				if (inlineCheck === "debug") {
					result.push(`  ${generateDebugDetection()}`);
				} else if (inlineCheck === "environment") {
					result.push(`  ${generateEnvironmentCheck()}`);
				}
			}
		}
	}

	return result.join("\n");
}

/**
 * Inject anti-debug checks into AST
 *
 * @param ast - Lua AST
 * @param frequency - How often to inject (0-100)
 * @returns Modified AST with anti-debug nodes
 */
export function injectAntiDebugAST(ast: any, frequency: number = 30): any {
	if (!ast || typeof ast !== "object") {
		return ast;
	}

	// Inject at function declarations
	if (ast.type === "FunctionDeclaration" && Array.isArray(ast.body)) {
		const shouldInject = Math.random() * 100 < frequency;
		if (shouldInject) {
			// Inject debug detection at start of function
			const debugCheck = createDebugDetectionNode();
			ast.body.unshift(debugCheck);
		}
	}

	// Inject at chunk level (main code)
	if (ast.type === "Chunk" && Array.isArray(ast.body)) {
		// Add anti-debug check at the very beginning
		const antiDebugNode = createDebugDetectionNode();
		ast.body.unshift(antiDebugNode);

		// Randomly inject throughout the code
		const newBody: any[] = [];
		for (const statement of ast.body) {
			newBody.push(statement);

			const shouldInject = Math.random() * 100 < frequency / 2; // Less frequent in main body
			if (shouldInject) {
				newBody.push(createEnvironmentCheckNode());
			}
		}
		ast.body = newBody;
	}

	// Recursively process child nodes
	for (const key in ast) {
		if (ast.hasOwnProperty(key) && key !== "parent") {
			if (Array.isArray(ast[key])) {
				ast[key] = ast[key].map((child: any) => injectAntiDebugAST(child, frequency));
			} else if (typeof ast[key] === "object" && ast[key] !== null) {
				ast[key] = injectAntiDebugAST(ast[key], frequency);
			}
		}
	}

	return ast;
}

/**
 * Create debug detection AST node
 */
function createDebugDetectionNode(): any {
	return {
		type: "IfStatement",
		clauses: [
			{
				type: "IfClause",
				condition: {
					type: "BinaryExpression",
					operator: "==",
					left: {
						type: "CallExpression",
						base: { type: "Identifier", name: "type" },
						arguments: [{ type: "Identifier", name: "debug" }],
					},
					right: { type: "StringLiteral", value: "table", raw: '"table"' },
				},
				body: [
					{
						type: "CallStatement",
						expression: {
							type: "CallExpression",
							base: { type: "Identifier", name: "error" },
							arguments: [
								{ type: "StringLiteral", value: "Debug library detected", raw: '"Debug library detected"' },
								{ type: "NumericLiteral", value: 0 },
							],
						},
					},
				],
			},
		],
	};
}

/**
 * Create environment check AST node
 */
function createEnvironmentCheckNode(): any {
	return {
		type: "IfStatement",
		clauses: [
			{
				type: "IfClause",
				condition: {
					type: "LogicalExpression",
					operator: "or",
					left: {
						type: "MemberExpression",
						base: { type: "Identifier", name: "_G" },
						identifier: { type: "Identifier", name: "_DEBUG" },
					},
					right: {
						type: "MemberExpression",
						base: { type: "Identifier", name: "_G" },
						identifier: { type: "Identifier", name: "_TRACE" },
					},
				},
				body: [
					{
						type: "CallStatement",
						expression: {
							type: "CallExpression",
							base: { type: "Identifier", name: "error" },
							arguments: [
								{ type: "StringLiteral", value: "Debug environment detected", raw: '"Debug environment detected"' },
								{ type: "NumericLiteral", value: 0 },
							],
						},
					},
				],
			},
		],
	};
}
