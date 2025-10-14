/**
 * Unit tests for metrics module
 */

import {
	calculateMetrics,
	formatMetrics,
	exportMetrics,
	createMetricsSummary,
	MetricsTracker,
	type ObfuscationMetrics,
	type TransformationCounts,
} from "@/lib/metrics";

describe("Metrics Module", () => {
	const inputCode = "local x = 10\nprint(x)";
	const outputCode = "local _0x0000=10 print(_0x0000)";
	const transformations: TransformationCounts = {
		namesMangled: 1,
		stringsEncoded: 0,
		numbersEncoded: 1,
		deadCodeBlocks: 0,
		controlFlowFlattened: 0,
		antiDebugChecks: 0,
	};

	describe("calculateMetrics", () => {
		it("should calculate basic metrics", () => {
			const metrics = calculateMetrics(inputCode, outputCode, transformations, 100);

			expect(metrics.inputSize).toBeGreaterThan(0);
			expect(metrics.outputSize).toBeGreaterThan(0);
			expect(metrics.sizeRatio).toBeGreaterThan(0);
			expect(metrics.duration).toBe(100);
		});

		it("should calculate correct line counts", () => {
			const metrics = calculateMetrics(inputCode, outputCode, transformations, 50);

			expect(metrics.inputLines).toBe(2);
			expect(metrics.outputLines).toBeGreaterThan(0);
		});

		it("should include transformation counts", () => {
			const metrics = calculateMetrics(inputCode, outputCode, transformations, 50);

			expect(metrics.transformations.namesMangled).toBe(1);
			expect(metrics.transformations.numbersEncoded).toBe(1);
		});

		it("should calculate size ratio correctly", () => {
			const metrics = calculateMetrics("x", "xxx", transformations, 50);

			expect(metrics.sizeRatio).toBe(3);
		});

		it("should calculate compression ratio", () => {
			const metrics = calculateMetrics("xxxxx", "xx", transformations, 50);

			// Compression ratio should be positive when output is smaller
			expect(metrics.compressionRatio).toBeGreaterThan(0);
		});

		it("should include encryption algorithm if provided", () => {
			const metrics = calculateMetrics(inputCode, outputCode, transformations, 50, "xor");

			expect(metrics.encryptionAlgorithm).toBe("xor");
		});

		it("should include processing mode if provided", () => {
			const metrics = calculateMetrics(inputCode, outputCode, transformations, 50, undefined, "client");

			expect(metrics.processingMode).toBe("client");
		});

		it("should handle empty code", () => {
			const metrics = calculateMetrics("", "", transformations, 10);

			expect(metrics.inputSize).toBe(0);
			expect(metrics.outputSize).toBe(0);
			expect(metrics.sizeRatio).toBe(0);
		});
	});

	describe("MetricsTracker", () => {
		it("should initialize with zero counts", () => {
			const tracker = new MetricsTracker();
			const counts = tracker.getCounts();

			expect(counts.namesMangled).toBe(0);
			expect(counts.stringsEncoded).toBe(0);
			expect(counts.numbersEncoded).toBe(0);
			expect(counts.deadCodeBlocks).toBe(0);
		});

		it("should increment names mangled", () => {
			const tracker = new MetricsTracker();
			tracker.incrementNamesMangled(5);

			expect(tracker.getCounts().namesMangled).toBe(5);
		});

		it("should increment strings encoded", () => {
			const tracker = new MetricsTracker();
			tracker.incrementStringsEncoded(3);

			expect(tracker.getCounts().stringsEncoded).toBe(3);
		});

		it("should increment numbers encoded", () => {
			const tracker = new MetricsTracker();
			tracker.incrementNumbersEncoded(7);

			expect(tracker.getCounts().numbersEncoded).toBe(7);
		});

		it("should increment dead code blocks", () => {
			const tracker = new MetricsTracker();
			tracker.incrementDeadCodeBlocks(2);

			expect(tracker.getCounts().deadCodeBlocks).toBe(2);
		});

		it("should increment control flow flattened", () => {
			const tracker = new MetricsTracker();
			tracker.incrementControlFlowFlattened(1);

			expect(tracker.getCounts().controlFlowFlattened).toBe(1);
		});

		it("should increment anti-debug checks", () => {
			const tracker = new MetricsTracker();
			tracker.incrementAntiDebugChecks(4);

			expect(tracker.getCounts().antiDebugChecks).toBe(4);
		});

		it("should accumulate multiple increments", () => {
			const tracker = new MetricsTracker();
			tracker.incrementNamesMangled(2);
			tracker.incrementNamesMangled(3);

			expect(tracker.getCounts().namesMangled).toBe(5);
		});

		it("should reset counts", () => {
			const tracker = new MetricsTracker();
			tracker.incrementNamesMangled(10);
			tracker.incrementStringsEncoded(5);
			tracker.reset();

			const counts = tracker.getCounts();
			expect(counts.namesMangled).toBe(0);
			expect(counts.stringsEncoded).toBe(0);
		});

		it("should default increment to 1", () => {
			const tracker = new MetricsTracker();
			tracker.incrementNamesMangled();

			expect(tracker.getCounts().namesMangled).toBe(1);
		});
	});

	describe("formatMetrics", () => {
		it("should format all metrics fields", () => {
			const metrics: ObfuscationMetrics = {
				inputSize: 1024,
				outputSize: 2048,
				sizeRatio: 2.0,
				compressionRatio: -1.0,
				inputLines: 50,
				outputLines: 100,
				transformations,
				duration: 250,
			};

			const formatted = formatMetrics(metrics);

			expect(formatted.inputSize).toContain("KB");
			expect(formatted.outputSize).toContain("KB");
			expect(formatted.sizeRatio).toContain("x");
			expect(formatted.duration).toContain("ms");
		});

		it("should format transformation counts as strings", () => {
			const metrics: ObfuscationMetrics = {
				inputSize: 100,
				outputSize: 200,
				sizeRatio: 2.0,
				compressionRatio: -1.0,
				inputLines: 10,
				outputLines: 20,
				transformations,
				duration: 100,
			};

			const formatted = formatMetrics(metrics);

			expect(typeof formatted.transformations.namesMangled).toBe("string");
			expect(formatted.transformations.namesMangled).toBe("1");
		});

		it("should format bytes correctly", () => {
			const smallMetrics: ObfuscationMetrics = {
				inputSize: 500,
				outputSize: 1000,
				sizeRatio: 2.0,
				compressionRatio: -1.0,
				inputLines: 10,
				outputLines: 20,
				transformations,
				duration: 50,
			};

			const formatted = formatMetrics(smallMetrics);
			expect(formatted.inputSize).toContain("bytes");
		});

		it("should format duration correctly", () => {
			const fastMetrics: ObfuscationMetrics = {
				inputSize: 100,
				outputSize: 200,
				sizeRatio: 2.0,
				compressionRatio: -1.0,
				inputLines: 10,
				outputLines: 20,
				transformations,
				duration: 500,
			};

			const slowMetrics: ObfuscationMetrics = {
				...fastMetrics,
				duration: 1500,
			};

			const fastFormatted = formatMetrics(fastMetrics);
			const slowFormatted = formatMetrics(slowMetrics);

			expect(fastFormatted.duration).toContain("ms");
			expect(slowFormatted.duration).toContain("s");
		});
	});

	describe("exportMetrics", () => {
		it("should export metrics as JSON", () => {
			const metrics: ObfuscationMetrics = {
				inputSize: 100,
				outputSize: 200,
				sizeRatio: 2.0,
				compressionRatio: -1.0,
				inputLines: 10,
				outputLines: 20,
				transformations,
				duration: 100,
			};

			const json = exportMetrics(metrics);
			const parsed = JSON.parse(json);

			expect(parsed.inputSize).toBe(100);
			expect(parsed.outputSize).toBe(200);
			expect(parsed.duration).toBe(100);
		});

		it("should produce valid JSON", () => {
			const metrics: ObfuscationMetrics = {
				inputSize: 100,
				outputSize: 200,
				sizeRatio: 2.0,
				compressionRatio: -1.0,
				inputLines: 10,
				outputLines: 20,
				transformations,
				duration: 100,
			};

			const json = exportMetrics(metrics);
			expect(() => JSON.parse(json)).not.toThrow();
		});

		it("should be formatted with indentation", () => {
			const metrics: ObfuscationMetrics = {
				inputSize: 100,
				outputSize: 200,
				sizeRatio: 2.0,
				compressionRatio: -1.0,
				inputLines: 10,
				outputLines: 20,
				transformations,
				duration: 100,
			};

			const json = exportMetrics(metrics);
			expect(json).toContain("\n");
			expect(json).toContain("  ");
		});
	});

	describe("createMetricsSummary", () => {
		it("should create readable summary", () => {
			const metrics: ObfuscationMetrics = {
				inputSize: 1024,
				outputSize: 2048,
				sizeRatio: 2.0,
				compressionRatio: -1.0,
				inputLines: 50,
				outputLines: 100,
				transformations,
				duration: 250,
			};

			const summary = createMetricsSummary(metrics);

			expect(summary).toContain("Obfuscation Metrics");
			expect(summary).toContain("Input:");
			expect(summary).toContain("Output:");
			expect(summary).toContain("Transformations:");
		});

		it("should include all transformation types", () => {
			const metrics: ObfuscationMetrics = {
				inputSize: 100,
				outputSize: 200,
				sizeRatio: 2.0,
				compressionRatio: -1.0,
				inputLines: 10,
				outputLines: 20,
				transformations: {
					namesMangled: 10,
					stringsEncoded: 5,
					numbersEncoded: 3,
					deadCodeBlocks: 2,
					controlFlowFlattened: 1,
					antiDebugChecks: 4,
				},
				duration: 100,
			};

			const summary = createMetricsSummary(metrics);

			expect(summary).toContain("names mangled");
			expect(summary).toContain("strings encoded");
			expect(summary).toContain("numbers encoded");
			expect(summary).toContain("dead code blocks");
			expect(summary).toContain("anti-debug checks");
		});
	});
});
