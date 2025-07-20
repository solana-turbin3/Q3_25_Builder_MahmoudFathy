use anchor_lang::prelude::*;

declare_id!("AHhhaj16m2XtpJtM4fqLQYGSdN8JJDXpidt5mKiv2wft");

#[program]
pub mod anchor_nft_staking_q3 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
