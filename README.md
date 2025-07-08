# Solana Training Projects

This repository contains a collection of hands-on projects designed to demonstrate core Solana development skills using both **Rust** and **TypeScript**. The goal is to build confidence in working with Solana transactions, SPL tokens, and NFTs using various tools and languages.

## Repository Structure

### 1. [`prereq-rs`](./prereq-rs)

A **Solana client implemented in Rust**. This repo demonstrates the following operations:

- **Requesting an airdrop** for a local wallet
- **Transferring SOL** between two accounts
- **Minting an NFT** from a [Turbin3] collection

This project is aims at getting us familiar with solana client interactions in Rust, and working with NFTs.

---

### 2. [`prereq-ts`](./prereq-ts)

A **TypeScript implementation** of the same features from `prereq-rs`. This client showcases:

- Requesting an airdrop using the Solana Web3.js library
- Transferring SOL from one wallet to another
- Minting an NFT via a Turbin3 collection using TypeScript tooling

This can be ideal for frontend or full-stack developers looking to work with Solana through JavaScript/TypeScript interfaces.

---

### 3. [`spl-and-nft-scripts`](./spl-and-nft-scripts)

A set of utility scripts showcasing how to interact with **SPL tokens** and **Metaplex NFTs** on Solana using TypeScript. This includes:

#### 🪙 SPL Token Scripts
- `spl_init.ts`: Creates a new SPL token mint
- `spl_mint.ts`: Mints tokens to a designated wallet address
- `spl_transfer.ts`: Transfers SPL tokens between wallets
- `spl_metadata.ts`: Adds metadata to a token using the **UMI framework**

#### 🖼️ Metaplex NFT Scripts
- `nft_image.ts`: Uploads an image to distributed storage (e.g., irys)
- `nft_mint.ts`: Mints an NFT using the Metaplex framework 

---

## Prerequisites

- Node.js / npm
- Rust & Cargo
- Solana CLI 
- Phantom or another Solana wallet (devnet)
- Anchor (optional, for Rust development)

---

## Getting Started with prereqs 

- Clone the repo
```bash
git clone https://github.com/solana-turbin3/Q3_25_Builder_MahmoudFathy.git
```

- Install dependencies in `prereq-rs`
```bash
cd prereq-rs
cargo install
```
- Run 
```bash
cargo test
```

- Install dependencies in `prereq-ts`
```bash
cd prereq-ts
yarn install
```

- Create a new key pair 
```bash
yarn run keygen
```

- Airdrop sol to the newly created keys
```bash
yarn run airdrop
```

- Copy your private `turbin3-wallet.json` file to `prereq.ts` 
- Transfer sol to your wallet
```bash
yarn run transfer
```

- Mint an nft to your wallet
```bash 
yarn run enroll
```

## Running solana-starter

- Navigate to project
```bash
cd solana-starter/ts/cluser1
```

- Install dependencies
```bash
yarn install
```
- From there you have the following choices demonstrated below

### SPL Tokens

- Create new mint
```bash
npx ts-node spl_init.ts
```

- Mint spl tokens
```bash
npx ts-node spl_mint.ts
```

- Transfer tokens
```bash
npx ts-node spl_transfer.ts
```

- Initialize metada using UMI framework
```bash
npx ts-node spl_metadata.ts
```

### Metaplex NFT

- Upload image to irys storage
```bash
npx ts-node nft_image.ts
```

- Mint new cool NFT
```bash
npx ts-node nft_mint.ts
```



