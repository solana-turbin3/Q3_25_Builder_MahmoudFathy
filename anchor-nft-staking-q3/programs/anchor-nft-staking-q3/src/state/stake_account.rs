use anchor_lang::prelude::*;

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub last_update: i64,
    pub bump: u8,
}

impl Space for StakeAccount {
    const INIT_SPACE: usize =  32*2 + 8 + 1;
}