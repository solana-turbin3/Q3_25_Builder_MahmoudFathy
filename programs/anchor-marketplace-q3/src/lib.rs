use anchor_lang::prelude::*;

declare_id!("2SCiL8L2WE8YabknTxNQhQ1FQTzuUigiDcgpWLFjx5Eb");

#[program]
pub mod anchor_marketplace_q3 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
