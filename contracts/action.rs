use anchor_lang::prelude::*;
use solana_program::pubkey::Pubkey;
use std::str::FromStr;

declare_id!("2tUZhdmg8L5teaLhASUw9A2mt7FeNHUguxp5LcHcXJZ4"); // remove this before building the program

#[program]
pub mod plant {
    use super::*;

    pub fn water(ctx: Context<Transfer>,) -> Result<()> {
        transfer_tokens(ctx, 0.001)
    }

    pub fn light(ctx: Context<Transfer>,) -> Result<()> {
        transfer_tokens(ctx, 0.002)
    }

    pub fn music(ctx: Context<Transfer>,) -> Result<()> {
        transfer_tokens(ctx, 0.003)
    }

    pub fn transfer_tokens(ctx: Context<Transfer>, amount: f64) -> Result<()> {
        // Initialize the Pubkey from the string directly within the function
        let destination_address = Pubkey::from_str("24gmPVxnHthq7Hhzip42aDXt9sUCRX9EyxFnRJGEPsCv").unwrap();

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.from.key(),
            &destination_address,
            (amount * 1_000_000_000.0) as u64, // Convert SOL to lamports
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.from.to_account_info(),
                ctx.accounts.to.to_account_info(),
            ],
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut)]
    pub from: Signer<'info>,
    #[account(mut)]
    pub to: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Transfer failed")]
    TransferFailed,
}
