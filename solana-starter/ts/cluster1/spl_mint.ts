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
         //const programAddress = "11111111111111111111111111111111" as Address;
         //let stats: Dictionary<number> = {};
         //for (var i =0; i < 100_000; i++) {
         //  const seeds = ["helloWorld", JSON.stringify(i)];
         //  const [pda, bump] = await getProgramDerivedAddress({
         //    programAddress,
         //    seeds
         //  });
         //  if (bump in stats) {
         //    stats[bump] += 1;
         //  } else {
         //    stats[bump] = 1;
         //  }
         //  if(i % 10_000 == 0) console.log("iteration ... ", i);
         //}
         //
         //console.log(stats);
         //Result after 100_000 runs
         //{
         //  '239': 1,
         //  '241': 5,
         //  '242': 11,
         //  '243': 6,
         //  '244': 24,
         //  '245': 57,
         //  '246': 100,
         //  '247': 198,
         //  '248': 369,
         //  '249': 764,
         //  '250': 1617,
         //  '251': 3115,
         //  '252': 6329,
         //  '253': 12250,
         //  '254': 24939,
         //  '255': 50215
         //}
        // console.log(`Your ata is: ${ata.address.toBase58()}`);

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
