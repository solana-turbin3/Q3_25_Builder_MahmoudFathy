use anchor_lang::{
    prelude::*, 
    system_program::{Transfer, transfer}
};
use anchor_lang::solana_program::{
    sysvar::instructions::ID as INSTRUCTIONS_ID,
    sysvar::instructions::load_instruction_at_checked, 
    ed25519_program, hash::hash
};
use anchor_instruction_sysvar::Ed25519InstructionSignatures;

use crate::state::*;
use crate::errors::*;

/// House edge: needed to maintain sustainability for protocol 
/// default hardwired to 1.5% 
/// 150 points of base points 10_000
pub const HOUSE_EDGE: u16 = 150; 
pub const BASIS_POINTS: u16 = 10_000;

#[derive(Accounts)]
pub struct ResolveBet<'info> {
    /// Amin and funder of protocol
    #[account(mut)]
    pub house: Signer<'info>,
    #[account(
        mut
    )]
    ///CHECK: do not shout at me
    pub gambler: UncheckedAccount<'info>,
    /// Protocl vault - receives Sol
    #[account(
        mut,
        seeds = [b"vault", house.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,
    /// Reference to the Bet Account created priorly by gambler
    #[account(
        mut,
        close = gambler,
        seeds = [b"bet", vault.key().as_ref(), bet.seed.to_le_bytes().as_ref()],
        bump = bet.bump
    )]
    pub bet: Account<'info, Bet>,
    /// CHECK:
    #[account(
        address = INSTRUCTIONS_ID 
    )]
    pub instruction_sysvar: AccountInfo<'info>,
    // Required programs
    pub system_program: Program<'info, System>
}

impl<'info> ResolveBet<'info> {

    pub fn verify_ed25519_signature(&mut self, sig: &[u8]) -> Result<()> {
        // COPIED
        // Get the Ed25519 signature instruction 
        let ix = load_instruction_at_checked(
            0, 
            &self.instruction_sysvar.to_account_info()
        )?;
        // Make sure the instruction is addressed to the ed25519 program
        require_keys_eq!(ix.program_id, ed25519_program::ID, DiceError::Ed25519Program);
        // Make sure there are no accounts present
        require_eq!(ix.accounts.len(), 0, DiceError::Ed25519Accounts);
        
        let signatures = Ed25519InstructionSignatures::unpack(&ix.data)?.0;

        require_eq!(signatures.len(), 1, DiceError::Ed25519DataLength);
        let signature = &signatures[0];

        // Make sure all the data is present to verify the signature
        require!(signature.is_verifiable, DiceError::Ed25519Header);
        
        // Ensure public keys match
        require_keys_eq!(signature.public_key.ok_or(DiceError::Ed25519Pubkey)?, self.house.key(), DiceError::Ed25519Pubkey);

        // Ensure signatures match
        require!(&signature.signature.ok_or(DiceError::Ed25519Signature)?.eq(sig), DiceError::Ed25519Signature);

        // Ensure messages match
        require!(&signature.message.as_ref().ok_or(DiceError::Ed25519Signature)?.eq(&self.bet.to_slice()), DiceError::Ed25519Signature);

        Ok(())
    }

    pub fn resolve_bet(&mut self, bumps: &ResolveBetBumps, sig: &[u8]) -> Result<()> {
        let hash = hash(sig).to_bytes();
        let mut hash_16: [u8;16] = [0;16];
        hash_16.copy_from_slice(&hash[0..16]);
        let lower = u128::from_le_bytes(hash_16);
        hash_16.copy_from_slice(&hash[16..32]);
        let upper = u128::from_le_bytes(hash_16);
        
        let roll = lower
            .wrapping_add(upper)
            .wrapping_rem(100) as u8 + 1;

        if self.bet.roll > roll {

            // Payout minus house edge
            let payout = (self.bet.amount as u128)
            .checked_mul( (BASIS_POINTS - HOUSE_EDGE) as u128).ok_or(DiceError::MathOverflow)?
            .checked_div(self.bet.roll as u128 - 1).ok_or(DiceError::MathOverflow)?
            .checked_div(100).ok_or(DiceError::MathOverflow)? as u64;

            let accounts = Transfer {
                from: self.vault.to_account_info(),
                to: self.gambler.to_account_info()
            };

            let seeds = [b"vault", &self.house.key().to_bytes()[..], &[bumps.vault]];
            let signer_seeds = &[&seeds[..]][..];
    
            let ctx = CpiContext::new_with_signer(
                self.system_program.to_account_info(),
                accounts,
                signer_seeds
            );
            transfer(ctx, payout)?;
        }
        Ok(())
    }
}
