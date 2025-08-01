import * as anchor from "@coral-xyz/anchor";
import { Program  } from "@coral-xyz/anchor";
import { AnchorEscrowQ3 } from "../target/types/anchor_escrow_q3";
import {
  createMint,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccount,
  mintTo,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAccount,
  
} from "@solana/spl-token";
import { assert } from "chai";

describe("anchor-escrow-q3", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.AnchorEscrowQ3 as Program<AnchorEscrowQ3>;
  const maker = provider.wallet;
  const seed = new anchor.BN(3);
  // Convert u64 to LE buffer (8 bytes)
  const seedBuffer = Buffer.alloc(8);
  seedBuffer.writeBigUInt64LE( BigInt(seed.toNumber() ));
  
  // Derive PDA
  const [escrow, escrowBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), maker.publicKey.toBuffer(), seedBuffer],
    program.programId
  );
  
  let vault: anchor.web3.PublicKey;
  let mintA: anchor.web3.PublicKey;
  let mintB: anchor.web3.PublicKey; 
  let makerAtaA: anchor.web3.PublicKey;
  let makerAtaB: anchor.web3.PublicKey;
  const amountIn = new anchor.BN(100_000);
  const amountOut = new anchor.BN(200_000);
  
  it("creates escrow and vault PDA", async () => {
    // 1️⃣ fund maker so rent & fees are covered
    
    // 2️⃣ create two test mints (6 decimals)
    mintA = await createMint(
      provider.connection,
      maker.payer,                             // payer / mint authority
      maker.publicKey,
      null,
      6
    );
    mintB = await createMint(
      provider.connection,
      maker.payer,
      maker.publicKey,
      null,
      6
    );
    
    // 3️⃣ maker’s ATA for mintA + fund it
    makerAtaA = await createAssociatedTokenAccount(
      provider.connection,
      maker.payer,           // payer
      mintA,
      maker.publicKey
    );
    // 3️⃣ maker’s ATA for mintB 
    makerAtaB = await createAssociatedTokenAccount(
      provider.connection,
      maker.payer,           // payer
      mintB,
      maker.publicKey
    );
    vault = getAssociatedTokenAddressSync(
      mintA,
      escrow,
      true,             // escrow is a PDA (not a system account)
      TOKEN_PROGRAM_ID 
    );
    // Maker mints to herself 
    await mintTo(
      provider.connection,
      maker.payer,           // payer
      mintA,
      makerAtaA,
      maker.payer,           // authority
      100_000_000       // 100 tokens (6 dec)
    );
  });
  
  it("Initializes an escrow", async () => {
    const makerAddress=  maker.publicKey;
    const tx = await program.methods
    .initialize(seed, amountIn, amountOut)
    .accountsPartial({
      maker: maker.publicKey,
      mintA,
      mintB,
      makerAtaA,
      escrow ,
      vault,
      associatedTokenProgram:  ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([
      maker.payer
    ])
    .rpc();
    
    console.log("Initialization tx:", tx);
    const vaultAccount = await getAccount(provider.connection, vault, provider.connection.commitment, TOKEN_PROGRAM_ID);
    const vaultBalance = vaultAccount.amount;
    assert.equal(vaultBalance, BigInt (amountIn.toNumber())) ;
    
  });
  
  it("performs a token swap", async () => {
    const taker = anchor.web3.Keypair.generate();
    
    // Airdrop SOL to taker
    const sig = await provider.connection.requestAirdrop(taker.publicKey, 1e9);
    const latestBlockhash = await provider.connection.getLatestBlockhash();
    
    await provider.connection.confirmTransaction({
      signature: sig,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    });
    
    // Create ATA for taker: mintA (to receive) and mintB (to pay)
    const takerAtaA = await createAssociatedTokenAccount(
      provider.connection,
      taker,
      mintA,
      taker.publicKey
    );
    
    const takerAtaB = await createAssociatedTokenAccount(
      provider.connection,
      taker,
      mintB,
      taker.publicKey
    );
    
    // Fund taker with mintB tokens (enough to swap)
    await mintTo(
      provider.connection,
      maker.payer,
      mintB,
      takerAtaB,
      maker.payer,
      amountOut.toNumber() 
    );
    
    // Call the `take` instruction
    const tx = await program.methods
    .take()
    .accountsPartial({
      taker: taker.publicKey,
      mintA,
      mintB,
      makerAtaB,
      takerAtaB,
      takerAtaA,
      escrow,
      vault,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([taker])
    .rpc();
    
    console.log("Swap tx:", tx);
    
    // Confirm taker received mintA tokens
    const takerAccountA = await getAccount(provider.connection, takerAtaA);
    assert.equal(takerAccountA.amount, BigInt(amountIn.toNumber()), "Taker did not receive mintA");
    
    // Confirm maker received mintB tokens
    const makerAccountB = await getAccount(provider.connection, makerAtaB);
    assert.equal(makerAccountB.amount, BigInt(amountOut.toNumber()), "Maker did not receive expected mintB");
  });
})