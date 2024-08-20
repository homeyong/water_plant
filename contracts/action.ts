// Client

const destinationAddress = new anchor.web3.PublicKey(
  "24gmPVxnHthq7Hhzip42aDXt9sUCRX9EyxFnRJGEPsCv" // Set this one to the address you want to send the SOL to
); 

let txHash;

try {
  // Interact with the water function
  txHash = await pg.program.methods
    .water()
    .accounts({
      from: pg.wallet.publicKey,
      to: destinationAddress,
      systemProgram: web3.SystemProgram.programId,
    })
    .signers([pg.wallet.keypair])
    .rpc();

  await logTransaction(txHash);
  console.log("Watering the plant with 0.001 ETH...");
} catch (err) {
  console.error("Failed to water the plant:", err);
}

async function logTransaction(txHash) {
  const { blockhash, lastValidBlockHeight } =
    await pg.connection.getLatestBlockhash();

  await pg.connection.confirmTransaction({
    blockhash,
    lastValidBlockHeight,
    signature: txHash,
  });

  console.log( //make sure to change this to the appropriate explorer URL
    `Solana Explorer: https://explorer.solana.com/tx/${txHash}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`
  );
}
