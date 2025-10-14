/**
 * Obfuscation metrics calculation and tracking
 * Provides detailed statistics about the obfuscation process
 */

/**
 * Transformation counts for metrics
 */
export interface TransformationCounts {
	namesMangled: number;
	stringsEncoded: number;
	numbersEncoded: number;
	deadCodeBlocks: number;
	controlFlowFlattened: number;
	antiDebugChecks: number;
}

/**
 * Complete obfuscation metrics
 */
export interface ObfuscationMetrics {
	inputSize: number; // Original code size in bytes
	outputSize: number; // Obfuscated code size in bytes
	sizeRatio: number; // output / input
	compressionRatio: number; // 1 - (output / input) if smaller, negative if larger
	inputLines: number; // Original line count
	outputLines: number; // Obfuscated line count
	transformations: TransformationCounts;
	duration: number; // Processing time in ms
	encryptionAlgorithm?: string; // Which encryption was used
	processingMode?: "client" | "server"; // Where processing occurred
}

/**
 * Metrics tracker for accumulating transformation counts
 */
export class MetricsTracker {
	private counts: TransformationCounts = {
		namesMangled: 0,
		stringsEncoded: 0,
		numbersEncoded: 0,
		deadCodeBlocks: 0,
		controlFlowFlattened: 0,
		antiDebugChecks: 0,
	};

	/**
	 * Increment name mangling count
	 */
	incrementNamesMangled(count: number = 1): void {
		this.counts.namesMangled += count;
	}

	/**
	 * Increment string encoding count
	 */
	incrementStringsEncoded(count: number = 1): void {
		this.counts.stringsEncoded += count;
	}

	/**
	 * Increment number encoding count
	 */
	incrementNumbersEncoded(count: number = 1): void {
		this.counts.numbersEncoded += count;
	}

	/**
	 * Increment dead code blocks count
	 */
	incrementDeadCodeBlocks(count: number = 1): void {
		this.counts.deadCodeBlocks += count;
	}

	/**
	 * Increment control flow flattening count
	 */
	incrementControlFlowFlattened(count: number = 1): void {
		this.counts.controlFlowFlattened += count;
	}

	/**
	 * Increment anti-debug checks count
	 */
	incrementAntiDebugChecks(count: number = 1): void {
		this.counts.antiDebugChecks += count;
	}

	/**
	 * Get current transformation counts
	 */
	getCounts(): TransformationCounts {
		return { ...this.counts };
	}

	/**
	 * Reset all counts to zero
	 */
	reset(): void {
		this.counts = {
			namesMangled: 0,
			stringsEncoded: 0,
			numbersEncoded: 0,
			deadCodeBlocks: 0,
			controlFlowFlattened: 0,
			antiDebugChecks: 0,
		};
	}
}

/**
 * Calculate line count for a code string
 */
function countLines(code: string): number {
	if (!code) return 0;
	return code.split("\n").length;
}

/**
 * Calculate size in bytes (UTF-8)
 */
function calculateSize(code: string): number {
	if (!code) return 0;
	// In JavaScript, String.length gives the number of UTF-16 code units
	// For a more accurate byte count, we'd use TextEncoder
	// But for simplicity and browser compatibility, we'll use a close approximation
	return new Blob([code]).size;
}

/**
 * Calculate compression ratio
 * Returns positive value if code got smaller, negative if larger
 */
function calculateCompressionRatio(inputSize: number, outputSize: number): number {
	if (inputSize === 0) return 0;
	return 1 - outputSize / inputSize;
}

/**
 * Calculate size ratio
 * Returns output / input ratio
 */
function calculateSizeRatio(inputSize: number, outputSize: number): number {
	if (inputSize === 0) return 0;
	return outputSize / inputSize;
}

/**
 * Calculate complete metrics for an obfuscation operation
 *
 * @param inputCode - Original code
 * @param outputCode - Obfuscated code
 * @param transformations - Transformation counts
 * @param duration - Processing time in milliseconds
 * @param encryptionAlgorithm - Encryption algorithm used (optional)
 * @param processingMode - Where processing occurred (optional)
 * @returns Complete obfuscation metrics
 */
export function calculateMetrics(
	inputCode: string,
	outputCode: string,
	transformations: TransformationCounts,
	duration: number,
	encryptionAlgorithm?: string,
	processingMode?: "client" | "server"
): ObfuscationMetrics {
	const inputSize = calculateSize(inputCode);
	const outputSize = calculateSize(outputCode);
	const inputLines = countLines(inputCode);
	const outputLines = countLines(outputCode);

	return {
		inputSize,
		outputSize,
		sizeRatio: calculateSizeRatio(inputSize, outputSize),
		compressionRatio: calculateCompressionRatio(inputSize, outputSize),
		inputLines,
		outputLines,
		transformations,
		duration,
		encryptionAlgorithm,
		processingMode,
	};
}

/**
 * Format metrics for display
 *
 * @param metrics - Obfuscation metrics
 * @returns Formatted metrics object for UI display
 */
export function formatMetrics(metrics: ObfuscationMetrics): {
	inputSize: string;
	outputSize: string;
	sizeRatio: string;
	compressionRatio: string;
	duration: string;
	transformations: {
		namesMangled: string;
		stringsEncoded: string;
		numbersEncoded: string;
		deadCodeBlocks: string;
		controlFlowFlattened: string;
		antiDebugChecks: string;
	};
} {
	return {
		inputSize: formatBytes(metrics.inputSize),
		outputSize: formatBytes(metrics.outputSize),
		sizeRatio: `${metrics.sizeRatio.toFixed(2)}x`,
		compressionRatio: `${(metrics.compressionRatio * 100).toFixed(1)}%`,
		duration: formatDuration(metrics.duration),
		transformations: {
			namesMangled: metrics.transformations.namesMangled.toString(),
			stringsEncoded: metrics.transformations.stringsEncoded.toString(),
			numbersEncoded: metrics.transformations.numbersEncoded.toString(),
			deadCodeBlocks: metrics.transformations.deadCodeBlocks.toString(),
			controlFlowFlattened: metrics.transformations.controlFlowFlattened.toString(),
			antiDebugChecks: metrics.transformations.antiDebugChecks.toString(),
		},
	};
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	if (bytes < 1024) return `${bytes} bytes`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Format duration to human-readable string
 */
function formatDuration(ms: number): string {
	if (ms < 1000) return `${Math.round(ms)}ms`;
	return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Export metrics to JSON
 */
export function exportMetrics(metrics: ObfuscationMetrics): string {
	return JSON.stringify(metrics, null, 2);
}

/**
 * Create a metrics summary string for logging
 */
export function createMetricsSummary(metrics: ObfuscationMetrics): string {
	return `Obfuscation Metrics:
  Input: ${formatBytes(metrics.inputSize)} (${metrics.inputLines} lines)
  Output: ${formatBytes(metrics.outputSize)} (${metrics.outputLines} lines)
  Ratio: ${metrics.sizeRatio.toFixed(2)}x
  Duration: ${formatDuration(metrics.duration)}
  Transformations:
    - ${metrics.transformations.namesMangled} names mangled
    - ${metrics.transformations.stringsEncoded} strings encoded
    - ${metrics.transformations.numbersEncoded} numbers encoded
    - ${metrics.transformations.deadCodeBlocks} dead code blocks
    - ${metrics.transformations.controlFlowFlattened} control flow flattened
    - ${metrics.transformations.antiDebugChecks} anti-debug checks`;
}
