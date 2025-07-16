# Anchor AMM Q3

This project demonstrates a basic implementation of an Automated Market Maker (AMM) using the Anchor framework on Solana. The AMM supports LP token minting and proportional token deposits based on the constant product formula.

---

## 🧠 Key Concepts

- **AMM Configuration**: Created using the `initialize` instruction. Sets up LP mint, vaults for token X and Y, and the config account.

---

## 🧩 Program Instructions

### `initialize(seed, fee, authority)`
Initializes the AMM state:
- Creates `mint_lp` token.
- Creates vaults for `mint_x` and `mint_y`.
- Stores config parameters (e.g., fee, authority).
  
### `deposit(amount, max_x, max_y)`
Allows a user to deposit a specified amount of LP tokens in exchange for underlying tokens:
- Transfers `mint_x` and `mint_y` from the user to the vaults.
- Mints `amount` LP tokens to the user.
- Protection is considered by setting slippage bounds via `max_x` and `max_y`.

---

## 🛠 Usage

Build the Solana program:

```bash
anchor build
```

Test the program [TODO: Tests are not written yet]

```bash
anchor test
```



## Personal Debugging Notes

- Error encountered after running `anchor build`  in `initialize.rs` using macro
```rust
#[derive(Accounts)]
```
  - This is fixed in `Cargo.toml` by adding `"anchor-spl/idl-build"` to become  `idl-build = ["anchor-lang/idl-build", "anchor-spl/idl-build"]`

