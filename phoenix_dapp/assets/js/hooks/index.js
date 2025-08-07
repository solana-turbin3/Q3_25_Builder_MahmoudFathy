import SolanaClient from '../solana_client'
import {
    createSolanaClient,
    createTransaction,
    address,
    signTransactionMessageWithSigners,
    setTransactionMessageLifetimeUsingBlockhash,
    generateExtractableKeyPairSigner,
} from "gill";
import * as programClient from "../../clients/src/capstone_airpay_q3";

// Program address
const PROGRAM_ADDRESS = address("J3aBD9W7P8sij5dLP4KZLiJZrCZXoRFazpGaVhcZuwZZ");

const Hooks = {};
Hooks.Counter = {
  mounted() {
    // const button = document.getElementById("js-button")
    
    this.el.addEventListener("click", () => {
      const message = `Hello from JavaScript! Timestamp: ${new Date().toISOString()}`
      
      // Send message to LiveView
      this.pushEvent("js-message", { message })
      
      // Also manipulate DOM directly if needed
      console.log("Button clicked, message sent to LiveView")
    })
    
    // You can also listen to events from LiveView
    this.handleEvent("counter-updated", ({ count }) => {
      console.log(`Counter updated to ${count}`)
    })
  }
};


// Account address to check balance for
const VITO_ADDRESS = address("vitobZ3VjMwrZAJ6k2W7krx4HVhArrp1eQZLdJgVoN6");

Hooks.GillClient = {
    mounted() {
        // Create RPC client for mainnet
        console.log("Mounted gill client ... ");
        let {
            rpc,
            sendAndConfirmTransaction,
        } = createSolanaClient({
          urlOrMoniker: "localnet"
        });
        this.rpc = rpc;
        this.sendAndConfirmTransaction = sendAndConfirmTransaction;
        const gillButton = document.getElementById("program-initialize-config")
        // Solana balance button
        if (gillButton) {
          this.el.addEventListener("click", async () => {
            await this.initializeConfig();
          });
        }
    },

    async getAccountBalance(accountAddress) {

      try {
        // Get account info which includes lamports (balance)
        const { value: accountInfo } = await this.rpc.getAccountInfo(accountAddress).send();

        if (!accountInfo) {
          console.log("Account not found or has no data");
          return null;
        }

        // Balance in lamports (1 SOL = 1,000,000,000 lamports)

        const lamports = accountInfo.lamports;
        const solBalance = Number(lamports) / 1_000_000_000;

        console.log(`Account: ${accountAddress}`);
        console.log(`Balance: ${lamports} lamports`);
        console.log(`Balance: ${solBalance} SOL`);

        return {
          lamports,

          sol: solBalance,
          accountInfo
        };

      } catch (error) {
        console.error("Error fetching account balance:", error);

        throw error;
      }
    },
    async initializeConfig() {
      try {
        console.log("🚀 Starting initialize_config...");

        // Generate or load a keypair for the authority/fee payer
        const authority = await generateExtractableKeyPairSigner();
        console.log("Authority address:", authority.address);

        // Request airdrop for local testing
        console.log("💰 Requesting airdrop...");

        try {
          await this.rpc.requestAirdrop(authority.address, 1_000_000_000n).send(); // 1 SOL
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for confirmation
        } catch (error) {
          console.log("Airdrop might have failed, continuing...");
        }

        // Check balance
        const balance = await this.rpc.getBalance(authority.address).send();
        console.log("Authority balance:", Number(balance.value) / 1_000_000_000, "SOL");


        // Parameters for initialize_config instruction
        const seed = 12345n; // u64 as BigInt
        const fee = 100;     // u16 - represents 1% fee

        const basisPoints = 500; // u16 - represents 5% basis points
        const whitelistMints = [
          address("So11111111111111111111111111111111111111112"), // Wrapped SOL
          address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")  // USDC mainnet
        ];


        console.log("📋 Parameters:");
        console.log("  Seed:", seed.toString());
        console.log("  Fee:", fee);
        console.log("  Basis Points:", basisPoints);
        console.log("  Whitelist Mints:", whitelistMints.map(m => m.toString()));

        // Get latest blockhash
        const { value: latestBlockhash } = await this.rpc.getLatestBlockhash().send();

        // Use the generated Codama client to create the initialize_config instruction
        // The function name will be something like getInitializeConfigInstructionAsync
        const initConfigInstruction = await programClient.getInitializeConfigInstructionAsync({

          // The accounts required by your InitializeConfig struct
          // You'll need to adjust these based on your actual Anchor accounts struct
          
          // Common accounts for config initialization:
          admin: authority.address,     // The signer/authority
          config: null, // This will be derived as PDA, Codama should handle this
          mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),  // USDC mainnet
          systemProgram: address("11111111111111111111111111111112"), // System program
          
          // Instruction arguments
          seed,
          fee,
          basisPoints,
          whitelistMints,
        });

        console.log("📝 Created initialize_config instruction");

        // Create transaction with the instruction
        const transaction = createTransaction({

          version: 0,
          feePayer: authority,
          instructions: [initConfigInstruction],
          latestBlockhash,

        });

        console.log("✍️  Signing transaction...");
        const signedTransaction = await signTransactionMessageWithSigners(
            transaction
            // setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, transaction)
        );

        console.log("📤 Sending transaction...");
        // const signature = await this.sendAndConfirmTransaction(
        //     signedTransaction
        // );
        const sendResult = await this.rpc.sendTransaction(signedTransaction, {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
            maxRetries: 5
        }).send();

        console.log("✅ Transaction successful!");
        // console.log("📋 Transaction signature:", signature);
        
        // If you need to get the derived config account address, you can use:
        // const [configAddress] = await programClient.findConfigPda({ seed }); // or similar

        // console.log("📍 Config account:", configAddress);

        return {
          // signature,
          authority: authority.address,
          seed: seed.toString(),
          fee,
          basisPoints,
          whitelistMints: whitelistMints.map(m => m.toString())
        };

      } catch (error) {
        console.error("❌ Error initializing config:", error);
        
        // Enhanced error logging
        if (error.cause) {
          console.error("Error cause:", error.cause);
        }
        if (error.logs) {
          console.error("Transaction logs:", error.logs);
        }
        
        throw error;

      }
    }
};

Hooks.InitializeConfig = {
  mounted() {
    // Initialize Solana client
    this.solanaClient = new SolanaClient()
    const solanaButton = document.getElementById("initialize-config-js")

    // Solana balance button
    if (solanaButton) {
      this.el.addEventListener("click", async () => {
        await this.getSolanaBalance('vitobZ3VjMwrZAJ6k2W7krx4HVhArrp1eQZLdJgVoN6')
      })
    }
  },

  async getSolanaBalance(accountAddress) {
    try {
      // Show loading state
      this.pushEvent("initialize-config", { loading: true })

      console.log(`Initializing Config: ${accountAddress}`)
      // TODO: Transaction to program should be here 
      const result = await this.solanaClient.getBalance(accountAddress)

      if (result.success) {
        console.log(`Balance: ${result.balance} SOL`)

        // Send result back to LiveView
        this.pushEvent("solana-balance-result", {
          success: true,
          balance: result.balance,
          lamports: result.lamports,
          account: accountAddress
        })

        // Optional: Show browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Balance Retrieved", {
            body: `${result.balance.toFixed(6)} SOL`,
            icon: "/favicon.ico"
          })
        }

      } else {
        console.error(`Error: ${result.error}`)
        this.pushEvent("solana-balance-result", {
          success: false,
          error: result.error,
          account: accountAddress
        })
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      this.pushEvent("solana-balance-result", {
        success: false,
        error: error.message,
        account: accountAddress
      })
    } finally {
      // Hide loading state
      this.pushEvent("solana-balance-loading", { loading: false })
    }
  }
}


Hooks.GetBalance = {
  mounted() {
    // Initialize Solana client
    this.solanaClient = new SolanaClient()
    const solanaButton = document.getElementById("get-sol-balance-js")
    
    // Solana balance button
    if (solanaButton) {
      this.el.addEventListener("click", async () => {
        await this.getSolanaBalance('vitobZ3VjMwrZAJ6k2W7krx4HVhArrp1eQZLdJgVoN6')
      })
    }
  },

  async getSolanaBalance(accountAddress) {
    try {
      // Show loading state
      this.pushEvent("solana-balance-loading", { loading: true })
      
      console.log(`Fetching balance for: ${accountAddress}`)
      
      const result = await this.solanaClient.getBalance(accountAddress)
      
      if (result.success) {
        console.log(`Balance: ${result.balance} SOL`)
        
        // Send result back to LiveView
        this.pushEvent("solana-balance-result", {
          success: true,
          balance: result.balance,
          lamports: result.lamports,
          account: accountAddress
        })
        
        // Optional: Show browser notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Balance Retrieved", {
            body: `${result.balance.toFixed(6)} SOL`,
            icon: "/favicon.ico"
          })
        }
        
      } else {
        console.error(`Error: ${result.error}`)
        this.pushEvent("solana-balance-result", {
          success: false,
          error: result.error,
          account: accountAddress
        })
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      this.pushEvent("solana-balance-result", {
        success: false,
        error: error.message,
        account: accountAddress
      })
    } finally {
      // Hide loading state
      this.pushEvent("solana-balance-loading", { loading: false })
    }
  }
}

export default Hooks
