#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;

use state::*;
use instructions::*;



declare_id!("CGyRkM6NtKZTT4v21omG76zi7Cb7XNxVB1U1LF33zS3h");

#[program]
pub mod anchor_escrow_q3 {
    use super::*;

    pub fn initialize(ctx: Context<Make>, seed: u64, deposit: u64, receive: u64) -> Result<()> {
        ctx.accounts.init_escrow(seed, receive, &ctx.bumps)?;
        ctx.accounts.deposit(deposit)?;
        Ok(())
    }

    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.swap()
    }
}

#[derive(Accounts)]
pub struct Initialize {}

