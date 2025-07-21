#![allow(unexpected_cfgs, deprecated)]
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use instructions::*;
pub use state::*;

declare_id!("AHhhaj16m2XtpJtM4fqLQYGSdN8JJDXpidt5mKiv2wft");

#[program]
pub mod anchor_nft_staking_q3 {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>, 
        points_per_stake: u8, 
        max_stake: u8, 
        freeze_period: u32
    ) -> Result<()> {
        ctx.accounts.initialize_config(
            points_per_stake, 
            max_stake, 
            freeze_period, 
            &ctx.bumps
        )
    }
}

