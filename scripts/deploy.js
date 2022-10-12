// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
// import ERC20abi from './abi/ERC20.json';

require('dotenv').config();

const {ethers} = require("hardhat");
const neIDRabi = require("./abi/ERC20.json");


async function main() {
  
  const [deployer] = await ethers.getSigners();
  const NEIDR_ADDRESS = "0x5d6771aF6066619e42E364E734Cd2F5cCbBF8211";

  let gamestarts = Math.floor(new Date('October 12, 2022 02:00:00 GMT+7').getTime() / 1000)



  const Bookmaker = await ethers.getContractFactory("BookmakerV01");
  var bookmaker = await Bookmaker.deploy(NEIDR_ADDRESS, gamestarts, "Milan-Chelsea");

  console.log("bookmaker deployed to: " + bookmaker.address)
  console.log(await bookmaker.eventName())
  console.log(await bookmaker.gameStarts())

  const provider = new ethers.providers.Web3Provider(network.provider);
  const managerWallet = new ethers.Wallet(process.env.MANAGER_KEY)
  const managerAccount = managerWallet.connect(provider);
  // console.log(managerAccount)
  
  const neIDR = new ethers.Contract(NEIDR_ADDRESS, neIDRabi.abi, managerAccount)
  console.log(await neIDR.balanceOf(managerAccount.address))
  console.log("TRASNFERING")
  await neIDR.transfer('0x5d6771aF6066619e42E364E734Cd2F5cCbBF8211', ethers.BigNumber.from("500000000000000000000000"))
  console.log(await neIDR.balanceOf(managerAccount.address))





  // console.log("CHELSEA - ACM")
  // gamestarts = Math.floor(new Date('October 6, 2022 02:00:00 GMT+7').getTime() / 1000)
  // console.log(gamestarts)

  // bookmaker = await Bookmaker.deploy(NEIDR_ADDRESS, gamestarts);
  // console.log("bookmaker deployed to: " + bookmaker.address)
  // console.log(await bookmaker.gameStarts())


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
