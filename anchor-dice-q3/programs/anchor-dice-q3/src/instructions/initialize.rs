use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// House account owned by protocol - players bet against it
    #[account(mut)]
    pub house: Signer<'info>,
    /// Vault receives the bet amounts in Sol from players and house
    #[account(
        mut,
        seeds = [b"vault", house.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,
    // Required Programs
    pub system_program: Program<'info, System>
}

impl<'info> Initialize<'info> {
    /// Initializes a game by putting the funds into vault
    ///
    /// Protocol admin transfers `amount` of Sol to protocol vault
    pub fn initialize(&mut self, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: self.house.to_account_info(),
            to: self.vault.to_account_info()
        };

        let cpi_context = CpiContext::new(
            self.system_program.to_account_info(),
            cpi_accounts
        );

        transfer(cpi_context, amount)
    }
}
