require("@nomiclabs/hardhat-waffle");
const fs = require('fs')
const privateKey = fs.readFileSync(".secret").toString().trim() || "3a21f8ffa0a24c51b1bdc2885e26b210";
const projectId = fs.readFileSync(".infuraid").toString().trim() || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      //url: `https://polygon-mumbai.infura.io/v3/3a21f8ffa0a24c51b1bdc2885e26b210`
      //url: `https://polygon-mumbai.infura.io/v3/${projectId}`,
      url: `https://rpc-mumbai.maticvigil.com`,
      accounts: [privateKey]
    },
    mainnet: {
      //url: `https://polygon-mumbai.infura.io/v3/${projectId}`,
      url: `https://rpc-mainnet.maticvigil.com`, 
      accounts: [privateKey]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
