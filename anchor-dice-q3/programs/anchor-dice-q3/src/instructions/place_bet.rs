use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};

use crate::state::*;

#[derive(Accounts)]
#[instruction(seed:u128)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    /// gambler is user who starts the game by betting on their roll
    pub gambler: Signer<'info>,
    /// house is the amdin and funder of the protocol 
    /// CHECK: 
    pub house: UncheckedAccount<'info>,
    /// vault receives the bets
    #[account(
        mut,
        seeds = [b"vault", house.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,
    /// bet is a placeholder to record the bets made by users and amount wagered
    #[account(
        init,
        payer = gambler,
        space = 8 + Bet::LEN,
        seeds = [b"bet", vault.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,

    // Required programs
    pub system_program: Program<'info, System>
}

impl<'info> PlaceBet<'info> {
    pub fn create_bet(&mut self, bumps: &PlaceBetBumps, seed: u128, roll: u8, amount: u64) -> Result<()> {
        self.bet.set_inner(Bet{
            slot : Clock::get()?.slot,
            player: self.gambler.key(),
            seed,
            roll,
            amount,
            bump : bumps.bet,
        });
        Ok(())
    }

    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: self.gambler.to_account_info(),
            to: self.vault.to_account_info()
        };

        let cpi_context = CpiContext::new(
            self.system_program.to_account_info(),
            cpi_accounts
        );
        transfer(cpi_context, amount)
    }
}


