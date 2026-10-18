import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { DEVNET_RPC, assertDevnet, explorerTx } from "./config.js";
import { loadKeypair } from "./wallet.js";

assertDevnet(DEVNET_RPC);
const connection = new Connection(DEVNET_RPC, "confirmed");
const wallet = loadKeypair();

try {
  const sig = await connection.requestAirdrop(wallet.publicKey, 1 * LAMPORTS_PER_SOL);
  const latest = await connection.getLatestBlockhash();
  await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");
  const bal = await connection.getBalance(wallet.publicKey);
  console.log("Airdrop confirmed:", explorerTx(sig));
  console.log("Balance (Devnet SOL):", bal / LAMPORTS_PER_SOL);
} catch (e) {
  console.error("Airdrop failed:", (e as Error).message);
  console.error("Use https://faucet.solana.com instead (Devnet).");
  process.exit(1);
}
