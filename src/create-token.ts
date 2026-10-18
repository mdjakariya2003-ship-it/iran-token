import {
  Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  MINT_SIZE, TOKEN_PROGRAM_ID, createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction, createMintToCheckedInstruction,
  getAssociatedTokenAddressSync, getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, percentAmount, publicKey, signerIdentity } from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { TokenStandard, createV1, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  DEVNET_RPC, METADATA_URI, TOKEN, assertDevnet, explorerAddress, explorerTx,
  toBaseUnits, validateMetadataUri,
} from "./config.js";
import { loadKeypair } from "./wallet.js";

assertDevnet(DEVNET_RPC);
const uriProblem = validateMetadataUri(METADATA_URI);
if (uriProblem) throw new Error(uriProblem);

const connection = new Connection(DEVNET_RPC, "confirmed");
const payer = loadKeypair();

const balance = await connection.getBalance(payer.publicKey);
if (balance < 0.05 * LAMPORTS_PER_SOL) {
  throw new Error("Need at least 0.05 Devnet SOL. Run: npm run airdrop (or use faucet.solana.com)");
}
console.log("Network: Devnet | Wallet:", payer.publicKey.toBase58());

// 1) Create the token mint
const mintKp = Keypair.generate();
const rent = await getMinimumBalanceForRentExemptMint(connection);
const sigMint = await sendAndConfirmTransaction(
  connection,
  new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey, newAccountPubkey: mintKp.publicKey,
      space: MINT_SIZE, lamports: rent, programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMint2Instruction(
      mintKp.publicKey, TOKEN.decimals, payer.publicKey, payer.publicKey, TOKEN_PROGRAM_ID,
    ),
  ),
  [payer, mintKp],
  { commitment: "confirmed" },
);
console.log("1) Mint created:", mintKp.publicKey.toBase58());
console.log("   Tx:", explorerTx(sigMint));

// 2) Create the associated token account
const ata = getAssociatedTokenAddressSync(mintKp.publicKey, payer.publicKey);
const sigAta = await sendAndConfirmTransaction(
  connection,
  new Transaction().add(
    createAssociatedTokenAccountIdempotentInstruction(
      payer.publicKey, ata, payer.publicKey, mintKp.publicKey,
    ),
  ),
  [payer],
  { commitment: "confirmed" },
);
console.log("2) Token account:", ata.toBase58());
console.log("   Tx:", explorerTx(sigAta));

// 3) Mint 1,000,000 tokens
const amount = toBaseUnits(TOKEN.supply, TOKEN.decimals);
const sigSupply = await sendAndConfirmTransaction(
  connection,
  new Transaction().add(
    createMintToCheckedInstruction(
      mintKp.publicKey, ata, payer.publicKey, amount, TOKEN.decimals,
    ),
  ),
  [payer],
  { commitment: "confirmed" },
);
console.log(`3) Minted ${TOKEN.supply.toLocaleString()} ${TOKEN.symbol}`);
console.log("   Tx:", explorerTx(sigSupply));

// 4) Attach Metaplex metadata
const umi = createUmi(DEVNET_RPC).use(mplTokenMetadata());
const umiKp = umi.eddsa.createKeypairFromSecretKey(payer.secretKey);
umi.use(signerIdentity(createSignerFromKeypair(umi, umiKp)));

const result = await createV1(umi, {
  mint: publicKey(mintKp.publicKey.toBase58()),
  authority: umi.identity,
  name: TOKEN.name,
  symbol: TOKEN.symbol,
  uri: METADATA_URI,
  sellerFeeBasisPoints: percentAmount(0),
  tokenStandard: TokenStandard.Fungible,
}).sendAndConfirm(umi);
const sigMeta = base58.deserialize(result.signature)[0];
console.log("4) Metadata attached");
console.log("   Tx:", explorerTx(sigMeta));

console.log("\nDONE. Verify on Explorer (Devnet):");
console.log(explorerAddress(mintKp.publicKey.toBase58()));
console.log("Save this mint address to run: npm run verify -- <MINT_ADDRESS>");
console.log("Reminder: Devnet tokens have no real monetary value.");
