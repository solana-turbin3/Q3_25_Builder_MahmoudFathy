import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, Wallet, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Turbin3Prereq } from "./programs/Turbin3_prereq";
import idl  from "./programs/Turbin3_prereq.json";
import wallet from "./Turbin3-wallet.json";
const MPL_CORE_PROGRAM_ID = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");

const IDL:Idl= idl as Idl;

// import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a Solana devnet connection to devnet SOL 
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
commitment: "confirmed"});

// Create our program
const program : Program<Turbin3Prereq> = new Program(IDL as Turbin3Prereq, provider);

// Create the PDA for our enrollment account
const account_seeds = [
    Buffer.from("prereqs"),
    keypair.publicKey.toBuffer(),
];
const [account_key, _account_bump] = PublicKey.findProgramAddressSync(account_seeds, program.programId);

const mintCollection = new PublicKey("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2");

const mintTs = Keypair.generate();

// Create the PDA for our authority 
const authority_seeds = [
    Buffer.from("collection"),
    mintCollection.toBuffer(),
];
const [authority_key, _authority_bump] = PublicKey.findProgramAddressSync(authority_seeds, program.programId);

// Execute the initialize transaction
// (async () => {
//     try {
//         const txhash = await program.methods
//         .initialize("beber89")
//         .accountsPartial({
//             user: keypair.publicKey,
//             account: account_key,
//             systemProgram: SystemProgram.programId,
//     })
//     .signers([keypair])
//     .rpc();
//     console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
// } catch (e) {
// console.error(`Oops, something went wrong: ${e}`);
// }
// })();

// Execute the submitTs transaction
(async () => {
    try {
        const txhash = await program.methods
        .submitTs()
        .accountsPartial({
            user: keypair.publicKey,
            account: account_key,
            mint: mintTs.publicKey,
            collection: mintCollection,
            authority: authority_key,
            mplCoreProgram: MPL_CORE_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        })
        .signers([keypair, mintTs])
        .rpc();
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch (e) {
        console.error(`Oops, something went wrong: ${e}`);
    }
})();


