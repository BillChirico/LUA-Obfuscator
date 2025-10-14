/**
 * Unit tests for utils.ts
 * Tests the cn() utility function for className merging
 */

import { cn } from "@/lib/utils";

describe("utils", () => {
	describe("cn() - className utility function", () => {
		test("should merge single className", () => {
			const result = cn("text-red-500");
			expect(result).toBe("text-red-500");
		});

		test("should merge multiple classNames", () => {
			const result = cn("text-red-500", "bg-blue-500");
			expect(result).toContain("text-red-500");
			expect(result).toContain("bg-blue-500");
		});

		test("should handle conflicting Tailwind classes correctly", () => {
			// tw-merge should prioritize the last class
			const result = cn("text-red-500", "text-blue-500");
			expect(result).toBe("text-blue-500");
			expect(result).not.toContain("text-red-500");
		});

		test("should handle conditional classNames with false values", () => {
			const result = cn("base-class", false && "conditional-class", "always-class");
			expect(result).toContain("base-class");
			expect(result).toContain("always-class");
			expect(result).not.toContain("conditional-class");
		});

		test("should handle conditional classNames with true values", () => {
			const result = cn("base-class", true && "conditional-class");
			expect(result).toContain("base-class");
			expect(result).toContain("conditional-class");
		});

		test("should handle undefined and null values", () => {
			const result = cn("base-class", undefined, null, "valid-class");
			expect(result).toContain("base-class");
			expect(result).toContain("valid-class");
		});

		test("should handle empty string", () => {
			const result = cn("", "valid-class");
			expect(result).toBe("valid-class");
		});

		test("should handle array of classNames", () => {
			const result = cn(["class1", "class2", "class3"]);
			expect(result).toContain("class1");
			expect(result).toContain("class2");
			expect(result).toContain("class3");
		});

		test("should handle object with boolean values", () => {
			const result = cn({
				"active-class": true,
				"inactive-class": false,
				"enabled-class": true,
			});
			expect(result).toContain("active-class");
			expect(result).toContain("enabled-class");
			expect(result).not.toContain("inactive-class");
		});

		test("should merge conflicting padding classes", () => {
			const result = cn("p-4", "px-6");
			// px-6 should override p-4's horizontal padding
			expect(result).toBe("p-4 px-6");
		});

		test("should handle complex className combinations", () => {
			const result = cn(
				"text-sm font-medium",
				{ "text-red-500": true, "text-blue-500": false },
				undefined,
				"hover:bg-gray-100"
			);
			expect(result).toContain("text-sm");
			expect(result).toContain("font-medium");
			expect(result).toContain("text-red-500");
			expect(result).not.toContain("text-blue-500");
			expect(result).toContain("hover:bg-gray-100");
		});

		test("should handle no arguments", () => {
			const result = cn();
			expect(result).toBe("");
		});

		test("should handle spacing and trim correctly", () => {
			const result = cn("  class1  ", "  class2  ");
			expect(result).not.toMatch(/^\s/);
			expect(result).not.toMatch(/\s$/);
		});

		test("should handle responsive classes", () => {
			const result = cn("md:flex", "lg:hidden", "xl:block");
			expect(result).toContain("md:flex");
			expect(result).toContain("lg:hidden");
			expect(result).toContain("xl:block");
		});

		test("should handle dark mode classes", () => {
			const result = cn("dark:bg-gray-900", "dark:text-white");
			expect(result).toContain("dark:bg-gray-900");
			expect(result).toContain("dark:text-white");
		});

		test("should deduplicate identical classes", () => {
			const result = cn("text-red-500", "text-red-500");
			// Should only appear once
			const matches = result.match(/text-red-500/g);
			expect(matches).toHaveLength(1);
		});

		test("should handle arbitrary values", () => {
			const result = cn("w-[200px]", "h-[100px]");
			expect(result).toContain("w-[200px]");
			expect(result).toContain("h-[100px]");
		});

		test("should merge conflicting width classes", () => {
			const result = cn("w-full", "w-1/2");
			// Last width should win
			expect(result).toBe("w-1/2");
		});

		test("should handle nested arrays and objects", () => {
			const result = cn(["class1", { class2: true, class3: false }], "class4");
			expect(result).toContain("class1");
			expect(result).toContain("class2");
			expect(result).not.toContain("class3");
			expect(result).toContain("class4");
		});
	});
});
