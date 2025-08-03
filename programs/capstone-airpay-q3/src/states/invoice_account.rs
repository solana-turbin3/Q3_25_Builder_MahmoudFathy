use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct InvoiceAccount {
    pub seed: u64,
    pub merchant: Pubkey,
    pub mint: Pubkey,
    pub bump: u8,
}

