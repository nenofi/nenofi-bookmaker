// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
require('dotenv').config();

const {ethers} = require("hardhat");

async function main() {
  
  // await lock.deployed();
  const [deployer] = await ethers.getSigners();


  const NEIDR_ADDRESS = "0x5d6771aF6066619e42E364E734Cd2F5cCbBF8211";

  const Bookmaker = await ethers.getContractFactory("BookmakerV01");
  const bookmaker = await Bookmaker.deploy(NEIDR_ADDRESS, 1662305400);

  console.log("bookmaker deployed to: " + bookmaker.address)


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
