use anchor_lang::prelude::*;

use anchor_spl::{
    token_interface::{transfer_checked}, Mint, TokenAccount, TokenInterface, TransferChecked},
};

#[derive(Accounts)]
#[instruction(seed: u64)]

pub struct Make <'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        mint::token_program = token_program
    )]
    pub mint_a: InterfaceAccount<'info, Mint>,
    pub mint_b: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = maker
        associated_token::token_program = token_program
    )]
    pub maker_ata_a: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer = maker,
        seeds = [b"escrow", maker.key().as_ref(), seed.to_le_bytes().as_ref()]
        space = 8 + Escrow::INIT_SPACE
    )]
    pub escrow: Account<'info, Escrow>;
    #[account(
        init,
        payer = maker,
        associated_token::mint = mint_a,
        associated_token::authority = escrow,
        associated_token::token_program
    )]
    pub vault: TokenInterface<'info, TokenAccount>,
    pub token_program: InterfaceAccount<'info, TokenInterface>,
    pub system_program: Program<'info, System>

}

impl <'info> Make <'info> {
    pub fn init_escrow(&mut self, seed: u64,  receive: u64, bumps: &MakeBumps) -> Result<()> {
        self.escrow.set_inner(
            Escrow {
                seed,
                maker: self.maker.key() ,
                mint_a: self.mint_a.key(),
                mint_b: self.mint_b.key(),
                receive ,
                bump: bumps.escrow 
            }
        );
        Ok(())

    }
}

