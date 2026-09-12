import { describe, expect, it } from "vitest";
import { MAX_UPLOAD_BYTES, sanitizeStorageFileName } from "./storage";

describe("file storage helpers", () => {
  it("sanitizes user-provided names before building storage keys", () => {
    expect(sanitizeStorageFileName("Vexsa Pro / build final.apk")).toBe("Vexsa-Pro-build-final.apk");
    expect(sanitizeStorageFileName("capture été #1.png")).toBe("capture-ete-1.png");
  });

  it("keeps a bounded upload size for the base64 transfer endpoint", () => {
    expect(MAX_UPLOAD_BYTES).toBe(50_000_000);
    expect(1).toBeLessThan(MAX_UPLOAD_BYTES);
    expect(MAX_UPLOAD_BYTES + 1).toBeGreaterThan(MAX_UPLOAD_BYTES);
  });
});
