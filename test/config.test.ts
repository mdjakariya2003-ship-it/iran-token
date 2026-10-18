import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { TOKEN, assertDevnet, toBaseUnits, validateMetadataUri } from "../src/config.js";

describe("config", () => {
  it("converts 1,000,000 tokens with 9 decimals to base units", () => {
    expect(toBaseUnits(1_000_000, 9)).toBe(1_000_000_000_000_000n);
  });
  it("accepts Devnet and rejects Mainnet", () => {
    expect(() => assertDevnet("https://api.devnet.solana.com")).not.toThrow();
    expect(() => assertDevnet("https://api.mainnet-beta.solana.com")).toThrow();
  });
  it("validates metadata URI", () => {
    expect(validateMetadataUri("")).not.toBeNull();
    expect(validateMetadataUri("http://x.com/a.json")).not.toBeNull();
    expect(validateMetadataUri("https://raw.githubusercontent.com/me/iran-token/main/metadata/metadata.json")).toBeNull();
  });
  it("keeps name/symbol within Metaplex limits", () => {
    expect(TOKEN.name.length).toBeLessThanOrEqual(32);
    expect(TOKEN.symbol.length).toBeLessThanOrEqual(10);
  });
  it("metadata.json matches token config", () => {
    const m = JSON.parse(fs.readFileSync("metadata/metadata.json", "utf8"));
    expect(m.name).toBe(TOKEN.name);
    expect(m.symbol).toBe(TOKEN.symbol);
    expect(m.description).toBeTruthy();
    expect(m.image).toMatch(/^https:\/\//);
  });
});
