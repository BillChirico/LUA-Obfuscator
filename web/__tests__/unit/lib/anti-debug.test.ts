/**
 * Unit tests for anti-debugging module
 */

import {
	generateDebugDetection,
	generateTimingCheck,
	generateStackDepthCheck,
	generateIntegrityCheck,
	generateEnvironmentCheck,
	generateEnvFunctionCheck,
	generateAntiDebugFunction,
	injectAntiDebugChecks,
} from "@/lib/anti-debug";

describe("Anti-Debug Module", () => {
	describe("generateDebugDetection", () => {
		it("should generate debug library check", () => {
			const code = generateDebugDetection();
			expect(code).toContain("type(debug)");
			expect(code).toContain("error");
		});

		it("should check for table type", () => {
			const code = generateDebugDetection();
			expect(code).toContain('"table"');
		});

		it("should produce valid Lua syntax", () => {
			const code = generateDebugDetection();
			expect(code).toMatch(/if.*then.*end/);
		});
	});

	describe("generateTimingCheck", () => {
		it("should generate timing validation code", () => {
			const code = generateTimingCheck();
			expect(code).toContain("os.clock");
			expect(code).toContain("for");
			expect(code).toContain("error");
		});

		it("should use a threshold", () => {
			const code = generateTimingCheck();
			expect(code).toMatch(/>\s*0\.\d+/);
		});

		it("should have a loop for timing", () => {
			const code = generateTimingCheck();
			expect(code).toContain("for _i");
		});

		it("should be wrapped in do-end block", () => {
			const code = generateTimingCheck();
			expect(code).toContain("do");
			expect(code).toContain("end");
		});
	});

	describe("generateStackDepthCheck", () => {
		it("should generate stack depth validation", () => {
			const code = generateStackDepthCheck();
			expect(code).toContain("debug");
			expect(code).toContain("traceback");
		});

		it("should check for debug.traceback", () => {
			const code = generateStackDepthCheck();
			expect(code).toContain("debug.traceback");
		});

		it("should be wrapped in do-end block", () => {
			const code = generateStackDepthCheck();
			expect(code).toMatch(/^do\b/);
			expect(code).toMatch(/\bend$/);
		});
	});

	describe("generateIntegrityCheck", () => {
		it("should generate integrity validation", () => {
			const code = generateIntegrityCheck();
			expect(code).toContain("_chk");
			expect(code).toContain("error");
		});

		it("should use provided seed", () => {
			const code = generateIntegrityCheck(1234);
			expect(code).toContain("1234");
		});

		it("should calculate checksum", () => {
			const code = generateIntegrityCheck();
			expect(code).toContain("for i");
			expect(code).toMatch(/_val.*%.*65536/);
		});

		it("should be wrapped in do-end block", () => {
			const code = generateIntegrityCheck();
			expect(code).toContain("do");
			expect(code).toContain("end");
		});
	});

	describe("generateEnvironmentCheck", () => {
		it("should check for debug globals", () => {
			const code = generateEnvironmentCheck();
			expect(code).toContain("_G._DEBUG");
			expect(code).toContain("_G._TRACE");
		});

		it("should check for modified functions", () => {
			const code = generateEnvironmentCheck();
			expect(code).toContain('type(print) ~= "function"');
		});

		it("should generate error on detection", () => {
			const code = generateEnvironmentCheck();
			expect(code).toContain("error");
		});

		it("should be wrapped in do-end block", () => {
			const code = generateEnvironmentCheck();
			expect(code).toContain("do");
			expect(code).toContain("end");
		});
	});

	describe("generateEnvFunctionCheck", () => {
		it("should check for getfenv", () => {
			const code = generateEnvFunctionCheck();
			expect(code).toContain("getfenv");
		});

		it("should compare with _G", () => {
			const code = generateEnvFunctionCheck();
			expect(code).toContain("_G");
		});

		it("should be wrapped in do-end block", () => {
			const code = generateEnvFunctionCheck();
			expect(code).toContain("do");
			expect(code).toContain("end");
		});
	});

	describe("generateAntiDebugFunction", () => {
		it("should generate a complete function", () => {
			const code = generateAntiDebugFunction();
			expect(code).toContain("local function");
			expect(code).toContain("end");
			expect(code).toMatch(/_ad_\d+/);
		});

		it("should include specified checks", () => {
			const code = generateAntiDebugFunction(["debug", "timing"]);
			expect(code).toContain("type(debug)");
			expect(code).toContain("os.clock");
		});

		it("should call the function after defining it", () => {
			const code = generateAntiDebugFunction();
			const match = code.match(/_ad_(\d+)/);
			if (match) {
				const functionName = match[0];
				expect(code).toContain(`${functionName}()`);
			}
		});

		it("should handle multiple check types", () => {
			const code = generateAntiDebugFunction(["debug", "timing", "environment"]);
			expect(code).toContain("type(debug)");
			expect(code).toContain("os.clock");
			expect(code).toContain("_G._DEBUG");
		});

		it("should handle all check types", () => {
			const code = generateAntiDebugFunction(["debug", "timing", "stack", "integrity", "environment", "envfunc"]);

			expect(code).toContain("type(debug)");
			expect(code).toContain("os.clock");
			expect(code).toContain("traceback");
			expect(code).toContain("_chk");
			expect(code).toContain("_G._DEBUG");
			expect(code).toContain("getfenv");
		});

		it("should use default checks if none specified", () => {
			const code = generateAntiDebugFunction();
			expect(code.length).toBeGreaterThan(50);
		});
	});

	describe("injectAntiDebugChecks", () => {
		const sampleCode = `local function test()
  print("Hello")
end

local x = 10
print(x)`;

		it("should inject checks at the beginning", () => {
			const result = injectAntiDebugChecks(sampleCode, 100);
			const lines = result.split("\n");
			// First line should be anti-debug function
			expect(lines[0]).toContain("local function _ad_");
		});

	it("should inject more checks at higher frequency", () => {
		// Run multiple iterations to account for randomization
		const iterations = 50;
		let lowTotal = 0;
		let highTotal = 0;

		for (let i = 0; i < iterations; i++) {
			const low = injectAntiDebugChecks(sampleCode, 10);
			const high = injectAntiDebugChecks(sampleCode, 90);
			lowTotal += low.length;
			highTotal += high.length;
		}

		// On average, higher frequency should produce more code
		const lowAvg = lowTotal / iterations;
		const highAvg = highTotal / iterations;
		expect(highAvg).toBeGreaterThan(lowAvg);
	});

		it("should preserve original code", () => {
			const result = injectAntiDebugChecks(sampleCode, 50);
			expect(result).toContain('print("Hello")');
			expect(result).toContain("local x = 10");
		});

		it("should inject after function declarations", () => {
			const code = "local function test()\n  return true\nend";
			const result = injectAntiDebugChecks(code, 100, ["debug"]);

			// Should have anti-debug checks inside functions
			expect(result).toContain("function test()");
		});

		it("should handle empty code", () => {
			const result = injectAntiDebugChecks("", 50);
			// Should at least have the initial anti-debug function
			expect(result).toContain("local function _ad_");
		});

		it("should respect check types parameter", () => {
			const result = injectAntiDebugChecks(sampleCode, 50, ["debug"]);
			expect(result).toContain("type(debug)");
		});
	});

	describe("Code Generation Quality", () => {
		it("should generate unique function names", () => {
			const names = new Set();
			for (let i = 0; i < 10; i++) {
				const code = generateAntiDebugFunction();
				const match = code.match(/_ad_\d+/);
				if (match) {
					names.add(match[0]);
				}
			}
			expect(names.size).toBeGreaterThan(1);
		});

		it("should not generate syntax errors", () => {
			const checks = ["debug", "timing", "stack", "integrity", "environment", "envfunc"];
			checks.forEach(check => {
				const code = generateAntiDebugFunction([check as any]);
				// Basic syntax validation
				expect(code).not.toContain("undefined");
				expect(code).not.toContain("null");
			});
		});
	});

	describe("Edge Cases", () => {
		it("should handle code without functions", () => {
			const code = "local x = 10\nprint(x)";
			const result = injectAntiDebugChecks(code, 50);
			expect(result).toContain("local x = 10");
		});

		it("should handle very short code", () => {
			const result = injectAntiDebugChecks("x=1", 50);
			expect(result).toContain("x=1");
		});

		it("should handle code with many functions", () => {
			const code = `function a() end
function b() end
function c() end`;
			const result = injectAntiDebugChecks(code, 100);
			expect(result).toContain("function a()");
			expect(result).toContain("function b()");
			expect(result).toContain("function c()");
		});
	});
});
