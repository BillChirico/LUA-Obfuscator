/**
 * Simple in-memory rate limiter for API endpoints
 *
 * This implementation uses a sliding window algorithm with Map-based storage.
 * For production with multiple serverless instances, consider using a distributed
 * solution like Upstash Redis or Vercel Edge Config.
 *
 * Note: Rate limit data resets on serverless function cold starts.
 */

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

/**
 * Rate limiter class using sliding window algorithm
 */
export class RateLimiter {
	private requests: Map<string, RateLimitEntry>;
	private readonly maxRequests: number;
	private readonly windowMs: number;

	/**
	 * Create a rate limiter
	 * @param maxRequests - Maximum requests per window
	 * @param windowMs - Time window in milliseconds (default: 10 minutes)
	 */
	constructor(maxRequests: number, windowMs: number = 10 * 60 * 1000) {
		this.requests = new Map();
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
	}

	/**
	 * Check if a request is allowed for the given identifier
	 * @param identifier - Unique identifier (typically IP address)
	 * @returns Object with success status and remaining requests
	 */
	check(identifier: string): { success: boolean; remaining: number; resetAt: number } {
		const now = Date.now();
		const entry = this.requests.get(identifier);

		// Clean up expired entry or create new one
		if (!entry || now > entry.resetAt) {
			const resetAt = now + this.windowMs;
			this.requests.set(identifier, { count: 1, resetAt });
			return {
				success: true,
				remaining: this.maxRequests - 1,
				resetAt,
			};
		}

		// Check if limit exceeded
		if (entry.count >= this.maxRequests) {
			return {
				success: false,
				remaining: 0,
				resetAt: entry.resetAt,
			};
		}

		// Increment count
		entry.count++;
		return {
			success: true,
			remaining: this.maxRequests - entry.count,
			resetAt: entry.resetAt,
		};
	}

	/**
	 * Clean up expired entries (optional periodic cleanup)
	 */
	cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.requests.entries()) {
			if (now > entry.resetAt) {
				this.requests.delete(key);
			}
		}
	}

	/**
	 * Get current rate limit statistics
	 */
	getStats(): { totalTracked: number; activeEntries: number } {
		const now = Date.now();
		let activeEntries = 0;

		for (const entry of this.requests.values()) {
			if (now <= entry.resetAt) {
				activeEntries++;
			}
		}

		return {
			totalTracked: this.requests.size,
			activeEntries,
		};
	}
}

/**
 * Global rate limiter instance for analytics API
 * 100 requests per 10 minutes per IP address
 */
export const analyticsRateLimiter = new RateLimiter(100, 10 * 60 * 1000);

/**
 * Periodic cleanup (runs every 5 minutes)
 * Only run in production/server environments, not in tests
 */
if (typeof setInterval !== "undefined" && process.env.NODE_ENV !== "test") {
	setInterval(() => {
		analyticsRateLimiter.cleanup();
	}, 5 * 60 * 1000);
}
