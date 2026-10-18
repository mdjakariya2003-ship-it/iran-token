import { Keypair } from "@solana/web3.js";
import fs from "node:fs";
import path from "node:path";
import { KEYPAIR_PATH, explorerAddress } from "./config.js";
import { loadKeypair } from "./wallet.js";

if (fs.existsSync(KEYPAIR_PATH)) {
  console.log(`Wallet file already exists at ${KEYPAIR_PATH}. Not overwriting it.`);
} else {
  const kp = Keypair.generate();
  fs.mkdirSync(path.dirname(KEYPAIR_PATH), { recursive: true });
  fs.writeFileSync(KEYPAIR_PATH, JSON.stringify(Array.from(kp.secretKey)), { mode: 0o600 });
  console.log("Created a new Devnet-only wallet file (it is git-ignored).");
}

const pub = loadKeypair().publicKey.toBase58();
console.log("Your public wallet address:", pub);
console.log("Explorer:", explorerAddress(pub));
console.log("Never use this wallet for real funds, and never share or commit the file.");
