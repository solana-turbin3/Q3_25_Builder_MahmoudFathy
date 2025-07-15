# Anchor Escrow Q3

This Solana program implements a simple escrow system using the Anchor framework, allowing two users to securely swap SPL tokens via the known escrow mechanism.

## 📁 Program Overview

### Instructions

#### `initialize(ctx, seed, deposit, receive)`
Initializes a new escrow instance by:
- Creating the escrow account (PDA derived from the maker and seed)
- Creating an associated vault token account for mint A
- Transferring the `deposit` amount of `mint_a` from the maker to the vault
- Storing how much the maker wants to receive in `mint_b` (`receive`)

Defined in [`make.rs`](./programs/anchor-escrow-q3/src/instructions/make.rs)

#### `take(ctx)`
Allows a taker to fulfill the escrow offer by:
- Sending `mint_b` tokens to the maker
- Receiving the locked `mint_a` tokens from the vault

Defined in [`take.rs`](./programs/anchor-escrow-q3/src/instructions/take.rs)

---

## 📦 How to Build and Test

To compile the program:

```bash
anchor build
anchor test
```

## 🧩 Program Structure
### make.rs
#### Handles:

- Escrow initialization

- Vault creation

- Maker token deposit (mint A → vault)

### take.rs
#### Handles:

- Token swap logic

- Taker pays mint_b → maker

- Taker receives mint_a from vault (signed by escrow PDA)

## ✍️ Notes

- PDAs are derived using seeds = [b"escrow", maker, seed]

- Vault is an associated token account owned by the escrow PDA

- transfer_checked is used for token transfers to ensure mint decimals match
