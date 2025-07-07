import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../turbin3-wallet.json"
import base58 from "bs58";
import { env } from "process";

const RPC_ENDPOINT = env.SOLANA_RPC??"https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata())

const mint = generateSigner(umi);

(async () => {
    let imageUri = "https://peach-personal-chameleon-298.mypinata.cloud/ipfs/bafkreie4fq7hk3amqoel6rgu6adupee3x5vz7t7vqhslcrqjp5oirbgoym";

    // NFT metadata assigned 
    let tx = createNft(umi, {
        mint,
        authority: myKeypairSigner,
        name: "Jeff RUGan Show",
        symbol: "OGRUG",
        uri: imageUri,
        sellerFeeBasisPoints: percentAmount(5), // 5%
        isMutable: true,
    }); 

    // NFT is created in this transaction
    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);
    
    console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

    console.log("Mint Address: ", mint.publicKey);
})();