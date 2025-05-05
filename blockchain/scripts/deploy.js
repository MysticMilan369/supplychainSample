const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const supplyChainContract = await ethers.deployContract("SupplyChain");
  const contract_address = await supplyChainContract.getAddress();
  console.log("Contract address:", contract_address);
  saveFrontendFiles(contract_address);
}

function saveFrontendFiles(contract_address) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "..", "frontend", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ SupplyChain: contract_address }, undefined, 2)
  );

  const SupplyChainArtifact = artifacts.readArtifactSync("SupplyChain");

  fs.writeFileSync(
    path.join(contractsDir, "SupplyChain.json"),
    JSON.stringify(SupplyChainArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
