import * as anchor from "@coral-xyz/anchor";
import { Program  } from "@coral-xyz/anchor";
import { AnchorVaultQ3 } from "../target/types/anchor_vault_q3";
import { assert } from "chai";

describe("anchor-vault-q3", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorVaultQ3 as Program<AnchorVaultQ3>;
  const user = provider.publicKey;

  // Derive vault_state and vault PDA
  const [vaultState, stateBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vaultState"), user.toBuffer()],
    program.programId
  );

  const [vault, vaultBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), vaultState.toBuffer()],
    program.programId
  );

  it("Initializes a vault", async () => {
    const tx = await program.methods
      .initialize()
      .accountsPartial({
        user,
        vaultState ,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([
        provider.wallet.payer
      ])
      .rpc();

    console.log("Initialization tx:", tx);

    const state = await program.account.vaultState.fetch(vaultState);
    assert.equal(state.vaultBump, vaultBump);
    assert.equal(state.stateBump, stateBump);
  });

  it("Deposits to a vault", async () => {
    // Tests run in order in same state of chain, hence this test depends on the previous test and so on
    const initVaultBalance = await provider.connection.getBalance(vault);
    const amount = new anchor.BN(10000);
    let tx = await program.methods
      .deposit(amount)
      .accountsPartial({
        user,
        vaultState ,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([
        provider.wallet.payer
      ])
      .rpc();

    console.log("Initialization tx:", tx);
    const vaultBalance = await provider.connection.getBalance(vault);
    assert.equal(vaultBalance, initVaultBalance + amount.toNumber() );
  });

  it("Withdraw from a vault", async () => {
    // Tests run in order in same state of chain, hence this test depends on the previous test and so on
    const initVaultBalance = await provider.connection.getBalance(vault);
    const amount = new anchor.BN(10000);
    let tx = await program.methods
      .withdraw(amount)
      .accountsPartial({
        user,
        vaultState ,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([
        provider.wallet.payer
      ])
      .rpc();

    console.log("Initialization tx:", tx);
    const vaultBalance = await provider.connection.getBalance(vault);
    assert.equal(vaultBalance, initVaultBalance - amount.toNumber() );
  });

  it("Withdraw and close from  vault", async () => {
    let tx = await program.methods
      .withdrawAndClose()
      .accountsPartial({
        user,
        vaultState ,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([
        provider.wallet.payer
      ])
      .rpc();

    console.log("Initialization tx:", tx);
    const vaultBalance = await provider.connection.getBalance(vault);
    assert.equal(vaultBalance, 0 );
    // This confirms that account is closed
    const vaultInfo = await provider.connection.getAccountInfo(vault);
    assert.isNull(vaultInfo);
  });
});
