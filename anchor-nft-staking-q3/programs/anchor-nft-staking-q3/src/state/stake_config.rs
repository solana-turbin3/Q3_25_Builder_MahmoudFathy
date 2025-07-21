use anchor_lang::prelude::*;


#[account]
pub struct StakeConfig {
    pub freeze_period: u32,
    pub points_per_stake: u8,
    pub max_stake: u8,
    pub rewards_bump: u8,
    pub bump: u8,
}

impl Space for StakeConfig {
    const INIT_SPACE: usize = 1*4 + 1 + 1 + 1 + 1;
}


