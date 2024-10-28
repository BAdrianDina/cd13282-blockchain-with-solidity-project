const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Get the contract factory for the CollateralizedLoan contract
  const CollateralizedLoan = await ethers.getContractFactory(
    "CollateralizedLoan"
  );

  // Deploy the contract
  const contract = await CollateralizedLoan.deploy();

  // Wait for the deployment transaction to be mined
  // The contract is now deployed and I can log its address 
  console.log(`CollateralizedLoan deployed successfully`);
  console.log("Deployed contract address:", contract.address);
  console.log(await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("An error occurred during deployment:", error);
    process.exit(1);
  });
