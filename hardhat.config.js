require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.8",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0,
      forking: {
        url: "https://rpc.ankr.com/fantom",
        // url: process.env.STAGING_ALCHEMY_KEY,
        // url: "https://rpc.testnet.fantom.network/",
        // url: "https://bsc-dataseed1.ninicoin.io/",

      },   
    }, 
    ftmTestnet: {
      url: "https://rpc.testnet.fantom.network/",
      accounts: [process.env.PRIVATE_KEY],
    },
    bsc: {
      url: "https://bsc-dataseed1.ninicoin.io/",
      accounts: [process.env.PRIVATE_KEY],
    },
    fantom:{
      url: "https://rpc.ankr.com/fantom",
      accounts: [process.env.PRIVATE_KEY],
    },
    rinkeby: {
      url: process.env.STAGING_ALCHEMY_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.FTMSCAN_KEY,
    // {
      // mainnet: process.env.ETHSCAN_KEY,
      // rinkeby: process.env.ETHSCAN_KEY,
      // fantom: process.env.FTMSCAN_KEY,
      // ftmTestnet: process.env.FTMSCAN_KEY,
      // bsc: process.env.BSCSCAN_KEY,
    // },
  },
};
