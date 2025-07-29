use anchor_lang::prelude::*;

declare_id!("J4aBD9W7P8sij5dLP4KZLiJZrCZXoRFazpGaVhcZuwZZ");

#[program]
pub mod capstone_airpay_q3 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
