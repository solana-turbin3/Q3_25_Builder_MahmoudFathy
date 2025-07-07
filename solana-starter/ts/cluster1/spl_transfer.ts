import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../turbin3-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("AQ9mSNuF1mAqzdReuoCpxfQDXHzWRYkyugtWG6XN8WQy");

// Recipient address
const to = new PublicKey("GtdfvE315RkPhVCahtG5kutP7SQfdubwbk8grRmPLWzv");

const decimals = 6;

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const ata_from = await getOrCreateAssociatedTokenAccount(
           connection,
           keypair,
           mint,
           keypair.publicKey
        );

        // Get the token account of the toWallet address, and if it does not exist, create it
        const ata_to = await getOrCreateAssociatedTokenAccount(
           connection,
           keypair,
           mint,
           to 
        );

        // Transfer the new token to the "toTokenAccount" we just created
        const transferTx = await transfer(
            connection,
            keypair,
            ata_from.address,
            ata_to.address,
            keypair,
            5n * 10n**6n
        )
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();