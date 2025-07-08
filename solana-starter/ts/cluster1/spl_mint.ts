import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import {getProgramDerivedAddress, Address } from "@solana/kit";

import wallet from "../turbin3-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const token_decimals = 1_000_000n;

interface Dictionary<T> {
  [key: number]: T 
}

// Mint address
const mint = new PublicKey("AQ9mSNuF1mAqzdReuoCpxfQDXHzWRYkyugtWG6XN8WQy");

(async () => {
    try {
        // Create an ATA
         const ata = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,           // payer
            mint,              // mint
            keypair.publicKey  // owner
         );
        // Mint to ATA
         const mintTx = await mintTo(
            connection,
            keypair,           // payer
            mint,              // mint
            ata.address,       // destination
            keypair.publicKey,           // authority
            Number(100n * token_decimals) // amount
        );
        // console.log(`Your mint txid: ${mintTx}`);
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()
