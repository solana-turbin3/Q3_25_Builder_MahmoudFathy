import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorVaultQ3 } from "../target/types/anchor_vault_q3";
import { assert } from "chai";

describe("anchor-vault-q3", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorVaultQ3 as Program<AnchorVaultQ3>;
  const user = provider.publicKey;

  // Derive vault_state and vault PDA
  const [vaultState, stateBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("state"), user.toBuffer()],
    program.programId
  );

  const [vault, vaultBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), vaultState.toBuffer()],
    program.programId
  );

  it("Initializes a vault", async () => {
    const tx = await program.methods
      // FIXME: Can't pass bumps
      .initialize()
      .accountsPartial({
        user,
        vaultState,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).rpc();

    console.log("Initialization tx:", tx);

    // const state = await program.account.vaultState.fetch(vaultState);
    // assert.equal(state.vaultBump, vaultBump);
    // assert.equal(state.stateBump, stateBump);
  });
});
