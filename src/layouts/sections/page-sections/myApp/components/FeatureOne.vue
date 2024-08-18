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

const creatAccount = async () => {
  const programId = new PublicKey('7ZXCB4Vx8yw4ceCYfuZQeZqiy9Qkve4rR4gJtfftRSNj'); // Replace with your program's public key
  const fromPublicKey = new PublicKey(walletAddress.value);
  const accountDataSize = 40;
  const account = new Account();
  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: fromPublicKey,
      newAccountPubkey: account.publicKey,
      lamports: await connection.getMinimumBalanceForRentExemption(accountDataSize),
      space: accountDataSize,
      programId: programId, // Must match the program you're interacting with
    })
  );
  try {
    // const signature = await window.backpack.signAndSendTransaction(transaction);
    // await connection.confirmTransaction(signature);
    // console.log('Contract function called successfully:', signature);

    transaction.feePayer = fromPublicKey;

    const { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;

    // Sign the transaction with the new account's private key
    transaction.partialSign(account);

    // Sign the transaction with the wallet (e.g., Backpack)
    const signedTransaction = await window.backpack.signTransaction(transaction);

    // Send the transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());

    // Confirm the transaction
    await connection.confirmTransaction(signature, 'confirmed');

    console.log('Account created successfully:', account.publicKey.toBase58());
  } catch (error) {
    console.error('Failed to call contract function:', error);
  }
}

const createAccount2 = async () => {
  if (window.backpack && walletConnected.value) {
    const account = new Account(); // Generate a new keypair for the account
    const idl = await fetch('http://localhost:5000/get-idl').then((response) => response.json());
    const programId = new PublicKey('7ZXCB4Vx8yw4ceCYfuZQeZqiy9Qkve4rR4gJtfftRSNj'); // Replace with your program's public key
    const provider = new anchor.AnchorProvider(connection, window.backpack, anchor.AnchorProvider.defaultOptions());
    anchor.setProvider(provider);
    const fromPublicKey = new PublicKey(walletAddress.value);
    // // Derive the PDA using just the public key
    // const [accountPda, _] = await PublicKey.findProgramAddress(
    //   [fromPublicKey.toBase58()],
    //   programId
    // );

    // // Debugging: Log the derived PDA
    // console.log("Derived PDA:", accountPda.toBase58());

    // Check if the account exists
    const accountInfo = await provider.connection.getAccountInfo(fromPublicKey);

    if (accountInfo !== null) {
      console.log("Account exists for the given program ID.");
    } else {
      console.log("Account does not exist.");
      //create it
      const program = new anchor.Program(idl, programId, provider);

      // Define the size of your account
      const accountSize = 8 + 8; // 8 bytes for the discriminator, 8 bytes for the `data` field

      // Create a new keypair for the account
      const myAccount = anchor.web3.Keypair.generate();

      // Get the minimum rent exemption amount for the account
      const lamports = await provider.connection.getMinimumBalanceForRentExemption(accountSize);

      // Create the transaction to create the account
      const tx = new anchor.web3.Transaction().add(
        anchor.web3.SystemProgram.createAccount({
          fromPubkey: provider.wallet.publicKey,
          newAccountPubkey: myAccount.publicKey,
          space: accountSize,
          lamports,
          programId: program.programId,
        })
      );

      // Sign and send the transaction
      await provider.sendAndConfirm(tx, [myAccount]);

      console.log('Account created:', myAccount.publicKey.toString());
    }

  }
};


const callContractFunction = async () => {
  if (window.backpack && walletConnected.value) {

    const programId = new PublicKey('7ZXCB4Vx8yw4ceCYfuZQeZqiy9Qkve4rR4gJtfftRSNj'); // Replace with your program's public key
    const fromPublicKey = new PublicKey(walletAddress.value);

    // Create the instruction data buffer. This should be specific to the contract's expected data.
    // For example, if the contract expects an instruction code followed by some arguments:
    const instructionData = Buffer.from([1]); // Replace with the actual instruction data needed

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
      // const signature = await window.backpack.signAndSendTransaction(transaction);
      // await connection.confirmTransaction(signature);
      // console.log('Contract function called successfully:', signature);

      transaction.feePayer = fromPublicKey;

      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await window.backpack.signTransaction(transaction);

      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature, 'confirmed');
    } catch (error) {
      console.error('Failed to call contract function:', error);
    }
  }
};


const callMoveRightFunction = async () => {
  if (window.backpack && walletConnected.value) {
    const idl = await fetch('http://localhost:5000/get-idl').then((response) => response.json());
    const programId = new PublicKey('7ZXCB4Vx8yw4ceCYfuZQeZqiy9Qkve4rR4gJtfftRSNj'); // Replace with your program's public key
    const fromPublicKey = new PublicKey(walletAddress.value);


    try {
      // Create an Anchor provider using window.backpack
      const provider = new anchor.AnchorProvider(
        connection,
        window.backpack,
        anchor.AnchorProvider.defaultOptions()
      );
      anchor.setProvider(provider);

      // Replace with your program ID
      const program = new anchor.Program(idl, programId, provider);

      // Check if the account exists
      const accountInfo = await provider.connection.getAccountInfo(fromPublicKey);
      // Derive the PDA for the game data account using the same seeds as the program
      const [gameDataAccountPDA, bump] = await PublicKey.findProgramAddress(
        [Buffer.from("level1", "utf8")],
        programId
      );

      const accountInfo2 = await provider.connection.getAccountInfo(gameDataAccountPDA);
      if (accountInfo2 !== null) {
        console.log("GameDataAccount exists with PDA:", gameDataAccountPDA.toBase58());
      } else {
        console.log("GameDataAccount does not exist.");
        // Determine the space needed for the account
        const space = 8 + 1; // Adjust according to the data structure, here 8 bytes for the discriminator + 1 byte for playerPosition
        // Create a new keypair for the account
        const myAccount = anchor.web3.Keypair.generate();

        // Calculate the rent-exempt amount
        const lamports = await provider.connection.getMinimumBalanceForRentExemption(space);

        // Create the transaction to create the account
        const transaction = new Transaction().add(
          SystemProgram.createAccount({
            fromPubkey: provider.wallet.publicKey,
            newAccountPubkey: myAccount.publicKey,
            lamports,
            space,
            programId,
          })
        );

        // Send the transaction
        const txSignature = await provider.sendAndConfirm(transaction, [myAccount]);
        console.log("Transaction signature:", txSignature);

      }

      // Send a transaction to initialize the game data account
      await program.rpc.initialize({
        accounts: {
          newGameDataAccount: gameDataAccountPDA,
          signer: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        }
      });

      console.log("GameDataAccount has been initialized with public key:", gameDataAccountPDA.toString());

      // Call the moveRight function
      const txHash = await program.methods
        .moveLeft()
        .accounts({
          gameDataAccount: gameDataAccountPDA,
        })
        .rpc();

      console.log('Transaction hash:', txHash);
    } catch (error) {
      console.error('Error calling moveRight function:', error);
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
          <div class="col-md-4 text-center mb-4" @click="callMoveRightFunction">
            <button class="btn btn-primary">Light</button>
          </div>
          <div class="col-md-4 text-center mb-4" @click="createAccount2">
            <button class="btn btn-primary">createAccount</button>
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
