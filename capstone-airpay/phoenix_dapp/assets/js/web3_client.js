import { Connection, PublicKey, Transaction } from '@solana/web3.js';

import * as programClient from '../clients/src/capstone_airpay_q3';

// Connect to local validator
const connection = new Connection('http://127.0.0.1:8899');

// Connect to Phantom wallet
const connectPhantom = async () => {
   let provider = getProvider() ;
   
   await provider.connect();
   return provider;
};

const getProvider = () => {
  if ('phantom' in window) {
    const provider = window.phantom?.solana;

    if (provider?.isPhantom) {
        console.log(provider);
      return provider;

    }
  }


  window.open('https://phantom.app/', '_blank');
};

// Initialize config function
const initializeConfig = async () => {
   // Connect wallet
   const provider = await connectPhantom();

   
   // Get latest blockhash
   const { blockhash } = await connection.getLatestBlockhash();
   
   // Create instruction using Codama-generated client
    console.log(provider.publicKey.toString());
   const instruction = await programClient.getInitializeConfigInstructionAsync({
       admin: provider.publicKey.toString(),
       mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  // USDC mainnet
       systemProgram: '11111111111111111111111111111112',
    
       seed: 12345n,
       fee: 100,
       basisPoints: 500,
       whitelistMints: [
           ('So11111111111111111111111111111111111111112'),
           ('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
       ]
   });
        // const initConfigInstruction = await programClient.getInitializeConfigInstructionAsync({
        //
        //   // The accounts required by your InitializeConfig struct
        //   // You'll need to adjust these based on your actual Anchor accounts struct
        //
        //   // Common accounts for config initialization:
        //   admin: authority.address,     // The signer/authority
        //   config: null, // This will be derived as PDA, Codama should handle this
        //   mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),  // USDC mainnet
        //   systemProgram: address("11111111111111111111111111111112"), // System program
        //
        //   // Instruction arguments
        //   seed,
        //   fee,
        //   basisPoints,
        //   whitelistMints,
        // });
   
   // Create transaction
   const transaction = new Transaction({
       feePayer: provider.publicKey.toString(),
       recentBlockhash: blockhash

   }).add(instruction);
   
   // Sign and send
   const signedTransaction = await provider.signTransaction(transaction);

   const signature = await connection.sendRawTransaction(signedTransaction.serialize());
   
   console.log('Transaction signature:', signature);
   return signature;
};


// Execute
export {initializeConfig, connectPhantom };
