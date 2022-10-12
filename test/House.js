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

  
describe("House Bet Tests", function () {
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
      [owner, user1, user2, user3, house, exploiter, smpc] = await ethers.getSigners(4);
  
      const netoken = await ethers.getContractFactory("MockToken2");
      neIDR = await netoken.deploy('neIDR', 'neIDR', 18);
      await neIDR.deployed();
    });
  
    it("mint neIDR to user1, user2, user3", async function () {
      //1jt rupiah
      await neIDR.mint(user1.address, ethers.BigNumber.from("1000000000000000000000000"));
      await neIDR.mint(user2.address, ethers.BigNumber.from("1000000000000000000000000"));
      await neIDR.mint(user3.address, ethers.BigNumber.from("1000000000000000000000000"));
      await neIDR.mint(house.address, ethers.BigNumber.from("1000000000000000000000000"));
  
      expect(await neIDR.balanceOf(user1.address)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
      expect(await neIDR.balanceOf(user2.address)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
      expect(await neIDR.balanceOf(user3.address)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
      expect(await neIDR.balanceOf(house.address)).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
  
    });
  
    it("Deploy BookmakerV01", async function () {

      const Bookmaker = await ethers.getContractFactory("BookmakerV01")
      bookmaker = await Bookmaker.deploy(neIDR.address, 1782305400, "Arsenal-Tottenham")
      expect(await bookmaker.eventName()).to.be.equal("Arsenal-Tottenham")
      await bookmaker.deployed();
    });


    it("House batchBet", async function () {
        await neIDR.connect(house).approve(bookmaker.address, MAX_INT);  
        let bets = [ethers.BigNumber.from("200000000000000000000000"), ethers.BigNumber.from("100000000000000000000000"), ethers.BigNumber.from("120000000000000000000000")]
        await bookmaker.connect(house).batchBet(bets);
        expect(await bookmaker.userBet(house.address, 0)).to.equal(ethers.BigNumber.from("200000000000000000000000"))
        expect(await bookmaker.userBet(house.address, 1)).to.equal(ethers.BigNumber.from("100000000000000000000000"))
        expect(await bookmaker.userBet(house.address, 2)).to.equal(ethers.BigNumber.from("120000000000000000000000"))
        expect((await bookmaker.totalPot())).to.equal(ethers.BigNumber.from("420000000000000000000000"))
        expect(await neIDR.balanceOf(bookmaker.address)).to.equal(ethers.BigNumber.from("420000000000000000000000"));
        expect((await bookmaker.potPerResult(0))).to.equal(ethers.BigNumber.from("200000000000000000000000"))
        expect((await bookmaker.potPerResult(1))).to.equal(ethers.BigNumber.from("100000000000000000000000"))
        expect((await bookmaker.potPerResult(2))).to.equal(ethers.BigNumber.from("120000000000000000000000"))
    });
  
    it("User1 make 50k bet on home with permit", async function () {
        const deadline = ethers.constants.MaxUint256
        const { v, r, s } = await getPermitSignature(
            user1,
            neIDR,
            bookmaker.address,
            ethers.BigNumber.from("50000000000000000000000"),
            deadline
        )
        await bookmaker.connect(user1).betWithPermit(ethers.BigNumber.from("50000000000000000000000"), deadline,0, v, r, s)

        expect(await bookmaker.userBet(user1.address, 0)).to.equal(ethers.BigNumber.from("50000000000000000000000"));
    });

    it("User2 make 10k bet on draw", async function () {
        await neIDR.connect(user2).approve(bookmaker.address, MAX_INT) ;   
        await bookmaker.connect(user2).bet(ethers.BigNumber.from("10000000000000000000000"), 1);

        expect(await bookmaker.userBet(user2.address, 1)).to.equal(ethers.BigNumber.from("10000000000000000000000"));
    });

    it("User3 make 15k bet on away", async function () {
        await neIDR.connect(user3).approve(bookmaker.address, MAX_INT) ;   
        await bookmaker.connect(user3).bet(ethers.BigNumber.from("15000000000000000000000"), 2);

        expect(await bookmaker.userBet(user3.address, 2)).to.equal(ethers.BigNumber.from("15000000000000000000000"));
    });

    it("check pot for home", async function () {
        expect(await bookmaker.potPerResult(0)).to.equal(ethers.BigNumber.from("250000000000000000000000"));
    });

    it("check pot for draw", async function () {
        expect(await bookmaker.potPerResult(1)).to.equal(ethers.BigNumber.from("110000000000000000000000"));
    });

    it("check pot for away", async function () {
        expect(await bookmaker.potPerResult(2)).to.equal(ethers.BigNumber.from("135000000000000000000000"));
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
        await bookmaker.setWinner(2)
    });

    it("check Bookmaker fee Winner", async function () {
        expect(await bookmaker.fee()).to.be.equal(ethers.BigNumber.from("18000000000000000000000"));
        // console.log(await bookmaker.fee())
    });

    it("claim Winnings", async function () {
        await expect(bookmaker.connect(user1).claimWinnings()).to.be.reverted;
        await expect(bookmaker.connect(user2).claimWinnings()).to.be.reverted;
        await bookmaker.connect(user3).claimWinnings();
        await bookmaker.connect(house).claimWinnings();
        expect(await neIDR.balanceOf(user3.address)).to.be.above(ethers.BigNumber.from("1000000000000000000000000"))
        expect(await neIDR.balanceOf(house.address)).to.be.above(ethers.BigNumber.from("1000000000000000000000000"))
    });

    it("claim fee", async function () {
        await bookmaker.claimFee();
        expect(await neIDR.balanceOf(owner.address)).to.be.above(ethers.BigNumber.from("0"))

    });

})
