<!-- WalletModal.vue -->
<template>
    <div>
      <Dialog open="true" onClose="closeModal">
        <DialogTitle>Connect a wallet on Solana to continue</DialogTitle>
        <DialogContent>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            @click="handleConnect('Phantom')"
          >
            Phantom
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            @click="handleConnect('Backpack')"
          >
            Backpack
          </Button>
          <!-- Add more wallets as needed -->
        </DialogContent>
        <DialogActions>
          <Button onClick="closeModal" color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  // import { useWallet } from '@solana/wallet-adapter-vue';
  // import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
  
  const walletModalOpen = ref(true); // Controls whether the modal is open or not
  
  // Wallet adapters
  const wallets = [
    // new PhantomWalletAdapter()
  ];
  
  // Function to handle the connection
  function handleConnect(walletName) {
    const { select } = useWallet();
  
    // Select and connect the wallet
    const wallet = wallets.find(w => w.name === walletName);
    if (wallet) {
      select(wallet.name);
      wallet.connect().catch(err => {
        console.error(`Failed to connect to ${walletName}:`, err);
      });
    }
  
    // Close the modal after connecting
    closeModal();
  }
  
  // Method to close the modal
  function closeModal() {
    walletModalOpen.value = false;
  }
  </script>
  