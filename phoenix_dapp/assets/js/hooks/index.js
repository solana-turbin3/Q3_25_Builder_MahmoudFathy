
// FIXME: Follow up the guide in app.js to fix issue imnporting packages

import SolanaClient from '../solana_client'


const Hooks = {}
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