use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};

#[derive(Accounts)]
pub struct Stake<'info> {
    /// Nft owner / staker 
    #[account(mut)]
    pub user: Signer<'info>,

    /// Program config 
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, StakeConfig>,

    /// User account - should have been created priorly 
    #[account(
        mut,
        seeds = [b"user", user.key().as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<'info, UserAccount>,


    /// NFT to be staked 
    pub nft_mint: Account<'info, Mint>,

    /// Nft account token holder
    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = user,
    )]
    pub user_nft_ata: Account<'info, TokenAccount>,

    /// Vault account that locks the NFT - handled by config 
    #[account(
        init_if_needed, 
        payer = user,   
        seeds = [b"vault", nft_mint.key().as_ref()], // mapping[nft_mint]
        bump,
        token::mint = nft_mint,
        token::authority = config, 
    )]
    pub vault_ata: Account<'info, TokenAccount>,

    /// Stake record PDA to track individual NFT stake info
    #[account(
        init,
        payer = user,    // pay sol
        seeds = [b"stake", user.key().as_ref(), nft_mint.key().as_ref()],  // mapping[user][nft_mint]
        bump,
        space = 8 + StakeAccount::INIT_SPACE, // Account storage
    )]
    pub stake_account: Account<'info, StakeAccount>,

    /// Required programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>, // Needed for timestamp
}

impl<'info> Stake<'info> {
    pub fn stake(&mut self, bumps: &StakeBumps) -> Result<()> {
        let clock = Clock::get()?;

        // Store stake metadata 
        self.stake_account.set_inner(StakeAccount {
            owner: self.user.key(),         // Who staked this NFT
            mint: self.nft_mint.key(),      // Which NFT was staked
            last_update: clock.unix_timestamp, // When it was staked
            bump: bumps.stake_account,      // PDA bump
        });

        self.user_account.amount_staked = self.user_account.amount_staked.saturating_add(1);    // Safemath

        // Transfer NFT from signer to vault (controlled by config)
        let cpi_accounts = Transfer {
            from: self.user_nft_ata.to_account_info(),
            to: self.vault_ata.to_account_info(),
            authority: self.user.to_account_info(),
        };

        // CPI context needed for transfer
        let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), cpi_accounts);
        transfer(cpi_ctx, 1)?; 

        Ok(())
    }
}