import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorNftStakingQ3 } from "../target/types/anchor_nft_staking_q3";
import {
  createAssociatedTokenAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  
} from "@solana/spl-token";
import { assert } from "chai";

describe("anchor-nft-staking-q3", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
 
  const program = anchor.workspace.anchorNftStakingQ3 as Program<AnchorNftStakingQ3>;

  // Solana Test Setup
  const signer = provider.wallet;
  const seed = new anchor.BN(3);
  // Convert u64 to LE buffer (8 bytes)
  const seedBuffer = Buffer.alloc(8);
  seedBuffer.writeBigUInt64LE( BigInt(seed.toNumber() ));
  
  // Derive PDA
  const [config, configBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config") ],
    program.programId
  );
  // Derive PDA
  const [rewardToken, rewardTokenBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("rewards"), config.toBuffer()],
    program.programId
  );
  
  it("", async () => {
    let pointsPerStake = 50;                
    let maxStake = 4;                      
    let freezePeriod = 30 * 24 * 60 * 60;  // 1 month
    const tx = await program.methods
    .initializeConfig(
      pointsPerStake,
      maxStake,
      freezePeriod 
    )
    .accountsPartial({
      admin: signer.publicKey,
      config,
      rewardsMint: rewardToken,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([
      signer.payer
    ])
    .rpc();
    
    console.log("Initialization tx:", tx);
    let configData = await program.account.stakeConfig.fetch(config);
    assert.equal(
      configData.pointsPerStake, 
      pointsPerStake, 
      "Config could not be initialized properly");
    assert.equal(
      configData.freezePeriod, 
      freezePeriod, 
      "Config could not be initialized properly");
    assert.equal(
      configData.maxStake, 
      maxStake, 
      "Config could not be initialized properly");
  });
});
