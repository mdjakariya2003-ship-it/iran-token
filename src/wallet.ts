import { Keypair } from "@solana/web3.js";
import fs from "node:fs";
import { KEYPAIR_PATH } from "./config.js";

export function loadKeypair(path = KEYPAIR_PATH): Keypair {
  if (!fs.existsSync(path)) {
    throw new Error(`Wallet file not found at ${path}. Run: npm run wallet`);
  }
  const secret = Uint8Array.from(JSON.parse(fs.readFileSync(path, "utf8")));
  return Keypair.fromSecretKey(secret);
}
