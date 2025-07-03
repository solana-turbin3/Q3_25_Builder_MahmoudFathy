import wallet from "../turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"
import { env } from "process"

// Create a devnet connection
const umi = createUmi(env.SOLANA_RPC??'https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        //1. Load image
        let imagePath = await readFile("cluster1/res/jeff_rugan_show.jpg");
        //2. Convert image to generic file.
        const image = createGenericFile(imagePath, "jeff_rugan_show.jpg", {contentType: "image/jpeg"});
        //3. Upload image
        const [myUri] = await umi.uploader.upload([image]);
        console.log("Your image URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
