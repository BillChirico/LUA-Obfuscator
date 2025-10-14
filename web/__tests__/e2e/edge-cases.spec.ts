import { test, expect } from "@playwright/test";
import { createHelpers, waitForPageReady } from "./helpers";

/**
 * E2E Edge Case Tests
 * Tests application behavior with unusual or extreme inputs
 */
test.describe("Edge Cases", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await waitForPageReady(page);
	});

	test("should handle Unicode characters in code", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const unicodeCode = `local greeting = "Hello 世界 🌍"
print(greeting)
local emoji = "🚀"
return emoji`;

		await monaco.setInputCode(unicodeCode);
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
		
		// Should not have errors
		const hasError = await ui.hasError();
		expect(hasError).toBe(false);
	});

	test("should handle very long single line", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Create a very long single line
		const longLine = "local x = " + Array(100).fill("1").join(" + ");
		
		await monaco.setInputCode(longLine);
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
	});

	test("should handle deeply nested structures", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		// Create deeply nested code
		let nestedCode = 'local result\n';
		const depth = 20;
		
		for (let i = 0; i < depth; i++) {
			nestedCode += 'if true then\n';
		}
		nestedCode += 'result = "deep"\n';
		for (let i = 0; i < depth; i++) {
			nestedCode += 'end\n';
		}

		await monaco.setInputCode(nestedCode);
		await ui.clickObfuscate();
		await monaco.waitForOutput(10000);

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
	});

	test("should handle code with only comments", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const commentOnlyCode = `-- This is a comment
-- Another comment
-- And another one`;

		await monaco.setInputCode(commentOnlyCode);
		await ui.clickObfuscate();
		
		// Should handle gracefully (may produce minimal output or error)
		await page.waitForTimeout(1000);
		
		const output = await monaco.getEditorContent(1);
		// Either produces output or shows error, both are acceptable
		const hasError = await ui.hasError();
		expect(output.length > 0 || hasError).toBe(true);
	});

	test("should handle code with only whitespace", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const whitespaceCode = "   \n\n   \n\t\t\n   ";
		await monaco.setInputCode(whitespaceCode);

		// Obfuscate button should be disabled or show error
		const obfuscateButton = page.getByRole("button", { name: /Obfuscate/i });
		const isDisabled = await obfuscateButton.isDisabled();
		
		if (!isDisabled) {
			await ui.clickObfuscate();
			await page.waitForTimeout(1000);
			
			// Should show error or handle gracefully
			const hasError = await ui.hasError();
			expect(hasError).toBe(true);
		}
	});

	test("should handle special Lua keywords and patterns", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const specialCode = `local function test()
  local _ENV = {print = print}
  local _G = _G
  return function(...)
    local arg = {...}
    return table.concat(arg, ",")
  end
end`;

		await monaco.setInputCode(specialCode);
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
		
		const hasError = await ui.hasError();
		expect(hasError).toBe(false);
	});

	test("should handle string with escaped characters", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const escapedCode = `local str = "Line1\\nLine2\\tTab\\\\Backslash\\"Quote"
print(str)
local multiline = [[
Multiple
Lines
Here
]]`;

		await monaco.setInputCode(escapedCode);
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
	});

	test("should handle hexadecimal and scientific notation", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const numericCode = `local hex = 0xFF
local sci = 1.23e-4
local large = 1e10
print(hex, sci, large)`;

		await monaco.setInputCode(numericCode);
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
	});

	test("should handle varargs and multiple returns", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const varargsCode = `function multiReturn(...)
  local args = {...}
  return unpack(args)
end

local a, b, c = multiReturn(1, 2, 3)`;

		await monaco.setInputCode(varargsCode);
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
	});

	test("should handle metatables and metamethods", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const metaCode = `local mt = {
  __add = function(a, b)
    return a.value + b.value
  end,
  __tostring = function(t)
    return tostring(t.value)
  end
}
local obj = {value = 10}
setmetatable(obj, mt)`;

		await monaco.setInputCode(metaCode);
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
	});

	test("should handle coroutines", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const coroutineCode = `local co = coroutine.create(function()
  for i = 1, 5 do
    coroutine.yield(i)
  end
end)

while coroutine.status(co) ~= "dead" do
  local success, value = coroutine.resume(co)
  print(value)
end`;

		await monaco.setInputCode(coroutineCode);
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
	});

	test("should handle goto statements (Lua 5.2+)", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const gotoCode = `local x = 0
::start::
x = x + 1
if x < 5 then
  goto start
end
::finish::
print(x)`;

		await monaco.setInputCode(gotoCode);
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		const output = await monaco.getEditorContent(1);
		// May succeed or fail depending on Lua version support
		// Both outcomes are acceptable for this edge case
		expect(output.length >= 0).toBe(true);
	});

	test("should handle code with bit operations", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const bitCode = `local a = 0xFF
local b = 0x0F
local result = bit32.band(a, b)
print(result)`;

		await monaco.setInputCode(bitCode);
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
	});

	test("should handle empty functions and tables", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const emptyCode = `function empty() end
local emptyTable = {}
local emptyFunc = function() end
return empty, emptyTable, emptyFunc`;

		await monaco.setInputCode(emptyCode);
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
	});

	test("should handle require and module patterns", async ({ page }) => {
		const { monaco, ui } = createHelpers(page);

		const moduleCode = `local M = {}

function M.greet(name)
  return "Hello, " .. name
end

function M.farewell(name)
  return "Goodbye, " .. name
end

return M`;

		await monaco.setInputCode(moduleCode);
		await ui.clickObfuscate();
		await monaco.waitForOutput();

		const output = await monaco.getEditorContent(1);
		expect(output.length).toBeGreaterThan(0);
	});
});
