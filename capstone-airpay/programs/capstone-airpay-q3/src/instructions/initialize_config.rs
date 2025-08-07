use anchor_lang::prelude::*;
use anchor_spl::{
    token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked},
    associated_token::AssociatedToken,
};

use crate::states::Config;

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        seeds = [b"config", admin.key().as_ref(), seed.to_le_bytes().as_ref()],
        space = 8 + Config::INIT_SPACE,
        bump,
    )]
    pub config: Account<'info, Config>,
    // this mint specifies the Token in which the fees are being paid in
    #[account(
        mint::token_program = token_program
    )]
    pub mint: InterfaceAccount<'info, Mint>,
    /// Vault needed to collect payment fees
    #[account(
        init,
        payer = admin,
        associated_token::mint = mint,
        associated_token::authority = config,
        associated_token::token_program = token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,

}

impl<'info> InitializeConfig<'info> {
    pub fn init_config(
        &mut self, 
        fee: u16, 
        basis_points: u16, 
        whitelist_mints: [Pubkey; 2],
        seed: u64,
        bumps: &InitializeConfigBumps
    ) -> Result<()> {
        self.config.set_inner(
            Config { 
                seed, 
                admin: self.admin.key(),
                fee,
                basis_points,
                whitelist_mints,
                vault: self.vault.key(),
                bump: bumps.config
            }
        );
        Ok(())

    }
}

