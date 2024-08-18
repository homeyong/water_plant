<script setup>
import ChatBox from "./chatbox.vue";
import { WalletProvider, useWallet } from '@solana/wallet-adapter-vue';
import { computed, ref } from 'vue';
import { Buffer } from 'buffer';
import * as anchor from '@project-serum/anchor';


// Import the necessary functions and libraries
import { Connection, clusterApiUrl, Transaction, TransactionInstruction, SystemProgram, PublicKey, LAMPORTS_PER_SOL, Account } from '@solana/web3.js';

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
const contractProgram = 'G4d3prSana24Zq5uGcDRWCJXKgxCYF5b7dqVSSHcnudX';
const destinationAddress = '24gmPVxnHthq7Hhzip42aDXt9sUCRX9EyxFnRJGEPsCv';
var successMessage = ref('');
var successMessageBln = ref(false);

// Function to connect the wallet
const connectWallet = async () => {
  if (window.backpack) {
    try {
      const response = await window.backpack.connect();
      walletConnected.value = true;
      walletAddress.value = response.publicKey.toString();
      getUserId(walletAddress.value);
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


const callFunction = async (action) => {
  if (window.backpack && walletConnected.value) {
    successMessageBln.value = false;
    successMessage.value = '';
    const idl = await fetch('http://207.148.76.50:5000/get-idl').then((response) => response.json());
    const programId = new PublicKey(contractProgram); // Replace with your program's public key
    const fromPublicKey = new PublicKey(walletAddress.value);
    const toPublicKey = new PublicKey(destinationAddress);

    try {
      // Create an Anchor provider using window.backpack
      const provider = new anchor.AnchorProvider(
        connection,
        window.backpack,
        anchor.AnchorProvider.defaultOptions()
      );
      anchor.setProvider(provider);

      // Initialize the program
      const program = new anchor.Program(idl, programId, provider);

      // Determine the method to call based on the action parameter
      let method;
      if (action === 'water') {
        method = program.methods.water();
      } else if (action === 'music') {
        method = program.methods.music();
      } else if (action === 'light') {
        method = program.methods.light();
      } else {
        throw new Error(`Invalid action: ${action}`);
      }

      // Create the transaction
      const instruction = await method
        .accounts({
          from: fromPublicKey,
          to: toPublicKey,
          systemProgram: anchor.web3.SystemProgram.programId
        })
        .instruction();

      // Create a new transaction and add the instruction to it
      const transaction = new anchor.web3.Transaction().add(instruction);

      transaction.feePayer = fromPublicKey;

      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;

      // Partially sign the transaction with the connected wallet
      const signedTransaction = await window.backpack.signTransaction(transaction);

      // Send the transaction with the partial signature
      const txHash = await connection.sendRawTransaction(signedTransaction.serialize());
      successMessageBln.value = true;
      successMessage.value = action + ' successful run: ' + txHash;
      console.log('Transaction hash action '+ action +':', txHash);
    } catch (error) {
      successMessageBln.value = true;
      successMessage.value = action + ' failed run: ' + error;
      console.error('Error calling callFunction function '+ action +':', error);
    }
  }
};

// Function to generate or retrieve a unique user ID
function getUserId(storedId) {
  localStorage.setItem('chatUserId', storedId);
}

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
        <p class="success-message" v-if="successMessageBln">{{ successMessage }}</p>
      </div>
      <!-- Ensure WalletProvider is wrapping the entire section that uses wallet functionality -->
      <WalletProvider :wallets="wallets">
        <div class="row justify-content-center">
          <!-- Other Buttons -->
          <div class="col-md-4 text-center mb-4" @click="callFunction('water')">
            <button class="btn btn-primary">Water</button>
          </div>
          <div class="col-md-4 text-center mb-4" @click="callFunction('light')">
            <button class="btn btn-primary">Light</button>
          </div>
          <div class="col-md-4 text-center mb-4" @click="callFunction('music')">
            <button class="btn btn-primary">Music</button>
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
<style scoped>
.success-message {
  color: #28a745;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
}
</style>
