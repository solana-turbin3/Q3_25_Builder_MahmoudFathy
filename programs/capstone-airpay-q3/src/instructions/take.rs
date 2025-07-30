use anchor_lang::prelude::*;

use anchor_spl::{
    token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked},
    associated_token::AssociatedToken,
    associated_token::get_associated_token_address
};

use crate::state::Escrow;

#[derive(Accounts)]
pub struct Take<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,
    #[account(
        mint::token_program = token_program
    )]
    pub mint_a: InterfaceAccount<'info, Mint>,
    #[account(
        mint::token_program = token_program
    )]
    pub mint_b: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint_b,
        associated_token::authority = escrow.maker,
        associated_token::token_program = token_program,
    )]
    pub maker_ata_b: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint_b,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_ata_b: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_ata_a: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
    #[account(mut)]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    
}

impl<'info> Take<'info> {
    pub fn swap(&mut self ) -> Result<()> {
        // let escrow_maker_ata_a = get_associated_token_address(&self.escrow.maker, &self.escrow.mint_a); 
        
        let transfer_accounts = TransferChecked {
            from: self.taker_ata_b.to_account_info(),
            mint: self.mint_b.to_account_info(),
            to: self.maker_ata_b.to_account_info(),
            authority: self.taker.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), transfer_accounts);
        
        transfer_checked(cpi_ctx, self.escrow.receive, self.mint_b.decimals)?;
        
        let transfer_accounts_mint_a = TransferChecked {
            from: self.vault.to_account_info(),
            mint: self.mint_a.to_account_info(),
            to: self.taker_ata_a.to_account_info(),
            authority: self.escrow.to_account_info(),
        };
        let seeds = &[
            b"escrow",
            self.escrow.maker.as_ref(),
            &self.escrow.seed.to_le_bytes(),
            &[self.escrow.bump],
        ];
        let signer_seeds = &[&seeds[..]];
        let cpi_ctx_mint_a = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            transfer_accounts_mint_a,
            signer_seeds
        );
        
        transfer_checked(
            cpi_ctx_mint_a,
            self.vault.amount,              // amount of tokens to transfer
            self.mint_a.decimals // decimals of the mint
        )?;
        Ok(())
        
    }
    
}