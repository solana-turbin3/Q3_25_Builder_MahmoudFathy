/**
 * Wallet UI - Vanilla JavaScript Implementation with MetaMask + Gill
 * Inspired by wallet-ui patterns but built for pure JavaScript
 */

import { 
  createSolanaClient,
  createTransaction,
  address,
  signTransactionMessageWithSigners,
  getSignatureFromTransaction
} from "gill";

// Import the generated program client (after running Codama)
import * as programClient from "../clients/src/capstone_airpay_q3";

// Wallet UI Core Class

class WalletUI {
  constructor(options = {}) {
    this.options = {
      autoConnect: true,
      theme: 'dark',
      cluster: 'localnet',
      programId: "J4aBD9W7P8sij5dLP4KZLiJZrCZXoRFazpGaVhcZuwZZ",
      ...options
    };
    

    this.state = {
      connected: false,
      connecting: false,
      wallet: null,
      publicKey: null,
      balance: 0
    };
    
    this.listeners = new Map();
    this.rpc = null;

    this.supportedWallets = this.getSupportedWallets();
    
    this.init();
  }

  // Initialize the wallet UI

  init() {

    // Create RPC client
    const rpcUrl = this.options.cluster === 'localnet' 
      ? 'http://127.0.0.1:8899'
      : this.options.cluster;

      
    this.rpc = createSolanaClient({ urlOrMoniker: rpcUrl }).rpc;
    
    // Auto-connect if enabled
    if (this.options.autoConnect) {
      this.autoConnect();

    }
  }


  // Get list of supported wallets
  getSupportedWallets() {
    const wallets = [];
    
    // Check for MetaMask with Solana support
    // if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
    //   wallets.push({
    //     name: 'MetaMask',
    //     icon: '🦊',
    //     type: 'metamask',
    //     available: true,
    //     solanaSupport: window.solana?.isMetaMask || this.hasMetaMaskSnaps()
    //   });
    // }
    
    // Check for Phantom
    if (typeof window !== 'undefined' && window.solana?.isPhantom) {
      wallets.push({
        name: 'Phantom',
        icon: '👻',
        type: 'phantom',
        available: true,
        solanaSupport: true
      });
    }
    
    // Check for Solflare
    if (typeof window !== 'undefined' && window.solflare) {
      wallets.push({
        name: 'Solflare',
        icon: '🌅',
        type: 'solflare',
        available: true,
        solanaSupport: true
      });

    }
    

    return wallets;
  }


  // Check if MetaMask has Snaps support
  hasMetaMaskSnaps() {
    return typeof window !== 'undefined' && 

           window.ethereum?.isMetaMask && 
           typeof window.ethereum.request === 'function';
  }

  // Auto-connect to previously connected wallet
  async autoConnect() {
    const savedWallet = localStorage.getItem('wallet-ui-connected');
    if (savedWallet) {
      try {
        await this.connect(JSON.parse(savedWallet));
      } catch (error) {

        console.warn('Auto-connect failed:', error);
        localStorage.removeItem('wallet-ui-connected');
      }
    }
  }

  // Connect to a specific wallet
  async connect(walletInfo) {

    if (this.state.connecting) return;
    
    this.setState({ connecting: true });
    this.emit('connecting', walletInfo);
    

    try {
      let connection;
      
      switch (walletInfo.type) {
        case 'metamask':
          connection = await this.connectMetaMask();
          break;
        case 'phantom':
          connection = await this.connectPhantom();
          break;
        case 'solflare':
          connection = await this.connectSolflare();
          break;
        default:
          throw new Error(`Unsupported wallet: ${walletInfo.type}`);
      }
      
      if (connection) {
        this.setState({
          connected: true,
          connecting: false,
          wallet: walletInfo,
          publicKey: connection.publicKey

        });

        
        // Save connection state
        localStorage.setItem('wallet-ui-connected', JSON.stringify(walletInfo));
        

        // Update balance
        await this.updateBalance();
        
        this.emit('connect', { wallet: walletInfo, publicKey: connection.publicKey });
        return connection;

      }
      
    } catch (error) {

      this.setState({ connecting: false });
      this.emit('error', error);
      throw error;
    }
  }

  // Connect MetaMask wallet
  async connectMetaMask() {
    // Method 1: Native Solana support
    if (window.solana?.isMetaMask) {

      const response = await window.solana.connect();
      return {
        publicKey: response.publicKey.toString(),
        signTransaction: (tx) => window.solana.signTransaction(tx),
        signMessage: (msg) => window.solana.signMessage(msg)
      };
    }

    
    // Method 2: Try Wallet Standard
    if (typeof window.getWallets === 'function') {
      const wallets = window.getWallets();
      const metamask = wallets.find(w => 
        w.name.toLowerCase().includes('metamask') && 
        w.chains.includes('solana:mainnet')
      );
      

      if (metamask) {
        const accounts = await metamask.features['solana:connect']();
        return {
          publicKey: accounts[0].address,

          signTransaction: (tx) => metamask.features['solana:signTransaction']({
            transaction: tx,
            account: accounts[0]

          }),
          signMessage: (msg) => metamask.features['solana:signMessage']({
            message: msg,
            account: accounts[0]

          })
        };
      }
    }
    
    // Method 3: Snaps fallback
    if (this.hasMetaMaskSnaps()) {
      // Request Solana Snap installation if needed
      try {
        await window.ethereum.request({

          method: 'wallet_requestSnaps',
          params: {
            'npm:@solflare-wallet/solana-snap': {}

          }
        });
        
        // After Snap installation, try connecting
        const accounts = await window.ethereum.request({
          method: 'wallet_invokeSnap',
          params: {
            snapId: 'npm:@solflare-wallet/solana-snap',
            request: { method: 'connect' }
          }
        });
        
        if (accounts && accounts.length > 0) {
          return {
            publicKey: accounts[0],
            signTransaction: async (tx) => {
              return await window.ethereum.request({
                method: 'wallet_invokeSnap',
                params: {
                  snapId: 'npm:@solflare-wallet/solana-snap',
                  request: { method: 'signTransaction', params: { transaction: tx } }
                }
              });
            }
          };
        }
      } catch (snapError) {
        console.warn('Snap connection failed:', snapError);
      }
    }
    
    throw new Error('MetaMask Solana support not available');
  }

  // Connect Phantom wallet
  async connectPhantom() {
    if (!window.solana?.isPhantom) {
      throw new Error('Phantom wallet not found');
    }
    
    const response = await window.solana.connect();
    return {
      publicKey: response.publicKey.toString(),
      signTransaction: (tx) => window.solana.signTransaction(tx),
      signMessage: (msg) => window.solana.signMessage(msg)
    };
  }

  // Connect Solflare wallet
  async connectSolflare() {
    if (!window.solflare) {
      throw new Error('Solflare wallet not found');

    }
    

    await window.solflare.connect();
    return {
      publicKey: window.solflare.publicKey.toString(),
      signTransaction: (tx) => window.solflare.signTransaction(tx),
      signMessage: (msg) => window.solflare.signMessage(msg)
    };
  }

  // Disconnect wallet
  async disconnect() {
    try {
      // Disconnect from wallet
      switch (this.state.wallet?.type) {
        case 'metamask':
          if (window.solana?.isMetaMask && window.solana.disconnect) {
            await window.solana.disconnect();
          }
          break;
        case 'phantom':
          if (window.solana?.disconnect) {
            await window.solana.disconnect();
          }
          break;
        case 'solflare':
          if (window.solflare?.disconnect) {
            await window.solflare.disconnect();
          }
          break;
      }
    } catch (error) {
      console.warn('Disconnect error:', error);
    }
    
    // Clear state
    this.setState({

      connected: false,
      wallet: null,
      publicKey: null,
      balance: 0
    });
    
    localStorage.removeItem('wallet-ui-connected');
    this.emit('disconnect');
  }

  // Update balance

  async updateBalance() {

    if (!this.state.publicKey || !this.rpc) return;
    
    try {
      const balance = await this.rpc.getBalance(address(this.state.publicKey)).send();
      this.setState({ balance: Number(balance.value) / 1_000_000_000 });
      this.emit('balanceChanged', this.state.balance);
    } catch (error) {
      console.warn('Balance update failed:', error);
    }
  }

  // Sign and send transaction
  async sendTransaction(transaction) {
    if (!this.state.connected || !this.state.wallet) {
      throw new Error('Wallet not connected');
    }
    
    try {

      // Sign transaction based on wallet type
      let signedTransaction;
      
      switch (this.state.wallet.type) {
        case 'metamask':
          signedTransaction = await this.signWithMetaMask(transaction);
          break;
        case 'phantom':
          console.log(window.phantom.solana);
          console.log(transaction);
          // signedTransaction = await window.solana.signTransaction(transaction);
          signedTransaction = await window.phantom.solana.signAndSendTransaction(transaction);
          break;
        case 'solflare':
          signedTransaction = await window.solflare.signTransaction(transaction);
          break;
        default:
          throw new Error('Unsupported wallet for signing');
      }
      
      // Send transaction
      const signature = getSignatureFromTransaction(signedTransaction);
      // await this.rpc.sendTransaction(signedTransaction, {
      //   skipPreflight: false,
      //   preflightCommitment: 'confirmed'
      // }).send();
      //
      // this.emit('transactionSent', { signature, transaction: signedTransaction });
      // return signature;
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  // Sign transaction with MetaMask
  async signWithMetaMask(transaction) {
    if (window.solana?.isMetaMask) {
      return await window.solana.signTransaction(transaction);
    }
    
    // Fallback to Snap
    return await window.ethereum.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: 'npm:@solflare-wallet/solana-snap',
        request: { 
          method: 'signTransaction', 
          params: { transaction } 
        }
      }
    });
  }

  // Initialize config transaction helper
  async initializeConfig(params = {}) {
    const {

      seed = 12345n,
      fee = 100,
      basisPoints = 500,
      whitelistMints = [
        address("So11111111111111111111111111111111111111112"),
        address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")

      ]
    } = params;
    
    if (!this.state.connected) {
      throw new Error('Wallet not connected');

    }
    

    this.emit('transactionStarting', 'initialize_config');
    

    try {
      // Get latest blockhash
      const { value: latestBlockhash } = await this.rpc.getLatestBlockhash().send();
      

      // Create instruction using Codama-generated client
      // const instruction = await programClient.getInitializeConfigInstructionAsync({
      //   admin: address(this.state.publicKey),
      //   systemProgram: address("11111111111111111111111111111112"),
      // }, {
      //   seed,
      //   fee,
      //   basisPoints,
      //   whitelistMints,
      // });
        const instruction = await programClient.getInitializeConfigInstructionAsync({

          // The accounts required by your InitializeConfig struct
          // You'll need to adjust these based on your actual Anchor accounts struct

          // Common accounts for config initialization:
          admin: address(this.state.publicKey),     // The signer/authority
          config: null, // This will be derived as PDA, Codama should handle this
          mint: address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),  // USDC mainnet
          systemProgram: address("11111111111111111111111111111112"), // System program

          // Instruction arguments
          seed,
          fee,
          basisPoints,
          whitelistMints,
        });    
      // Create transaction
      const transaction = createTransaction({
        version: 'legacy',

        feePayer: address(this.state.publicKey),
        instructions: [instruction],
        latestBlockhash,
      });
      
      // Send transaction
      const signature = await this.sendTransaction(transaction);
      
      this.emit('transactionSuccess', {
        type: 'initialize_config',
        signature,

        params: { seed: seed.toString(), fee, basisPoints }
      });
      
      return signature;
      

    } catch (error) {
      this.emit('transactionError', {
        type: 'initialize_config',
        error: error.message
      });
      throw error;
    }
  }

  // State management
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.emit('stateChange', this.state);

  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }

      });
    }
  }

  // Get current state (immutable)
  getState() {
    return { ...this.state };

  }

  // Get available wallets

  getWallets() {
    return [...this.supportedWallets];
  }

}


// Wallet UI Components for DOM manipulation
class WalletUIComponents {

  constructor(walletUI) {
    this.walletUI = walletUI;
    this.elements = new Map();
  }

  // Create wallet connection button
  createConnectButton(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container ${containerId} not found`);
    
    const button = document.createElement('button');
    button.id = 'wallet-connect-btn';
    button.className = `wallet-connect-btn ${options.className || ''}`;
    button.style.cssText = `
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;

      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      ${options.style || ''}
    `;

    
    const updateButton = () => {
      const state = this.walletUI.getState();
      if (state.connecting) {
        button.textContent = '🔄 Connecting...';
        button.disabled = true;
      } else if (state.connected) {
        const truncated = state.publicKey 
          ? `${state.publicKey.slice(0, 4)}...${state.publicKey.slice(-4)}`
          : 'Connected';
        button.textContent = `🔗 ${truncated}`;
        button.disabled = false;

      } else {
        button.textContent = options.text || '🦊 Connect Wallet';
        button.disabled = false;
      }
    };
    
    button.addEventListener('click', () => {

      if (this.walletUI.getState().connected) {
        this.showWalletModal();

      } else {
        this.showConnectModal();
      }
    });
    

    // Update button on state changes
    this.walletUI.on('stateChange', updateButton);
    updateButton();
    
    container.appendChild(button);
    this.elements.set('connectButton', button);
    

    return button;
  }


  // Create wallet selection modal
  showConnectModal() {
    if (document.getElementById('wallet-modal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'wallet-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;

      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');

    modalContent.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      color: #333;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Connect Wallet';
    title.style.cssText = 'margin: 0 0 16px 0; font-size: 18px; font-weight: 600;';

    
    const walletList = document.createElement('div');
    walletList.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';
    
    // Add wallet options

    const wallets = this.walletUI.getWallets();

    wallets.forEach(wallet => {
      const walletButton = document.createElement('button');

      walletButton.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
        text-align: left;

      `;
      
      walletButton.innerHTML = `
        <span style="font-size: 24px;">${wallet.icon}</span>
        <div>
          <div style="font-weight: 600;">${wallet.name}</div>

          <div style="font-size: 12px; color: #666;">

            ${wallet.available ? (wallet.solanaSupport ? 'Ready' : 'Solana support needed') : 'Not installed'}
          </div>
        </div>
      `;
      
      walletButton.addEventListener('mouseover', () => {
        walletButton.style.backgroundColor = '#f3f4f6';
      });

      

      walletButton.addEventListener('mouseout', () => {
        walletButton.style.backgroundColor = 'white';
      });
      
      if (wallet.available) {
        walletButton.addEventListener('click', async () => {
          modal.remove();
          try {
            await this.walletUI.connect(wallet);
          } catch (error) {

            alert(`Connection failed: ${error.message}`);
          }
        });
      } else {
        walletButton.style.opacity = '0.5';
        walletButton.style.cursor = 'not-allowed';
      }
      
      walletList.appendChild(walletButton);

    });
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cancel';
    closeButton.style.cssText = `
      margin-top: 16px;

      padding: 8px 16px;
      background: #f3f4f6;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      width: 100%;

    `;
    closeButton.addEventListener('click', () => modal.remove());
    
    modalContent.appendChild(title);
    modalContent.appendChild(walletList);
    modalContent.appendChild(closeButton);
    modal.appendChild(modalContent);
    
    // Close on background click
    modal.addEventListener('click', (e) => {

      if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
  }


  // Show connected wallet modal

  showWalletModal() {
    const state = this.walletUI.getState();

    if (!state.connected) return;
    
    if (document.getElementById('wallet-info-modal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'wallet-info-modal';

    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;

      border-radius: 12px;
      padding: 24px;
      max-width: 400px;

      width: 90%;
      color: #333;
    `;
    
    modalContent.innerHTML = `
      <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
        ${state.wallet.icon} ${state.wallet.name}

      </h3>

      <div style="margin-bottom: 16px;">

        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Address:</div>
        <div style="font-family: monospace; font-size: 14px; word-break: break-all; padding: 8px; background: #f3f4f6; border-radius: 4px;">
          ${state.publicKey}
        </div>
      </div>
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Balance:</div>
        <div style="font-size: 16px; font-weight: 600;">${state.balance.toFixed(4)} SOL</div>
      </div>
      <div style="display: flex; gap: 8px;">

        <button id="init-config-btn" style="flex: 1; padding: 12px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">
          Initialize Config
        </button>
        <button id="disconnect-btn" style="flex: 1; padding: 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">
          Disconnect
        </button>
      </div>
    `;
    
    // Add event listeners
    modalContent.querySelector('#init-config-btn').addEventListener('click', async () => {
      modal.remove();
      try {
        const signature = await this.walletUI.initializeConfig();
        alert(`Transaction successful!\nSignature: ${signature}`);
      } catch (error) {
        alert(`Transaction failed: ${error.message}`);
      }
    });

    

    modalContent.querySelector('#disconnect-btn').addEventListener('click', () => {
      modal.remove();
      this.walletUI.disconnect();
    });

    
    modal.appendChild(modalContent);
    

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
  }

  // Create status display
  createStatusDisplay(containerId) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container ${containerId} not found`);
    
    const statusDiv = document.createElement('div');

    statusDiv.id = 'wallet-status';
    statusDiv.style.cssText = `
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
    `;
    
    const updateStatus = () => {
      const state = this.walletUI.getState();
      statusDiv.innerHTML = `
        <div><strong>Status:</strong> ${state.connected ? 'Connected' : 'Disconnected'}</div>
        ${state.wallet ? `<div><strong>Wallet:</strong> ${state.wallet.name}</div>` : ''}
        ${state.publicKey ? `<div><strong>Address:</strong> ${state.publicKey.slice(0, 8)}...${state.publicKey.slice(-8)}</div>` : ''}

        <div><strong>Balance:</strong> ${state.balance.toFixed(4)} SOL</div>
      `;
    };
    
    this.walletUI.on('stateChange', updateStatus);

    updateStatus();
    
    container.appendChild(statusDiv);
    this.elements.set('status', statusDiv);
    
    return statusDiv;
  }
}

// Export for use
export { WalletUI, WalletUIComponents };


// Usage example
export function initWalletUI(options = {}) {
  const walletUI = new WalletUI(options);
  const components = new WalletUIComponents(walletUI);

  
  // Setup event logging
  walletUI.on('connect', (data) => {
    console.log('✅ Wallet connected:', data);
  });
  
  walletUI.on('disconnect', () => {
    console.log('❌ Wallet disconnected');
  });
  
  walletUI.on('error', (error) => {
    console.error('🚨 Wallet error:', error);
  });

  
  walletUI.on('transactionSent', (data) => {
    console.log('📤 Transaction sent:', data.signature);
  });
  
  return { walletUI, components };
}
