# Anchor Vault Q3

A minimal SOL vault program built with Anchor for Turbin3.

---

## 🚀 How to Run

```bash
anchor build     # Compiles the program
anchor test      # Run tests on local validator
```

## 📦 Main Instructions

These functions are exposed and callable from the web3 client (TypeScript or Rust):

### `initialize()`
- Creates a `VaultState` PDA for the user.
- Initializes a `vault` (SystemAccount) PDA and funds it with rent-exempt SOL.

### `deposit(amount: u64)`
- Transfers `amount` lamports from the user to their vault PDA.

### `withdraw(amount: u64)`
- Transfers `amount` lamports from the vault PDA to the user.
- Keeps rent-exempt minimum in the vault.

### `withdraw_and_close()`
- Transfers **all** SOL from the vault back to the user.
- Effectively closes the vault by draining its balance.
