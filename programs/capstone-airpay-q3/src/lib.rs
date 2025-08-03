#![allow(unexpected_cfgs, deprecated)]
use anchor_lang::prelude::*;

pub mod states;
pub mod instructions;

use states::*;
use instructions::*;



declare_id!("J4aBD9W7P8sij5dLP4KZLiJZrCZXoRFazpGaVhcZuwZZ");

#[program]
pub mod capstone_airpay_q3 {
    use crate::instructions::InitializeInvoiceAccount;

    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>, 
        seed: u64 ,
        fee: u16, 
        basis_points: u16, 
        whitelist_mints: [Pubkey; 2]
    ) -> Result<()> {
        ctx.accounts.init_config(fee, basis_points, whitelist_mints, seed, &ctx.bumps)?;
        Ok(())
    }

    pub fn initialize_invoice_account(ctx: Context<InitializeInvoiceAccount>, seed: u64 ) -> Result<()> {
        ctx.accounts.init_invoice_account(seed, &ctx.bumps)?;
        Ok(())
    }
}

