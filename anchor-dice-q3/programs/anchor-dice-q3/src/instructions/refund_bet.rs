use anchor_lang::{
    prelude::*, 
    system_program::{Transfer, transfer}
};

use crate::state::*; 
use crate::errors::*;

#[derive(Accounts)]
pub struct RefundBet<'info> {
    /// Gambler who requests the refund
    #[account(mut)]
    pub gambler: Signer<'info>,
    ///CHECK: 
    pub house: UncheckedAccount<'info>,
    /// Protocol vault
    #[account(
        mut,
        seeds = [b"vault", house.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,
    /// Bet data information
    #[account(
        mut,
        close = gambler,
        seeds = [b"bet", vault.key().as_ref(), bet.seed.to_le_bytes().as_ref()],
        bump = bet.bump
    )]
    pub bet: Account<'info, Bet>,
    // Required programs
    pub system_program: Program<'info, System>
}

impl<'info> RefundBet<'info> {
    pub fn refund_bet(&mut self, bumps: &RefundBetBumps) -> Result<()> {
        let slot = Clock::get()?.slot;
        require!((slot - self.bet.slot) > 1000, DiceError::TimeoutNotReached);
        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.gambler.to_account_info()
        };

        let seeds = [b"vault", &self.house.key().to_bytes()[..], &[bumps.vault]];
        let signer_seeds = &[&seeds[..]][..];
    

        let cpi_context = CpiContext::new_with_signer(
            self.system_program.to_account_info(),
            cpi_accounts,
            signer_seeds
        );

        transfer(cpi_context, self.bet.amount)
    }
}
