// Import necessary modules from Hardhat and SwisstronikJS
const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");

// Function to send a shielded transaction using the provided signer, destination, data, and value
const sendShieldedTransaction = async (signer, destination, data, value) => {
  // Get the RPC link from the network configuration
  const rpcLink = hre.network.config.url;

  // Encrypt transaction data
  const [encryptedData] = await encryptDataField(rpcLink, data);

  // Construct and sign transaction with encrypted data
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  // Address of the deployed contract
  const contractAddress = "0x3a5d73f8d87B663ceA217012D25Ee37A4A41A792";

  // Get the signer (your account)
  const [signer] = await hre.ethers.getSigners();

  // Create a contract instance
  const contractFactory = await hre.ethers.getContractFactory("PERC721Sample");
  const contract = contractFactory.attach(contractAddress);

  // Define the function name and parameters for the mint function
  const functionName = "mint";
  const recipient = "0x0C395F91A9E3C185BAA5B864B1CE00538B465C3F"; // Replace with the actual recipient address
  const encodedFunctionData = contract.interface.encodeFunctionData(functionName, [recipient]);

  // Send a shielded transaction to mint a token in the contract
  const mintTokenTx = await sendShieldedTransaction(
    signer,
    contractAddress,
    encodedFunctionData,
    0
  );

  await mintTokenTx.wait();

  // It should return a TransactionReceipt object
  console.log("Transaction Receipt: ", mintTokenTx);
}

// Using async/await pattern to handle errors properly
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
