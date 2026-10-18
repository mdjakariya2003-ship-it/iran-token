import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { DEVNET_RPC, assertDevnet } from "./config.js";
import { loadKeypair } from "./wallet.js";

assertDevnet(DEVNET_RPC);
const connection = new Connection(DEVNET_RPC, "confirmed");
const wallet = loadKeypair();
console.log("Address:", wallet.publicKey.toBase58());
console.log("Devnet SOL:", (await connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL);
