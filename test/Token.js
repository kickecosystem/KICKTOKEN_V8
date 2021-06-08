const { ethers } = require("hardhat");
const { expect } = require("chai");


describe("Token contract", function () {

  let Token;
  let kickToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("KickToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    kickToken = await Token.deploy("KickV8", "KICK", 9, 1.5 * 10**9);
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {

    it("Should set the right owner roles", async function () {
      // const DEFAULT_ADMIN_ROLE = ethers.utils.Bytes32("0x0");
      // expect(await kickToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
      const OWNER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("OWNER_ROLE"));
      expect(await kickToken.hasRole(OWNER_ROLE, owner.address)).to.equal(true);
      const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
      expect(await kickToken.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
      const UNPAUSED_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UNPAUSED_ROLE"));
      expect(await kickToken.hasRole(UNPAUSED_ROLE, owner.address)).to.equal(true);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await kickToken.balanceOf(owner.address);
      expect(await kickToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      await kickToken.transfer(addr1.address, 50);
      const addr1Balance = await kickToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      await kickToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await kickToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);

      await expect(
        kickToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.reverted;

      expect(await kickToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);

      await kickToken.transfer(addr1.address, 100);

      await kickToken.transfer(addr2.address, 50);

      const finalOwnerBalance = await kickToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

      const addr1Balance = await kickToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await kickToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});