// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {ethers} = require("hardhat");

async function main() {
  // const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  // const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  // const lockedAmount = hre.ethers.utils.parseEther("1");

  // const Lock = await hre.ethers.getContractFactory("Lock");
  // const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  // await lock.deployed();

  // console.log("Lock with 1 ETH deployed to:", lock.address);
  let win = ethers.utils.parseEther("2.25")
  let draw = ethers.utils.parseEther("3.4")
  let lose = ethers.utils.parseEther("3.2")

  const Bookmaker = await ethers.getContractFactory("Bookmaker");
  const bookmaker = await Bookmaker.deploy('0x8f288eF51AaA75230beB58F7C02cB3E212d7C2b9',win, draw,lose );
  await bookmaker.deployed()

  console.log("bookmaker is deployed at: "+ bookmaker.address)
  console.log(await bookmaker.oddsDraw())




}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
