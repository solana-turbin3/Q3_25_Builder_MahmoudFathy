use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

use crate::state::*;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        seeds = [b"config".as_ref()],
        bump,
        space = 8+ StakeConfig::INIT_SPACE,
    )]
    pub config: Account<'info, StakeConfig>,

    #[account(
        init,
        payer = admin,                     // Admin pays sol
        seeds = [b"rewards".as_ref(), config.key().as_ref()],
        bump,                              // Store the generator bump
        mint::decimals = 6,                // Token decimals 6 (like USDC)
        mint::authority = config,          // config account is the authorized minter
    )]
    pub rewards_mint: Account<'info, Mint>,

    /// Required programs
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}


impl<'info> InitializeConfig<'info> {
    pub fn initialize_config(&mut self, points_per_stake: u8, max_stake: u8, freeze_period:u32, bumps: &InitializeConfigBumps) -> Result<()> {

        self.config.set_inner(StakeConfig{
            points_per_stake,                // For Rewards
            max_stake,                       // 
            freeze_period,                   // Min stake period
            rewards_bump: bumps.rewards_mint, // Reward Token bump 
            bump: bumps.config,             // Config PDA bump
        });


        Ok(())
    }
}
