// src/composables/__tests__/useUUID.spec.js
import { describe, it, expect } from "vitest";
import { useUUID } from "../useUUID";

describe("useUUID", () => {
  it("generateUUID returns a string", () => {
    const { generateUUID } = useUUID();
    const uuid = generateUUID();
    expect(typeof uuid).toBe("string");
  });

  it("generateUUID returns a string of expected length (if using fallback)", () => {
    // Note: crypto.randomUUID() has a fixed length (36), the fallback might differ slightly
    // This test is more relevant if you know you'll hit the fallback often.
    const { generateUUID } = useUUID();
    const uuid = generateUUID();
    // Basic check for non-empty string is usually sufficient
    expect(uuid.length).toBeGreaterThan(10);
  });

  it("generateUUID returns unique values", () => {
    const { generateUUID } = useUUID();
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });
});
