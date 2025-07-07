import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount, publicKey } from "@metaplex-foundation/umi"
import { fetchDigitalAsset, fetchMetadataFromSeeds, mplTokenMetadata, updateV1 } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../../turbin3-wallet.json"
import base58 from "bs58";
import { env } from "process";
import { PublicKey } from "@solana/web3.js";

const RPC_ENDPOINT = env.SOLANA_RPC??"https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = publicKey("8kWphy9vDDxZ7yb5QeRxTiwaeCwG1VYzjUC8GzD9RapY");

(async () => {
    let newImageUri = "https://gateway.irys.xyz/8hJ37JkQBHNfsN2zjJsUdKAdtSaZkhGbAyTEF7n3ZvRf";
    
    const asset = await fetchDigitalAsset(umi, mint);
    const initialMetadata = asset.metadata;

    let result = await updateV1(umi, {
        mint: mint,
        authority: myKeypairSigner,
        data: { ...initialMetadata, uri: newImageUri },
    }).sendAndConfirm(umi)


    const signature = base58.encode(result.signature);
    
    console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

    console.log("Mint Address: ", mint);
})();

