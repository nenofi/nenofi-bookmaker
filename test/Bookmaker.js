const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const { AbiCoder } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

async function getPermitSignature(signer, token, spender, value, deadline) {
  const [nonce, name, version, chainId] = await Promise.all([
    token.nonces(signer.address),
    token.name(),
    "1",
    signer.getChainId(),
  ])

  return ethers.utils.splitSignature(
    await signer._signTypedData(
      {
        name,
        version,
        chainId,
        verifyingContract: token.address,
      },
      {
        Permit: [
          {
            name: "owner",
            type: "address",
          },
          {
            name: "spender",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
          },
        ],
      },
      {
        owner: signer.address,
        spender,
        value,
        nonce,
        deadline,
      }
    )
  )
}

describe("BookmakerV01 Tests", function () {


  let owner;
  let user1;
  let user2;
  let user3;
  let user4;
  let exploiter;
  let smpc
  let signer;
  let neIDR;
  let DAI;

  let bridgeSrc;

  let bookmaker;
  const MAX_INT = ethers.constants.MaxUint256;

  let win 
  let draw 
  let lose 

  it("Deploy Mock Tokens (neIDR)", async function () {
    [owner, user1, user2, user3, user4, exploiter, smpc] = await ethers.getSigners(4);

    const netoken = await ethers.getContractFactory("MockToken2");
    neIDR = await netoken.deploy('neIDR', 'neIDR', 18);
    await neIDR.deployed();
  });

  it("mint neIDR to user1, user2, user3", async function () {
    //1jt rupiah
    await neIDR.mint(user1.address, ethers.BigNumber.from("1000000000000000000000000"));
    await neIDR.mint(user2.address, ethers.BigNumber.from("1000000000000000000000000"));
    await neIDR.mint(user3.address, ethers.BigNumber.from("1000000000000000000000000"));
    await neIDR.mint(user4.address, ethers.BigNumber.from("1000000000000000000000000"));

    expect(await neIDR.balanceOf(user1.address)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
    expect(await neIDR.balanceOf(user2.address)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
    expect(await neIDR.balanceOf(user3.address)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
    expect(await neIDR.balanceOf(user4.address)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));

  });

  it("Deploy BookmakerV01", async function () {
    // win = ethers.utils.parseEther("2.25") 
    // draw = ethers.utils.parseEther("3.4")
    // lose = ethers.utils.parseEther("3.2")

    const Bookmaker = await ethers.getContractFactory("BookmakerV01")
    bookmaker = await Bookmaker.deploy(neIDR.address, 1772305400, "Arsenal-Tottenham")
    expect(await bookmaker.eventName()).to.be.equal("Arsenal-Tottenham")

    // bookmaker = await Bookmaker.deploy(neIDR.address, 1661709562) //tests will fail

    
    await bookmaker.deployed();
  });

  it("User1 make 1 mil bet on winning", async function () {
    // await neIDR.connect(user1).approve(bookmaker.address, MAX_INT) ;   
    // await bookmaker.connect(user1).bet(ethers.BigNumber.from("1000000000000000000000000"), 0);
    const deadline = ethers.constants.MaxUint256
    // console.log(neIDR)
    const { v, r, s } = await getPermitSignature(
      user1,
      neIDR,
      bookmaker.address,
      ethers.BigNumber.from("1000000000000000000000000"),
      deadline
    )
    await bookmaker.connect(user1).betWithPermit(ethers.BigNumber.from("1000000000000000000000000"), deadline,0, v, r, s)

    expect(await neIDR.balanceOf(bookmaker.address)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
    expect(await bookmaker.userBet(user1.address, 0)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
  });

  it("User2 make 500k bet on draw", async function () {
    await neIDR.connect(user2).approve(bookmaker.address, MAX_INT) ;   
    await bookmaker.connect(user2).bet(ethers.BigNumber.from("500000000000000000000000"), 1);

    expect(await neIDR.balanceOf(bookmaker.address)).to.equal(ethers.BigNumber.from("1500000000000000000000000"));
    expect(await bookmaker.userBet(user2.address, 1)).to.equal(ethers.BigNumber.from("500000000000000000000000"));
  });

  it("User3 make 500k bet on losing", async function () {
    await neIDR.connect(user3).approve(bookmaker.address, MAX_INT) ;   
    await bookmaker.connect(user3).bet(ethers.BigNumber.from("500000000000000000000000"), 2);

    expect(await neIDR.balanceOf(bookmaker.address)).to.equal(ethers.BigNumber.from("2000000000000000000000000"));
    expect(await bookmaker.userBet(user3.address, 2)).to.equal(ethers.BigNumber.from("500000000000000000000000"));
  });

  it("User4 make 500k bet on winning", async function () {
    await neIDR.connect(user4).approve(bookmaker.address, MAX_INT) ;   
    await bookmaker.connect(user4).bet(ethers.BigNumber.from("500000000000000000000000"), 0);

    // expect(await neIDR.balanceOf(bookmaker.address)).to.equal(ethers.BigNumber.from("2500000000000000000000000"));
    expect(await bookmaker.userBet(user4.address, 0)).to.equal(ethers.BigNumber.from("500000000000000000000000"));
  });


  it("check pot for winning", async function () {
    expect(await bookmaker.potPerResult(0)).to.equal(ethers.BigNumber.from("1500000000000000000000000"));
  });

  it("check pot for draw", async function () {
    expect(await bookmaker.potPerResult(1)).to.equal(ethers.BigNumber.from("500000000000000000000000"));
  });
  
  it("check pot for losing", async function () {
    expect(await bookmaker.potPerResult(2)).to.equal(ethers.BigNumber.from("500000000000000000000000"));
  });

  it("set Winner", async function () {
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    // console.log(timestampBefore)
    await ethers.provider.send("evm_mine", [1782305400]); //fast forward
    const blockNumAfter = await ethers.provider.getBlockNumber();
    const blockAfter = await ethers.provider.getBlock(blockNumAfter);
    const timestampAfter = blockAfter.timestamp;
    // console.log(timestampAfter)

    await bookmaker.setClaimable(true);
    await bookmaker.setWinner(0)
  });

  it("check Bookmaker fee Winner", async function () {
    expect(await bookmaker.fee()).to.be.equal(ethers.BigNumber.from("50000000000000000000000"));
    // console.log(await bookmaker.fee())
  });

  it("claim Winnings", async function () {
    // console.log(await neIDR.balanceOf(user2.address));
    // await bookmaker.connect(user2).claimWinnings();
    // console.log(await neIDR.balanceOf(user2.address));

    await bookmaker.connect(user1).claimWinnings();
    expect(await neIDR.balanceOf(user1.address)).to.be.equal(ethers.BigNumber.from("1633333333333333333333333"))
    // console.log(await neIDR.balanceOf(user1.address));
    await expect(bookmaker.connect(user2).claimWinnings()).to.be.reverted;
    await expect(bookmaker.connect(user3).claimWinnings()).to.be.reverted;
    await bookmaker.connect(user4).claimWinnings();
    // console.log(await neIDR.balanceOf(user4.address))
    expect(await neIDR.balanceOf(user4.address)).to.be.equal(ethers.BigNumber.from("1316666666666666666666666"))
    await bookmaker.claimFee();
    await bookmaker.emergencyWithdraw(neIDR.address,await neIDR.balanceOf(bookmaker.address));
    // console.log(await neIDR.balanceOf(bookmaker.address));

  });

  
  // it("reset state contract", async function () {
  //   await bookmaker.newGame("Man Utd-Man City", 1792305400)
  //   expect(await bookmaker.eventName()).to.be.equal("Man Utd-Man City")
  // });


  // it("User1 make 1 mil bet on winning", async function () {
  //   await neIDR.connect(user1).approve(bookmaker.address, MAX_INT) ;   
  //   await bookmaker.connect(user1).bet(neIDR.address, ethers.BigNumber.from("1000000000000000000000000"), 0);

  //   expect(await neIDR.balanceOf(bookmaker.address)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
  //   expect(await bookmaker.getUserBet(user1.address, 0)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
  // });

  // it("User2 make 500k bet on draw", async function () {
  //   await neIDR.connect(user2).approve(bookmaker.address, MAX_INT) ;   
  //   await bookmaker.connect(user2).bet(neIDR.address, ethers.BigNumber.from("500000000000000000000000"), 1);

  //   expect(await neIDR.balanceOf(bookmaker.address)).to.equal(ethers.BigNumber.from("1500000000000000000000000"));
  //   expect(await bookmaker.getUserBet(user2.address, 1)).to.equal(ethers.BigNumber.from("500000000000000000000000"));
  // });

  // it("User3 make 500k bet on losing", async function () {
  //   await neIDR.connect(user3).approve(bookmaker.address, MAX_INT) ;   
  //   await bookmaker.connect(user3).bet(neIDR.address, ethers.BigNumber.from("500000000000000000000000"), 2);

  //   expect(await neIDR.balanceOf(bookmaker.address)).to.equal(ethers.BigNumber.from("2000000000000000000000000"));
  //   expect(await bookmaker.getUserBet(user3.address, 2)).to.equal(ethers.BigNumber.from("500000000000000000000000"));
  // });

  // it("User4 make 500k bet on winning", async function () {
  //   await neIDR.connect(user4).approve(bookmaker.address, MAX_INT) ;   
  //   await bookmaker.connect(user4).bet(neIDR.address, ethers.BigNumber.from("500000000000000000000000"), 0);

  //   // expect(await neIDR.balanceOf(bookmaker.address)).to.equal(ethers.BigNumber.from("2500000000000000000000000"));
  //   expect(await bookmaker.getUserBet(user4.address, 0)).to.equal(ethers.BigNumber.from("500000000000000000000000"));
  // });


  // it("check pot for winning", async function () {
  //   expect(await bookmaker.getPotPerResult(0)).to.equal(ethers.BigNumber.from("1500000000000000000000000"));
  // });

  // it("check pot for draw", async function () {
  //   expect(await bookmaker.getPotPerResult(1)).to.equal(ethers.BigNumber.from("500000000000000000000000"));
  // });
  
  // it("check pot for losing", async function () {
  //   expect(await bookmaker.getPotPerResult(2)).to.equal(ethers.BigNumber.from("500000000000000000000000"));
  // });

  // it("set Winner", async function () {
  //   const blockNumBefore = await ethers.provider.getBlockNumber();
  //   const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  //   const timestampBefore = blockBefore.timestamp;
  //   // console.log(timestampBefore)
  //   await ethers.provider.send("evm_mine", [1802305400]); //fast forward
  //   const blockNumAfter = await ethers.provider.getBlockNumber();
  //   const blockAfter = await ethers.provider.getBlock(blockNumAfter);
  //   const timestampAfter = blockAfter.timestamp;
  //   // console.log(timestampAfter)

  //   await bookmaker.setClaimable(true);
  //   await bookmaker.setWinner(0)
  // });

});

