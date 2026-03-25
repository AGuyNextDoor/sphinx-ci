import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "@/lib/encryption";

describe("encryption", () => {
  it("encrypts and decrypts a string correctly", () => {
    const original = "sk-ant-api03-test-key-123456";
    const encrypted = encrypt(original);

    expect(encrypted).not.toBe(original);
    expect(encrypted).toContain(":");

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it("produces different ciphertexts for the same input (random IV)", () => {
    const original = "same-key";
    const encrypted1 = encrypt(original);
    const encrypted2 = encrypt(original);

    expect(encrypted1).not.toBe(encrypted2);
    expect(decrypt(encrypted1)).toBe(original);
    expect(decrypt(encrypted2)).toBe(original);
  });

  it("handles backward compatibility with unencrypted strings", () => {
    const plainKey = "sk-ant-plain-key-no-colons";
    const result = decrypt(plainKey);
    expect(result).toBe(plainKey);
  });

  it("handles empty strings", () => {
    const encrypted = encrypt("");
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe("");
  });

  it("handles long strings", () => {
    const longKey = "sk-ant-" + "a".repeat(500);
    const encrypted = encrypt(longKey);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(longKey);
  });
});
