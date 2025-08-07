import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

class SolanaClient {
  constructor() {
    // Use Solana Devnet
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed')
  }

  async getBalance(publicKeyString) {
    try {
      const publicKey = new PublicKey(publicKeyString)
      const balance = await this.connection.getBalance(publicKey)
      
      // Convert lamports to SOL
      const solBalance = balance / LAMPORTS_PER_SOL
      
      return {
        success: true,
        balance: solBalance,
        lamports: balance
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getAccountInfo(publicKeyString) {
    try {
      const publicKey = new PublicKey(publicKeyString)
      const accountInfo = await this.connection.getAccountInfo(publicKey)
      
      return {
        success: true,
        accountInfo: accountInfo
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getRecentBlockhash() {
    try {
      const { blockhash } = await this.connection.getLatestBlockhash()
      return {
        success: true,
        blockhash: blockhash
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default SolanaClient
