import { Connection, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import { fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { DEVNET_RPC, assertDevnet, explorerAddress } from "./config.js";

assertDevnet(DEVNET_RPC);
const mintStr = process.argv[2];
if (!mintStr) throw new Error("Usage: npm run verify -- <MINT_ADDRESS>");

const connection = new Connection(DEVNET_RPC, "confirmed");
const mint = await getMint(connection, new PublicKey(mintStr));
console.log("Decimals:", mint.decimals);
console.log("Raw supply:", mint.supply.toString());
console.log("Supply in tokens:", Number(mint.supply) / 10 ** mint.decimals);

const umi = createUmi(DEVNET_RPC).use(mplTokenMetadata());
const asset = await fetchDigitalAsset(umi, publicKey(mintStr));
console.log("Name:", asset.metadata.name.trim());
console.log("Symbol:", asset.metadata.symbol.trim());
console.log("URI:", asset.metadata.uri.trim());
console.log("Explorer:", explorerAddress(mintStr));
