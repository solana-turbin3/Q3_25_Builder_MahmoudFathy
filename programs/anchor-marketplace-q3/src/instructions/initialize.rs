use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::state::Marketplace;


#[derive(Accounts)]
#[instruction(name: String)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    
    /// Resembles the configuration of the marketplace
    #[account(
        init,
        payer = admin,
        seeds = [b"marketplace", name.as_bytes()],
        bump,
        space = 8 + Marketplace::INIT_SPACE
    )]
    pub marketplace: Account<'info, Marketplace>,
    #[account(
        seeds = [b"treasury", marketplace.key().as_ref()],
        bump,
    )]
    /// Where the money goes
    pub treasury: SystemAccount<'info>,
    
    /// Marketplace rewards token
    #[account(
        init,
        payer = admin,
        seeds = [b"rewards", marketplace.key().as_ref()],
        bump,
        mint::decimals = 6,
        mint::authority = marketplace,
    )]
    pub rewards_mint: InterfaceAccount<'info, Mint>,

    /// Required programs
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> Initialize<'info> {
    pub fn init(&mut self, name: String, fee: u16, bumps: &InitializeBumps) -> Result<()> {
        require!(
            !name.is_empty() && name.len() <= 4 + 32,
            MarketplaceError::StringMaxedOut
        );

        self.marketplace.set_inner(Marketplace {
            admin: self.admin.key(),
            fee,
            bump: bumps.marketplace,
            treasury_bump: bumps.treasury,
            reward_bump: bumps.rewards_mint,
            name,
        });
        Ok(())
    }
}

#[error_code]
pub enum MarketplaceError {
    #[msg("Length of arg name required be between 0 and 32")]
    StringMaxedOut,
}
