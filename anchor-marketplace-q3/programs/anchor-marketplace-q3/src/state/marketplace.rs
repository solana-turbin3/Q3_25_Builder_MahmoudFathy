use anchor_lang::prelude::*;

#[account]
pub struct Marketplace {
    pub admin: Pubkey,
    pub fee: u16,
    pub bump: u8,
    pub treasury_bump: u8,
    pub reward_bump: u8,
    pub name: String,       // space = (4 + 32)
}

impl Space for Marketplace {
    const INIT_SPACE: usize =  32 + 2 + 3*1 + (4 + 32);
}
