#![allow(unexpected_cfgs, deprecated)]
pub mod errors;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use instructions::*;
pub use state::*;
pub use errors::*;

declare_id!("BxWLLD3uwgWzJVbbkpkBtPHpN8muiVuQ9bhHr84BvqGD");

#[program]
pub mod anchor_dice_q3 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, amount: u64) -> Result<()> {
        ctx.accounts.initialize(amount)
    }

    pub fn place_bet(ctx: Context<PlaceBet>, seed: u128, roll: u8, amount: u64) -> Result<()> {
        ctx.accounts.create_bet(&ctx.bumps, seed, roll, amount)?;
        ctx.accounts.deposit(amount)
    }
}

