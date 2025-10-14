/**
 * Control flow obfuscation and flattening
 * Transforms linear code into state machine patterns
 */

/**
 * Generate a random state number
 */
function generateStateNumber(): number {
	return Math.floor(Math.random() * 10000) + 1;
}

/**
 * Flatten a simple if-then-else structure into a state machine
 *
 * @param ast - AST node to flatten
 * @returns Flattened AST node
 */
export function flattenIfStatement(ast: any): any {
	if (!ast || ast.type !== "IfStatement") {
		return ast;
	}

	// Extract the clauses
	const clauses = ast.clauses || [];
	if (clauses.length === 0) {
		return ast;
	}

	// Create state variables
	const stateVar = `_state_${Math.floor(Math.random() * 10000)}`;
	const states: any[] = [];
	let stateCounter = 1;

	// Build state machine structure
	for (let i = 0; i < clauses.length; i++) {
		const clause = clauses[i];
		const currentState = stateCounter++;
		const nextState = i < clauses.length - 1 ? stateCounter : -1;

		if (clause.type === "IfClause" || clause.type === "ElseifClause") {
			// Create state for condition check
			states.push({
				state: currentState,
				condition: clause.condition,
				body: clause.body,
				nextState: nextState,
			});
		} else if (clause.type === "ElseClause") {
			// Else clause always executes
			states.push({
				state: currentState,
				condition: null,
				body: clause.body,
				nextState: -1,
			});
		}
	}

	// Generate state machine AST
	// This is a simplified version - full implementation would create complete AST
	return ast; // Return original for now, full implementation in integration phase
}

/**
 * Flatten sequential code blocks into state machine
 *
 * @param statements - Array of statement nodes
 * @returns State machine structure
 */
export function flattenSequentialCode(statements: any[]): any {
	if (!Array.isArray(statements) || statements.length < 3) {
		// Not worth flattening short sequences
		return statements;
	}

	const stateVar = `_s_${Math.floor(Math.random() * 10000)}`;
	const states: any[] = [];

	// Convert each statement to a state
	statements.forEach((stmt, index) => {
		states.push({
			stateNumber: index + 1,
			statement: stmt,
			nextState: index + 1 < statements.length ? index + 2 : -1,
		});
	});

	// Build state machine structure
	// Full AST generation happens during integration
	return {
		type: "StateMachine",
		stateVariable: stateVar,
		states: states,
		originalStatements: statements,
	};
}

/**
 * Split complex conditions into nested if statements
 *
 * @param condition - Complex condition AST node
 * @returns Nested if statements
 */
export function splitComplexCondition(condition: any): any {
	if (!condition || condition.type !== "LogicalExpression") {
		return condition;
	}

	// Split AND conditions into nested ifs
	if (condition.operator === "and") {
		return {
			type: "NestedCondition",
			outerCondition: condition.left,
			innerCondition: condition.right,
		};
	}

	// Split OR conditions into separate if-else branches
	if (condition.operator === "or") {
		return {
			type: "AlternativeConditions",
			conditions: [condition.left, condition.right],
		};
	}

	return condition;
}

/**
 * Unroll small loops into repeated statements
 *
 * @param loopNode - For loop AST node
 * @returns Unrolled statements or original loop
 */
export function unrollLoop(loopNode: any): any {
	if (!loopNode || loopNode.type !== "ForNumericStatement") {
		return loopNode;
	}

	// Only unroll loops with constant, small iteration counts
	const start = loopNode.start;
	const end = loopNode.end;

	if (
		start?.type === "NumericLiteral" &&
		end?.type === "NumericLiteral" &&
		typeof start.value === "number" &&
		typeof end.value === "number"
	) {
		const iterations = end.value - start.value + 1;

		// Only unroll very small loops (max 5 iterations)
		if (iterations > 0 && iterations <= 5) {
			return {
				type: "UnrolledLoop",
				iterations: iterations,
				variable: loopNode.variable,
				body: loopNode.body,
				start: start.value,
			};
		}
	}

	return loopNode;
}

/**
 * Create a jump table for indirect control flow
 *
 * @param cases - Array of case statements
 * @returns Jump table structure
 */
export function createJumpTable(cases: any[]): any {
	if (!Array.isArray(cases) || cases.length === 0) {
		return null;
	}

	// Generate random jump indices
	const jumpIndices = cases.map(() => generateStateNumber());

	return {
		type: "JumpTable",
		indices: jumpIndices,
		cases: cases,
	};
}

/**
 * Apply control flow flattening to an AST
 *
 * @param ast - Lua AST
 * @param intensity - Flattening intensity (0-100)
 * @returns Flattened AST
 */
export function applyControlFlowFlattening(ast: any, intensity: number = 50): any {
	if (!ast || typeof ast !== "object") {
		return ast;
	}

	// Decide whether to flatten based on intensity
	const shouldFlatten = Math.random() * 100 < intensity;

	if (shouldFlatten) {
		// Flatten if statements
		if (ast.type === "IfStatement") {
			ast = flattenIfStatement(ast);
		}

		// Unroll small loops
		if (ast.type === "ForNumericStatement") {
			ast = unrollLoop(ast);
		}

		// Split complex conditions
		if (ast.type === "LogicalExpression") {
			ast = splitComplexCondition(ast);
		}
	}

	// Recursively process child nodes
	for (const key in ast) {
		if (ast.hasOwnProperty(key) && key !== "parent") {
			if (Array.isArray(ast[key])) {
				ast[key] = ast[key].map((child: any) => applyControlFlowFlattening(child, intensity));
			} else if (typeof ast[key] === "object" && ast[key] !== null) {
				ast[key] = applyControlFlowFlattening(ast[key], intensity);
			}
		}
	}

	return ast;
}

/**
 * Convert a linear code block into a while-based state machine
 *
 * @param code - Lua code string
 * @returns State machine code
 */
export function convertToStateMachine(code: string): string {
	const lines = code.split("\n").filter(line => line.trim() !== "");

	if (lines.length < 3) {
		return code; // Not worth converting
	}

	const stateVar = `_state_${Math.floor(Math.random() * 10000)}`;
	const states: string[] = [];

	// Build state machine
	states.push(`local ${stateVar} = 1`);
	states.push(`while ${stateVar} > 0 do`);

	lines.forEach((line, index) => {
		const stateNum = index + 1;
		const nextState = index + 1 < lines.length ? index + 2 : -1;

		if (index === 0) {
			states.push(`  if ${stateVar} == ${stateNum} then`);
		} else {
			states.push(`  elseif ${stateVar} == ${stateNum} then`);
		}

		states.push(`    ${line}`);
		states.push(`    ${stateVar} = ${nextState}`);
	});

	states.push(`  end`);
	states.push(`end`);

	return states.join("\n");
}
