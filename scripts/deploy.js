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
const bookmakerAbi = require("./abi/BookmakerV01.json");



async function main() {
  
  const [deployer] = await ethers.getSigners();
  const NEIDR_ADDRESS = "0x5d6771aF6066619e42E364E734Cd2F5cCbBF8211";

  let gamestarts = Math.floor(new Date('October 16, 2022 20:00:00 GMT+7').getTime() / 1000)
  console.log(gamestarts)


  // const Bookmaker = await ethers.getContractFactory("BookmakerV01");
  // var bookmaker = await Bookmaker.deploy(NEIDR_ADDRESS, gamestarts, "ManUtd-Newcastle");
  // tx1.wait()
  // console.log("bookmaker deployed to: " + bookmaker.address)


  const provider = new ethers.providers.Web3Provider(network.provider);
  const managerWallet = new ethers.Wallet(process.env.MANAGER_KEY)
  const managerAccount = managerWallet.connect(provider);
  console.log(managerAccount.address)
  
  const neIDR = new ethers.Contract(NEIDR_ADDRESS, neIDRabi.abi, managerAccount)
  const bookmaker = new ethers.Contract('0x177f0dD8D4a605288a2570f4cdf83dEF23a4bcD3', bookmakerAbi.abi, managerAccount)
  await neIDR.connect(managerAccount).approve(bookmaker.address, ethers.constants.MaxUint256);
  // console.log(await neIDR.balanceOf(managerAccount.address))
  var decimals = "000000000000000000"

  var homeOdds = 500000/2.05
  var home = homeOdds.toFixed(0).toString()+decimals
  var drawOdds = 500000/3.94
  var draw = drawOdds.toFixed(0).toString()+decimals
  var awayOdds = 500000/3.87
  var away = awayOdds.toFixed(0).toString()+decimals


  console.log(home)
  console.log(draw)
  console.log(away)
  tx3 = await bookmaker.connect(managerAccount).batchBet([ethers.BigNumber.from(home),ethers.BigNumber.from(draw),ethers.BigNumber.from(away)], {gasLimit: 500000, nonce: 44 })
  tx3.wait()





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
