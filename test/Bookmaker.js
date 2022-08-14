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
    win = ethers.utils.parseEther("2.25") 
    draw = ethers.utils.parseEther("3.4")
    lose = ethers.utils.parseEther("3.2")

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


  // async function deployOneYearLockFixture() {
  //   const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  //   const ONE_GWEI = 1_000_000_000;

  //   const lockedAmount = ONE_GWEI;
  //   const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

  //   // Contracts are deployed using the first signer/account by default
  //   const [owner, otherAccount] = await ethers.getSigners();

  //   const Lock = await ethers.getContractFactory("Lock");
  //   const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  //   return { lock, unlockTime, lockedAmount, owner, otherAccount };
  // }

  // describe("Deployment", function () {
  //   it("Should set the right unlockTime", async function () {
  //     const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);

  //     expect(await lock.unlockTime()).to.equal(unlockTime);
  //   });

  //   it("Should set the right owner", async function () {
  //     const { lock, owner } = await loadFixture(deployOneYearLockFixture);

  //     expect(await lock.owner()).to.equal(owner.address);
  //   });

  //   it("Should receive and store the funds to lock", async function () {
  //     const { lock, lockedAmount } = await loadFixture(
  //       deployOneYearLockFixture
  //     );

  //     expect(await ethers.provider.getBalance(lock.address)).to.equal(
  //       lockedAmount
  //     );
  //   });

  //   it("Should fail if the unlockTime is not in the future", async function () {
  //     // We don't use the fixture here because we want a different deployment
  //     const latestTime = await time.latest();
  //     const Lock = await ethers.getContractFactory("Lock");
  //     await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
  //       "Unlock time should be in the future"
  //     );
  //   });
  // });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
  //   });
  // });
});
