 🎲 Anchor Dice Game (Q3)

This is an educational Solana smart contract built with [Anchor](https://book.anchor-lang.com/). It simulates a decentralized dice game between a protocol admin (the "house") and users (gamblers).

---

## 🛠️ Build & Test

To build the program locally:

```sh
anchor build
```

---

## 📦 Program Instructions

### `initialize(amount: u64)`
- Called by the **protocol admin (house)**.
- Transfers the specified SOL `amount` from the admin to the protocol vault PDA.
- Prepares the game to accept bets.

### `place_bet(seed: u128, roll: u8, amount: u64)`
- Called by **gamblers** to place a bet.
- Creates a Bet account using a seed and records the chosen `roll`.
- Transfers SOL from the gambler to the program’s vault.

### `resolve_bet(sig: Vec<u8>)`
- Called by the **admin** to resolve the bet after the game ends.
- Uses an Ed25519 signature outcome from the house as a source of randomness.
- Transfers winnings to the correct gambler based on the dice outcome.

### `refund_bet()`
- Called by **gamblers** to reclaim their SOL if the bet hasn't been resolved.
- Allows users to exit safely in case of timeout or cancellation.

---

## 📁 Project Structure

```
programs/
└── anchor-dice-q3/
    ├── src/
    │   ├── lib.rs             # Main entrypoint, instruction dispatcher
    │   ├── instructions/      # Implementation of program logic
    │   ├── state              # Types (Bet)
    │   └── errors.rs          # Custom error codes for clarity
```

---

## 🔐 PDAs

- `vault` — Holds house SOL used to pay out winning bets.
- `bet` — One per gambler per game, storing guess and wager.

---

Happy betting. Bet responsibly 🎲
