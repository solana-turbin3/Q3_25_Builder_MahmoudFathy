#![allow(unexpected_cfgs, deprecated)]
pub mod instructions;
pub mod state;
use anchor_lang::prelude::*;

pub use instructions::*;
pub use state::*;


declare_id!("2SCiL8L2WE8YabknTxNQhQ1FQTzuUigiDcgpWLFjx5Eb");

#[program]
pub mod anchor_marketplace_q3 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, name: String, fee: u16) -> Result<()> {
        ctx.accounts.initialize_marketconfig(name, fee, &ctx.bumps)
    }
}



