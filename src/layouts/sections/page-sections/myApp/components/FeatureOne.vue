<script setup>
import ChatBox from "./chatbox.vue";
// import { WalletProvider, useWallet } from '@solana/wallet-adapter-vue';
// import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { computed, ref } from 'vue';
import WalletModal from './walletmodal.vue';

// Reference to the modal element
const walletModal = ref(null);

// Method to show the modal
function showWalletModal() {
  const modalElement = walletModal.value;
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

// Function to handle the connection when the "Connect" button is clicked
function handleConnect() {
  // Initialize the Backpack wallet adapter
  const wallets = computed(() => [new BackpackWalletAdapter()]);

  // Use the wallet functionality provided by the WalletProvider
  const { wallet, connected, select } = useWallet();
  if (!connected.value) {
    select(wallets.value[0].name); // Select Backpack wallet
    wallet.value.connect().catch((err) => {
      console.error("Failed to connect to Backpack wallet:", err);
    });
  }
}
</script>

<template>
   <WalletModal ref="walletModal" />

  <section class="py-9">
    <div class="container">
      <div class="row justify-content-center">
        <!-- Connect Button -->
        <div class="col-md-12 text-center mb-4">
          <button class="btn btn-success" @click="handleConnect">
            {{ connected ? "Connected to Backpack Wallet" : "Connect" }}
          </button>
          <button class="btn btn-success" @click="showWalletModal">
            {{ connected ? "Connected to Backpack Wallet" : "Connect" }}
          </button>
        </div>
      </div>
      <!-- Ensure WalletProvider is wrapping the entire section that uses wallet functionality -->
      <WalletProvider :wallets="wallets">
        <div class="row justify-content-center">
          <!-- Other Buttons -->
          <div class="col-md-4 text-center mb-4">
            <button class="btn btn-primary">Music</button>
          </div>
          <div class="col-md-4 text-center mb-4">
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
