/**
 * AST to Lua code generator
 * Converts AST nodes back to valid Lua source code
 */

export function generateLua(ast: any): string {
	if (!ast) return "";
	return generateNode(ast);
}

function generateNode(node: any): string {
	if (!node) return "";

	switch (node.type) {
		case "Chunk":
			return generateChunk(node);

		case "LocalStatement":
			return generateLocalStatement(node);

		case "AssignmentStatement":
			return generateAssignmentStatement(node);

		case "Identifier":
			return node.name;

		case "NumericLiteral":
			return generateNumericLiteral(node);

		case "StringLiteral":
			return generateStringLiteral(node);

		case "BooleanLiteral":
			return String(node.value);

		case "NilLiteral":
			return "nil";

		case "FunctionDeclaration":
			return generateFunctionDeclaration(node);

		case "CallStatement":
			return generateCallStatement(node);

		case "CallExpression":
			return generateCallExpression(node);

		case "BinaryExpression":
			return generateBinaryExpression(node);

		case "LogicalExpression":
			return generateBinaryExpression(node); // Logical expressions have same structure as binary

		case "UnaryExpression":
			return generateUnaryExpression(node);

		case "MemberExpression":
			return generateMemberExpression(node);

		case "IndexExpression":
			return generateIndexExpression(node);

		case "TableConstructorExpression":
			return generateTableConstructor(node);

		case "ReturnStatement":
			return generateReturnStatement(node);

		case "IfStatement":
			return generateIfStatement(node);

		case "WhileStatement":
			return generateWhileStatement(node);

		case "RepeatStatement":
			return generateRepeatStatement(node);

		case "ForNumericStatement":
			return generateForNumericStatement(node);

		case "ForGenericStatement":
			return generateForGenericStatement(node);

		case "BreakStatement":
			return "break";

		case "DoStatement":
			return generateDoStatement(node);

		default:
			console.warn(`Unknown node type: ${node.type}`);
			return "";
	}
}

function generateChunk(node: any): string {
	return node.body.map(generateNode).filter(Boolean).join("\n");
}

function generateLocalStatement(node: any): string {
	const vars = node.variables.map(generateNode).join(", ");
	if (node.init && node.init.length > 0) {
		const init = node.init.map(generateNode).join(", ");
		return `local ${vars} = ${init}`;
	}
	return `local ${vars}`;
}

function generateAssignmentStatement(node: any): string {
	const vars = node.variables.map(generateNode).join(", ");
	const init = node.init.map(generateNode).join(", ");
	return `${vars} = ${init}`;
}

function generateNumericLiteral(node: any): string {
	// Handle encoded numbers (number obfuscation)
	if (node.wasEncoded && node.encodedExpression) {
		// Generate the mathematical expression
		return `(${generateNode(node.encodedExpression)})`;
	}

	// Handle normal (non-encoded) numbers
	return String(node.value);
}

function generateStringLiteral(node: any): string {
	// Handle encoded strings (string obfuscation)
	if (node.wasEncoded && node.encodedValue && Array.isArray(node.encodedValue) && node.encodedValue.length > 0) {
		// Generate Lua decoder using string.char
		// Filters out any null/undefined values and joins byte values
		const bytes = node.encodedValue.filter((b: any) => b != null && typeof b === "number").join(", ");

		// Only use encoding if we have valid bytes, otherwise fall back to normal string
		if (bytes.length > 0) {
			return `string.char(${bytes})`;
		}
	}

	// Handle normal (non-encoded) strings OR fallback if encoding failed
	// luaparse sets node.value to null, so we need to extract from node.raw
	if (node.raw) {
		// Return the raw string as-is (it already includes quotes and escaping)
		return node.raw;
	}

	// Fallback for edge cases where raw is not available
	const delimiter = '"';
	const value = (node.value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
	return `${delimiter}${value}${delimiter}`;
}

function generateFunctionDeclaration(node: any): string {
	const isLocal = node.isLocal ? "local " : "";
	const name = node.identifier ? generateNode(node.identifier) : "";
	const params = node.parameters.map(generateNode).join(", ");
	const body = node.body.map(generateNode).filter(Boolean).join("\n  ");

	return `${isLocal}function ${name}(${params})\n  ${body}\nend`;
}

function generateCallStatement(node: any): string {
	return generateNode(node.expression);
}

function generateCallExpression(node: any): string {
	const base = generateNode(node.base);
	const args = node.arguments.map(generateNode).join(", ");
	return `${base}(${args})`;
}

function generateBinaryExpression(node: any): string {
	const left = generateNode(node.left);
	const right = generateNode(node.right);
	return `${left} ${node.operator} ${right}`;
}

function generateUnaryExpression(node: any): string {
	const arg = generateNode(node.argument);
	// Add space after 'not' operator (word-based operator requires space)
	if (node.operator === "not") {
		return `${node.operator} ${arg}`;
	}
	// For other operators like '-', '#', no space needed
	return `${node.operator}${arg}`;
}

function generateMemberExpression(node: any): string {
	const base = generateNode(node.base);
	const identifier = generateNode(node.identifier);
	return `${base}.${identifier}`;
}

function generateIndexExpression(node: any): string {
	const base = generateNode(node.base);
	const index = generateNode(node.index);
	return `${base}[${index}]`;
}

function generateTableConstructor(node: any): string {
	if (!node.fields || node.fields.length === 0) return "{}";

	const fields = node.fields.map((field: any) => {
		if (field.type === "TableKey") {
			const key = generateNode(field.key);
			const value = generateNode(field.value);
			return `[${key}] = ${value}`;
		} else if (field.type === "TableKeyString") {
			const key = generateNode(field.key);
			const value = generateNode(field.value);
			return `${key} = ${value}`;
		} else if (field.type === "TableValue") {
			return generateNode(field.value);
		}
		return "";
	});

	return `{ ${fields.join(", ")} }`;
}

function generateReturnStatement(node: any): string {
	if (!node.arguments || node.arguments.length === 0) return "return";
	const args = node.arguments.map(generateNode).join(", ");
	return `return ${args}`;
}

function generateIfStatement(node: any): string {
	let result = "";

	// Generate if clause
	for (let i = 0; i < node.clauses.length; i++) {
		const clause = node.clauses[i];

		if (clause.type === "IfClause") {
			const condition = generateNode(clause.condition);
			const body = clause.body.map(generateNode).filter(Boolean).join("\n  ");
			result += `if ${condition} then\n  ${body}`;
		} else if (clause.type === "ElseifClause") {
			const condition = generateNode(clause.condition);
			const body = clause.body.map(generateNode).filter(Boolean).join("\n  ");
			result += `\nelseif ${condition} then\n  ${body}`;
		} else if (clause.type === "ElseClause") {
			const body = clause.body.map(generateNode).filter(Boolean).join("\n  ");
			result += `\nelse\n  ${body}`;
		}
	}

	result += "\nend";
	return result;
}

function generateWhileStatement(node: any): string {
	const condition = generateNode(node.condition);
	const body = node.body.map(generateNode).filter(Boolean).join("\n  ");
	return `while ${condition} do\n  ${body}\nend`;
}

function generateRepeatStatement(node: any): string {
	const condition = generateNode(node.condition);
	const body = node.body.map(generateNode).filter(Boolean).join("\n  ");
	return `repeat\n  ${body}\nuntil ${condition}`;
}

function generateForNumericStatement(node: any): string {
	const variable = generateNode(node.variable);
	const start = generateNode(node.start);
	const end = generateNode(node.end);
	const step = node.step ? `, ${generateNode(node.step)}` : "";
	const body = node.body.map(generateNode).filter(Boolean).join("\n  ");
	return `for ${variable} = ${start}, ${end}${step} do\n  ${body}\nend`;
}

function generateForGenericStatement(node: any): string {
	const variables = node.variables.map(generateNode).join(", ");
	const iterators = node.iterators.map(generateNode).join(", ");
	const body = node.body.map(generateNode).filter(Boolean).join("\n  ");
	return `for ${variables} in ${iterators} do\n  ${body}\nend`;
}

function generateDoStatement(node: any): string {
	const body = node.body.map(generateNode).filter(Boolean).join("\n  ");
	return `do\n  ${body}\nend`;
}
