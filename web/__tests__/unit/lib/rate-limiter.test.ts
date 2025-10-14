/**
 * @jest-environment node
 */

import { RateLimiter } from "@/lib/rate-limiter";

describe("RateLimiter", () => {
	let rateLimiter: RateLimiter;

	beforeEach(() => {
		// Create new rate limiter for each test: 5 requests per 1000ms
		rateLimiter = new RateLimiter(5, 1000);
	});

	describe("check", () => {
		it("should allow requests within limit", () => {
			const result1 = rateLimiter.check("192.168.1.1");
			expect(result1.success).toBe(true);
			expect(result1.remaining).toBe(4);

			const result2 = rateLimiter.check("192.168.1.1");
			expect(result2.success).toBe(true);
			expect(result2.remaining).toBe(3);
		});

		it("should block requests exceeding limit", () => {
			// Make 5 successful requests
			for (let i = 0; i < 5; i++) {
				const result = rateLimiter.check("192.168.1.1");
				expect(result.success).toBe(true);
			}

			// 6th request should be blocked
			const result = rateLimiter.check("192.168.1.1");
			expect(result.success).toBe(false);
			expect(result.remaining).toBe(0);
		});

		it("should track different IPs separately", () => {
			// IP 1
			for (let i = 0; i < 5; i++) {
				const result = rateLimiter.check("192.168.1.1");
				expect(result.success).toBe(true);
			}

			// IP 2 should still be allowed
			const result = rateLimiter.check("192.168.1.2");
			expect(result.success).toBe(true);
			expect(result.remaining).toBe(4);
		});

		it("should reset after window expires", async () => {
			// Use very short window for testing
			const shortLimiter = new RateLimiter(2, 100); // 2 requests per 100ms

			// Exhaust limit
			shortLimiter.check("192.168.1.1");
			shortLimiter.check("192.168.1.1");
			let result = shortLimiter.check("192.168.1.1");
			expect(result.success).toBe(false);

			// Wait for window to expire
			await new Promise((resolve) => setTimeout(resolve, 150));

			// Should be allowed again
			result = shortLimiter.check("192.168.1.1");
			expect(result.success).toBe(true);
			expect(result.remaining).toBe(1);
		});

		it("should provide correct resetAt timestamp", () => {
			const result = rateLimiter.check("192.168.1.1");
			expect(result.resetAt).toBeGreaterThan(Date.now());
			expect(result.resetAt).toBeLessThanOrEqual(Date.now() + 1000);
		});
	});

	describe("cleanup", () => {
		it("should remove expired entries", async () => {
			// Create limiter with short window
			const shortLimiter = new RateLimiter(5, 50);

			// Add some entries
			shortLimiter.check("192.168.1.1");
			shortLimiter.check("192.168.1.2");

			let stats = shortLimiter.getStats();
			expect(stats.totalTracked).toBe(2);

			// Wait for expiration
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Cleanup
			shortLimiter.cleanup();

			stats = shortLimiter.getStats();
			expect(stats.totalTracked).toBe(0);
		});
	});

	describe("getStats", () => {
		it("should return correct statistics", () => {
			rateLimiter.check("192.168.1.1");
			rateLimiter.check("192.168.1.2");
			rateLimiter.check("192.168.1.3");

			const stats = rateLimiter.getStats();
			expect(stats.totalTracked).toBe(3);
			expect(stats.activeEntries).toBe(3);
		});

		it("should distinguish between total and active entries", async () => {
			const shortLimiter = new RateLimiter(5, 50);

			// Add entries
			shortLimiter.check("192.168.1.1");
			shortLimiter.check("192.168.1.2");

			// Wait for expiration
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Add new entry
			shortLimiter.check("192.168.1.3");

			const stats = shortLimiter.getStats();
			expect(stats.totalTracked).toBe(3); // All entries still in map
			expect(stats.activeEntries).toBe(1); // Only last one is active
		});
	});

	describe("edge cases", () => {
		it("should handle concurrent requests from same IP", () => {
			const results = Array.from({ length: 10 }, () => rateLimiter.check("192.168.1.1"));

			const successful = results.filter((r) => r.success);
			const blocked = results.filter((r) => !r.success);

			expect(successful.length).toBe(5);
			expect(blocked.length).toBe(5);
		});

		it("should handle empty or invalid identifiers gracefully", () => {
			const result1 = rateLimiter.check("");
			expect(result1.success).toBe(true);

			const result2 = rateLimiter.check("undefined");
			expect(result2.success).toBe(true);
		});
	});
});
