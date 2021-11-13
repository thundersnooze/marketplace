const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const Showcase = await hre.ethers.getContractFactory("Showcase");
  const showcase = await Showcase.deploy();
  await showcase.deployed();
  console.log("showcase deployed to:", showcase.address);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(showcase.address);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
