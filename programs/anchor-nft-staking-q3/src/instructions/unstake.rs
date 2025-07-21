use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};

#[error_code]
pub enum UnstakeErrors {
    #[msg("Nft still locked")]
    NoYetUnlocked,

    #[msg("Nft does not exist in records")]
    NoLockedNft,

    #[msg("No claimable rewards")]
    NoRewards,

    #[msg("Addition overflow")]
    AdditionOverflow
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    /// Nft owner / staker 
    #[account(mut)]
    pub user: Signer<'info>,

    /// Program config 
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, StakeConfig>,

    /// User account - should have been created priorly 
    #[account(
        mut,
        seeds = [b"user", user.key.as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<'info, UserAccount>,

    /// Nft account token holder
    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = user,
    )]
    pub user_nft_ata: Account<'info, TokenAccount>,


    /// NFT to be staked 
    pub nft_mint: Account<'info, Mint>,

    /// Stake record PDA to track individual NFT stake info
    #[account(
        mut,
        seeds = [b"stake", user.key.as_ref(), nft_mint.key().as_ref()],
        bump = stake_account.bump,
        close = user  // Return rent to user
    )]
    pub stake_account: Account<'info, StakeAccount>,

    /// Vault account that locks the NFT - handled by config 
    #[account(
        mut,
        seeds = [b"vault", nft_mint.key().as_ref()],
        bump,
    )]
    pub vault_ata: Account<'info, TokenAccount>,

    /// Required programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

impl<'info> Unstake<'info> {
    pub fn unstake(&mut self) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        // Checks
        // Ensure locking period has passed
        require!(
            now   >=  self.stake_account.last_update + self.config.freeze_period as i64,
            UnstakeErrors::NoYetUnlocked
        );

        // Ensure there are NFT staked by this user account
        require!(
            self.user_account.amount_staked > 0,
            UnstakeErrors::NoLockedNft
        );

        // Effects 
        // Already assured to be 1 or more
        self.user_account.amount_staked = self
            .user_account
            .amount_staked
            - 1;

        // Upodate user rewards 
        self.user_account.points = self
            .user_account
            .points
            .checked_add(self.config.points_per_stake as u32)
            .ok_or(UnstakeErrors::AdditionOverflow)?;

        // -- CPI { 
        // Seeds by config authority
        let seeds: &[&[u8]] = &[b"config", &[self.config.bump]];
        let signer: &[&[&[u8]]; 1] = &[seeds];

        let cpi_accounts = Transfer {
            from: self.vault_ata.to_account_info(),
            to: self.user_nft_ata.to_account_info(),
            authority: self.config.to_account_info(),
        };

        let cpi_ctx =
            CpiContext::new_with_signer(self.token_program.to_account_info(), cpi_accounts, signer);

        // 1 Nft returned back to user (unstake) 
        transfer(cpi_ctx, 1)?;
        // } CPI --

        Ok(())
    }
}