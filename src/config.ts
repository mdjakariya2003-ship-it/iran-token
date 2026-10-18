import "dotenv/config";
import { clusterApiUrl } from "@solana/web3.js";

export const TOKEN = {
  name: "Iran Token",
  symbol: "IRAN",
  decimals: 9,
  supply: 1_000_000,
  description:
    "Iran Token (IRAN) is a Devnet test token with a green, white and red theme. It has no real monetary value.",
} as const;

export const DEVNET_RPC = clusterApiUrl("devnet");
export const KEYPAIR_PATH = process.env.KEYPAIR_PATH ?? ".keys/devnet-wallet.json";
export const METADATA_URI = process.env.METADATA_URI ?? "";

export function toBaseUnits(amount: number, decimals: number): bigint {
  return BigInt(amount) * 10n ** BigInt(decimals);
}

export function assertDevnet(url: string): void {
  if (!/devnet/i.test(url) || /mainnet/i.test(url)) {
    throw new Error(`Refusing to run: RPC is not Devnet (${url})`);
  }
}

export function validateMetadataUri(uri: string): string | null {
  if (!uri) return "METADATA_URI is empty. Set it in .env (see .env.example).";
  if (!uri.startsWith("https://")) return "METADATA_URI must start with https://";
  if (uri.length > 200) return "METADATA_URI must be 200 characters or fewer.";
  if (uri.includes("YOUR_GITHUB_USERNAME")) return "Replace YOUR_GITHUB_USERNAME in METADATA_URI.";
  return null;
}

export const explorerTx = (sig: string) =>
  `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
export const explorerAddress = (addr: string) =>
  `https://explorer.solana.com/address/${addr}?cluster=devnet`;
