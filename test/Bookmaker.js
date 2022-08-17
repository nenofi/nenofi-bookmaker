const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const { AbiCoder } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("Bookmaker", function () {


  let owner;
  let user1;
  let user2;
  let user3;
  let bridge;
  let exploiter;
  let smpc

  let neIDR;
  let DAI;

  let bridgeSrc;

  let bookmaker;
  const MAX_INT = ethers.constants.MaxUint256;

  let win 
  let draw 
  let lose 

  it("Deploy Mock Tokens (neIDR)", async function () {
    [owner, user1, user2, user3, bridge, exploiter, smpc] = await ethers.getSigners(4);

    const netoken = await ethers.getContractFactory("MockToken");
    neIDR = await netoken.deploy('neIDR', 'neIDR', 18);
    await neIDR.deployed();
  });

  it("mint neIDR to user1, user2, user3", async function () {
    //1jt rupiah
    await neIDR.mint(user1.address, ethers.BigNumber.from("1000000000000000000000000"));
    await neIDR.mint(user2.address, ethers.BigNumber.from("1000000000000000000000000"));
    await neIDR.mint(user3.address, ethers.BigNumber.from("1000000000000000000000000"));

    expect(await neIDR.balanceOf(user1.address)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
    expect(await neIDR.balanceOf(user2.address)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
    expect(await neIDR.balanceOf(user3.address)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));

  });

  it("Deploy Bookmaker", async function () {
    // win = ethers.utils.parseEther("2.25") 
    // draw = ethers.utils.parseEther("3.4")
    // lose = ethers.utils.parseEther("3.2")

    const Bookmaker = await ethers.getContractFactory("BookmakerV01")
    bookmaker = await Bookmaker.deploy(neIDR.address)
    
    await bookmaker.deployed();
  });

  it("User1 make 1 mil bet on winning", async function () {
    await neIDR.connect(user1).approve(bookmaker.address, MAX_INT) ;   
    await bookmaker.connect(user1).bet(neIDR.address, ethers.BigNumber.from("1000000000000000000000000"), 0);

    expect(await neIDR.balanceOf(bookmaker.address)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
    expect(await bookmaker.getUserBet(user1.address, 0)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
  });

  it("User2 make 500k bet on draw", async function () {
    await neIDR.connect(user2).approve(bookmaker.address, MAX_INT) ;   
    await bookmaker.connect(user2).bet(neIDR.address, ethers.BigNumber.from("500000000000000000000000"), 1);

    expect(await neIDR.balanceOf(bookmaker.address)).to.equal(ethers.BigNumber.from("1500000000000000000000000"));
    expect(await bookmaker.getUserBet(user2.address, 1)).to.equal(ethers.BigNumber.from("500000000000000000000000"));
  });

  it("User3 make 500k bet on losing", async function () {
    await neIDR.connect(user3).approve(bookmaker.address, MAX_INT) ;   
    await bookmaker.connect(user3).bet(neIDR.address, ethers.BigNumber.from("500000000000000000000000"), 2);

    expect(await neIDR.balanceOf(bookmaker.address)).to.equal(ethers.BigNumber.from("2000000000000000000000000"));
    expect(await bookmaker.getUserBet(user3.address, 2)).to.equal(ethers.BigNumber.from("500000000000000000000000"));
  });

  it("check pot for winning", async function () {
    expect(await bookmaker.getPotPerResult(0)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
  });

  it("check pot for draw", async function () {
    expect(await bookmaker.getPotPerResult(1)).to.equal(ethers.BigNumber.from("500000000000000000000000"));
  });
  
  it("check pot for losing", async function () {
    expect(await bookmaker.getPotPerResult(2)).to.equal(ethers.BigNumber.from("500000000000000000000000"));
  });

  it("set Winner", async function () {
    await bookmaker.setRunning(false);
    await bookmaker.setWinner(0)
  });
  
  
});
