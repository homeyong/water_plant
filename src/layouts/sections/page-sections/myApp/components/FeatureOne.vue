<script setup>
import ChatBox from "./chatbox.vue";
import { WalletProvider, useWallet } from '@solana/wallet-adapter-vue';
import { computed, ref } from 'vue';
import { Buffer } from 'buffer'; // Import the buffer package

// Import the necessary functions and libraries
import { Connection, clusterApiUrl, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Ensure Buffer is available globally in the browser environment
window.Buffer = Buffer;
// Reactive variables to hold wallet state and address
const walletConnected = ref(false);
const walletAddress = ref(null);
const tokens = ref([]);
const customRpcUrl = 'https://testnet.dev2.eclipsenetwork.xyz';
const connection = new Connection(customRpcUrl);
const balance = ref(0);
var publicKey = ref(null);

// Function to connect the wallet
const connectWallet = async () => {
  if (window.backpack) {
    try {
      const response = await window.backpack.connect();
      walletConnected.value = true;
      walletAddress.value = response.publicKey.toString();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  } else {
    alert('Phantom Wallet not installed');
  }
};

// Function to disconnect the wallet
const disconnectWallet = async () => {
  if (window.backpack && walletConnected.value) {
    try {
      await window.backpack.disconnect();
      walletConnected.value = false;
      walletAddress.value = null;
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  }
};

// Function to send a transaction
const sendTransaction = async () => {
  if (window.backpack && walletConnected.value) {
    publicKey = walletAddress.value;
    const publicKeyBase58 = new PublicKey(publicKey);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKeyBase58,
        toPubkey: 'DXra5MvE7yY8vmSv2dKMgNw5dvwf6mPJS9B3y1yTfMSD', // Replace with the recipient's public key
        lamports: 1, // 1 SOL = 1,000,000 lamports
      })
    );

    try {
      const signature = await window.backpack.signAndSendTransaction(transaction);
      await connection.confirmTransaction(signature);
      console.log('Transaction successful:', signature);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  }
};

const getBalance = async () => {
  if (window.backpack && walletConnected.value) {
    try {
      publicKey = walletAddress.value
      // Assuming you have a PublicKey instance
      const publicKeyBase58 = new PublicKey(publicKey);

      const lamports = await connection.getBalance(publicKeyBase58);
      balance.value = lamports / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  }
};


const callContractFunction = async () => {
  if (window.backpack && walletConnected.value) {
    
    const programId = new PublicKey('YourProgramIdHere'); // Replace with your program's public key
    const fromPublicKey = new PublicKey(walletAddress.value);

    // Create the instruction data buffer. This should be specific to the contract's expected data.
    // For example, if the contract expects an instruction code followed by some arguments:
    const instructionData = Buffer.from([0]); // Replace with the actual instruction data needed

    // Define the accounts that the contract will interact with (these should be specific to your contract)
    const instructionAccounts = [
      {
        pubkey: fromPublicKey,
        isSigner: true,
        isWritable: true,
      },
      // Add other accounts as required by your contract
    ];

    // Create the transaction instruction
    const instruction = new TransactionInstruction({
      keys: instructionAccounts,
      programId,
      data: instructionData,
    });

    // Create and send the transaction
    const transaction = new Transaction().add(instruction);

    try {
      const signature = await window.solana.signAndSendTransaction(transaction);
      await connection.confirmTransaction(signature);
      console.log('Contract function called successfully:', signature);
    } catch (error) {
      console.error('Failed to call contract function:', error);
    }
  }
};

const getTokens = async () => {
  if (walletConnected.value) {
    try {
      const publicKey = new PublicKey(walletAddress.value);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      });

      tokens.value = tokenAccounts.value.map(tokenAccountInfo => {
        const accountData = tokenAccountInfo.account.data.parsed.info;
        return {
          mint: accountData.mint,
          amount: accountData.tokenAmount.uiAmountString,
        };
      });
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    }
  }
};

</script>

<template>

  <section class="py-9">
    <div class="container">
      <div class="row justify-content-center">
        <!-- Connect Button -->
        <div class="col-md-12 text-center mb-4">
          <button class="btn btn-success" @click="connectWallet" v-if="!walletConnected">
            {{ connected ? "Connected to Backpack Wallet" : "Connect" }}
          </button>
        </div>
        <button class="btn btn-warning" @click="disconnectWallet" v-if="walletConnected">Disconnect</button>
        <p v-if="walletConnected">Connected: {{ walletAddress }}</p>
        <button @click="getTokens" v-if="walletConnected">Get My Tokens</button>

        <ul v-if="tokens.length > 0">
          <li v-for="(token, index) in tokens" :key="index">
            {{ token.mint }}: {{ token.amount }}
          </li>
        </ul>
        <h6>{{ balance }}</h6>
      </div>
      <!-- Ensure WalletProvider is wrapping the entire section that uses wallet functionality -->
      <WalletProvider :wallets="wallets">
        <div class="row justify-content-center">
          <!-- Other Buttons -->
          <div class="col-md-4 text-center mb-4" @click="sendTransaction">
            <button class="btn btn-primary">Music</button>
          </div>
          <div class="col-md-4 text-center mb-4" @click="getBalance">
            <button class="btn btn-primary">Water</button>
          </div>
          <div class="col-md-4 text-center mb-4">
            <button class="btn btn-primary">Light</button>
          </div>
        </div>
      </WalletProvider>
      <div class="row justify-content-center mt-5">
        <!-- Embedded YouTube Live Video with Chat -->
        <div class="col-md-8">
          <div class="embed-responsive embed-responsive-16by9">
            <iframe width="100%" height="500" src="https://www.youtube.com/embed/2sjlviZZB94?autoplay=1"
              title="YouTube live stream player" frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen></iframe>
          </div>
        </div>
        <!-- Live Chat -->
        <div class="col-md-4">
          <ChatBox />
        </div>
      </div>
    </div>
  </section>

</template>
