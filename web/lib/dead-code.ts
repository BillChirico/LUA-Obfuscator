/**
 * Dead code injection for obfuscation
 * Generates syntactically valid but semantically meaningless code
 */

/**
 * Generate a random variable name
 */
function generateRandomVar(): string {
	const prefixes = ["tmp", "var", "val", "data", "result", "cache", "buffer"];
	const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
	const suffix = Math.floor(Math.random() * 10000);
	return `_${prefix}_${suffix}`;
}

/**
 * Generate a random numeric value
 */
function generateRandomNumber(): number {
	return Math.floor(Math.random() * 1000);
}

/**
 * Generate a false conditional (always evaluates to false)
 */
function generateFalseCondition(): string {
	const conditions = ["1 > 2", "false", "0 == 1", "nil and true", "10 < 5", "'a' == 'b'", "not true", "5 + 5 == 11"];
	return conditions[Math.floor(Math.random() * conditions.length)];
}

/**
 * Generate a dummy math operation
 */
function generateDummyMathOperation(varName: string): string {
	const operations = [
		`${varName} = ${varName} + ${generateRandomNumber()}`,
		`${varName} = ${varName} * 2`,
		`${varName} = ${varName} - ${generateRandomNumber()}`,
		`${varName} = math.abs(${varName})`,
		`${varName} = math.floor(${varName} / 2)`,
		`${varName} = ${varName} % 100`,
	];
	return operations[Math.floor(Math.random() * operations.length)];
}

/**
 * Generate a dummy loop
 */
function generateDummyLoop(): string {
	const varName = generateRandomVar();
	const iterations = Math.floor(Math.random() * 10) + 1;
	const operation = generateDummyMathOperation(varName);

	return `for ${varName} = 1, ${iterations} do
  ${operation}
end`;
}

/**
 * Generate a dummy table operation
 */
function generateDummyTableOperation(): string {
	const tableName = generateRandomVar();
	const operations = [
		`local ${tableName} = {}
for i = 1, ${generateRandomNumber()} do
  ${tableName}[i] = i * 2
end`,
		`local ${tableName} = {${generateRandomNumber()}, ${generateRandomNumber()}, ${generateRandomNumber()}}
table.insert(${tableName}, ${generateRandomNumber()})`,
		`local ${tableName} = {}
${tableName}.x = ${generateRandomNumber()}
${tableName}.y = ${generateRandomNumber()}`,
	];
	return operations[Math.floor(Math.random() * operations.length)];
}

/**
 * Generate a dummy function
 */
function generateDummyFunction(): string {
	const funcName = generateRandomVar();
	const param1 = generateRandomVar();
	const param2 = generateRandomVar();
	const localVar = generateRandomVar();

	const operations = [
		`local function ${funcName}(${param1}, ${param2})
  local ${localVar} = ${param1} + ${param2}
  ${generateDummyMathOperation(localVar)}
  return ${localVar}
end`,
		`local function ${funcName}(${param1})
  if ${param1} > 0 then
    return ${param1} * 2
  else
    return 0
  end
end`,
		`local function ${funcName}()
  local ${localVar} = ${generateRandomNumber()}
  for i = 1, 10 do
    ${localVar} = ${localVar} + i
  end
  return ${localVar}
end`,
	];
	return operations[Math.floor(Math.random() * operations.length)];
}

/**
 * Generate a dummy conditional block
 */
function generateDummyConditional(): string {
	const varName = generateRandomVar();
	const value = generateRandomNumber();

	return `local ${varName} = ${value}
if ${varName} > ${value + 100} then
  ${generateDummyMathOperation(varName)}
elseif ${varName} < ${value - 100} then
  ${varName} = 0
end`;
}

/**
 * Generate dead code that will never execute
 * Wrapped in a false conditional to ensure it's unreachable
 */
export function generateUnreachableBlock(): string {
	const condition = generateFalseCondition();
	const blocks = [generateDummyLoop(), generateDummyTableOperation(), generateDummyConditional()];
	const block = blocks[Math.floor(Math.random() * blocks.length)];

	return `if ${condition} then
  ${block}
end`;
}

/**
 * Generate a standalone dummy function (unreferenced)
 */
export function generateUnusedFunction(): string {
	return generateDummyFunction();
}

/**
 * Generate dummy variable declarations
 */
export function generateDummyVariables(): string {
	const count = Math.floor(Math.random() * 3) + 1;
	const declarations: string[] = [];

	for (let i = 0; i < count; i++) {
		const varName = generateRandomVar();
		const value = generateRandomNumber();
		declarations.push(`local ${varName} = ${value}`);
	}

	return declarations.join("\n");
}

/**
 * Generate a complete dead code snippet
 * Randomly selects from various dead code types
 */
export function generateDeadCode(): string {
	const types = [
		generateUnreachableBlock,
		generateUnusedFunction,
		generateDummyVariables,
		() => generateDummyLoop(),
		() => generateDummyTableOperation(),
	];

	const generator = types[Math.floor(Math.random() * types.length)];
	return generator();
}

/**
 * Inject dead code into Lua source at random positions
 *
 * @param code - Original Lua code
 * @param injectionRate - Percentage (0-100) of lines where dead code should be injected
 * @returns Code with dead code injected
 */
export function injectDeadCode(code: string, injectionRate: number = 50): string {
	const lines = code.split("\n");
	const result: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		result.push(lines[i]);

		// Skip empty lines and comments
		const trimmed = lines[i].trim();
		if (trimmed === "" || trimmed.startsWith("--")) {
			continue;
		}

		// Randomly inject dead code based on injection rate
		const shouldInject = Math.random() * 100 < injectionRate;
		if (shouldInject) {
			result.push(generateDeadCode());
		}
	}

	return result.join("\n");
}

/**
 * Inject dead code into AST nodes
 * More sophisticated than line-based injection
 *
 * @param ast - Lua AST
 * @param injectionRate - Percentage (0-100) of blocks where dead code should be injected
 * @returns Modified AST with dead code nodes
 */
export function injectDeadCodeAST(ast: any, injectionRate: number = 50): any {
	if (!ast || typeof ast !== "object") {
		return ast;
	}

	// If this is a chunk or body array, inject dead code statements
	if (ast.type === "Chunk" && Array.isArray(ast.body)) {
		const newBody: any[] = [];

		for (const statement of ast.body) {
			newBody.push(statement);

			// Randomly inject dead code after this statement
			const shouldInject = Math.random() * 100 < injectionRate;
			if (shouldInject) {
				// Generate dead code as a string and parse it (simplified approach)
				// In production, we'd create proper AST nodes
				const deadCodeComment = {
					type: "Comment",
					value: generateDeadCode(),
					raw: `--[[ ${generateDeadCode()} ]]`,
				};
				// For now, we'll inject as a string literal in an if statement
				const deadCodeNode = createDeadCodeNode();
				if (deadCodeNode) {
					newBody.push(deadCodeNode);
				}
			}
		}

		ast.body = newBody;
	}

	// Recursively process child nodes
	for (const key in ast) {
		if (ast.hasOwnProperty(key) && key !== "parent") {
			if (Array.isArray(ast[key])) {
				ast[key] = ast[key].map((child: any) => injectDeadCodeAST(child, injectionRate));
			} else if (typeof ast[key] === "object" && ast[key] !== null) {
				ast[key] = injectDeadCodeAST(ast[key], injectionRate);
			}
		}
	}

	return ast;
}

/**
 * Create a dead code AST node (unreachable if statement)
 */
function createDeadCodeNode(): any {
	const varName = generateRandomVar();
	const value = generateRandomNumber();

	// Create an if statement that will never execute
	return {
		type: "IfStatement",
		clauses: [
			{
				type: "IfClause",
				condition: {
					type: "BinaryExpression",
					operator: ">",
					left: { type: "NumericLiteral", value: 1 },
					right: { type: "NumericLiteral", value: 2 },
				},
				body: [
					{
						type: "LocalStatement",
						variables: [{ type: "Identifier", name: varName }],
						init: [{ type: "NumericLiteral", value }],
					},
				],
			},
		],
	};
}
