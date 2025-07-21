# Anchor NFT Staking Q3

An Anchor-based Solana program for staking and unstaking NFTs to earn reward points after a specified freeze period.

## Configurable Parameters

- **points\_per\_stake** (`u8`): Points awarded per staked NFT
- **max\_stake** (`u8`): Maximum NFTs a user may stake
- **freeze\_period** (`u32`): Lock duration in seconds

## Accounts

- **Config**: PDA with seed `"config"` – stores global settings
- **User**: PDA with seed `["user", user_pubkey]` – tracks each user’s stakes and earned points

## Instructions

1. **initialize\_config**

   - **Context**: `InitializeConfig`
   - **Args**: `points_per_stake`, `max_stake`, `freeze_period`
   - Initializes the global config account with provided parameters.

2. **initialize\_user**

   - **Context**: `InitializeUser`
   - Sets up a user-specific account to track stakes and rewards.

3. **stake**

   - **Context**: `Stake`
   - Transfers an NFT into program custody and updates user state.

4. **unstake**

   - **Context**: `Unstake`
   - Ensures the freeze period has elapsed, returns the NFT, and credits points.

## Usage Example

```shell
# Build 
anchor build 

# Test
anchor test

# Call initialize_config
anchor run initialize_config -- --points-per-stake 5 --max-stake 3 --freeze-period 86400

```

