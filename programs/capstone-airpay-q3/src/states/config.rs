use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Config{
    pub seed: u64,
    pub admin: Pubkey,
    /// fee is the amount deducted by protocol in transfers
    pub fee: u16,
    /// basis_points represent the units of fees
    pub basis_points: u16,
    /// vault is created to collect the fees
    pub vault: Pubkey, 
    /// whitelist_mints are the tokens allowed in the protocol as currency
    pub whitelist_mints: [Pubkey; 2],
    pub bump: u8,
}

