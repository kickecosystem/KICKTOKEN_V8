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

    kickToken = await Token.deploy("KickToken", "KICK", 10, 1.5 * 10**9, 50, 50);
  });

  describe("Deployment", function () {

    it("Should set the right owner roles", async function () {
      // TODO
      // const DEFAULT_ADMIN_ROLE = ethers.utils.Bytes32("0x0");
      // expect(await kickToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
      const OWNER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("OWNER_ROLE"));
      expect(await kickToken.hasRole(OWNER_ROLE, owner.address)).to.equal(true);
      const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
      expect(await kickToken.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
      const UNPAUSED_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UNPAUSED_ROLE"));
      expect(await kickToken.hasRole(UNPAUSED_ROLE, owner.address)).to.equal(true);
    });

    it("Should set the right total supply of tokens", async function () {
      var totalSupply = await kickToken.totalSupply()
      var expected = 1.5 * 10**10 * 10**9
      expect(totalSupply.toString()).to.equals(expected.toString());
    });

    it("Should set the right burn percent", async function () {
      var percent = await kickToken.burnPercent();
      expect(percent).to.equal(50);
    });

    it("Should set the right distribution percent", async function () {
      var percent = await kickToken.distributionPercent();
      expect(percent).to.equal(50);
    });

    it("Should set the right decimals", async function () {
      expect(await kickToken.decimals()).to.equal(10);
    });

    it("Should set the right name of token", async function () {
      expect(await kickToken.name()).to.equal("KickToken");
    });

    it("Should set the right ticker of token", async function () {
      expect(await kickToken.symbol()).to.equal("KICK");
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await kickToken.balanceOf(owner.address);
      expect(await kickToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Setters", function () {
    it("Should set burn percent from owner", async function () {
      var percent = await kickToken.burnPercent();
      expect(percent).to.equal(50);

      await kickToken.setBurnPercent(100);

      percent = await kickToken.burnPercent();
      expect(percent).to.equal(100);
    });

    it("Should not set burn percent from not owner", async function () {
      var percent = await kickToken.burnPercent();
      expect(percent).to.equal(50);

      await expect( 
        kickToken.connect(addr1).setBurnPercent(60)
      ).to.be.reverted;

      percent = await kickToken.burnPercent();
      expect(percent).to.equal(50);
    });

    it("Should not set burn percent more than 10%", async function () {
      var percent = await kickToken.burnPercent();
      expect(percent).to.equal(50);

      await expect( 
        kickToken.setBurnPercent(110)
      ).to.be.reverted;

      percent = await kickToken.burnPercent();
      expect(percent).to.equal(50);
    });

    it("Should not set burn percent less than 1%", async function () {
      var percent = await kickToken.burnPercent();
      expect(percent).to.equal(50);

      await expect( 
        kickToken.setBurnPercent(5)
      ).to.be.reverted;

      percent = await kickToken.burnPercent();
      expect(percent).to.equal(50);
    });

    it("Should set distribute percent from owner", async function () {
      var percent = await kickToken.distributionPercent();
      expect(percent).to.equal(50);

      await kickToken.setDistributionPercent(10);

      percent = await kickToken.distributionPercent();
      expect(percent).to.equal(10);
    });

    it("Should not set distribute percent from not owner", async function () {
      var percent = await kickToken.distributionPercent();
      expect(percent).to.equal(50);

      await expect( 
        kickToken.connect(addr1).setDistributionPercent(60)
      ).to.be.reverted;

      percent = await kickToken.distributionPercent();
      expect(percent).to.equal(50);
    });

    it("Should not set distribute percent more than 10%", async function () {
      var percent = await kickToken.distributionPercent();
      expect(percent).to.equal(50);

      await expect( 
        kickToken.setDistributionPercent(110)
      ).to.be.reverted;

      percent = await kickToken.distributionPercent();
      expect(percent).to.equal(50);
    });

    it("Should not set distribute percent less than 1%", async function () {
      var percent = await kickToken.distributionPercent();
      expect(percent).to.equal(50);

      await expect( 
        kickToken.setDistributionPercent(5)
      ).to.be.reverted;

      percent = await kickToken.distributionPercent();
      expect(percent).to.equal(50);
    });
  });

  describe("Transfer", function () {
    it("Should transfer tokens between accounts", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      var initialTotalSupply = await kickToken.totalSupply()

      await kickToken.transfer(addr1.address, 2000);
      
      const addr1Balance = await kickToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(1800);
      const finalOwnerBalance = await kickToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(1901));
      var totalSupply = await kickToken.totalSupply()
      expect(totalSupply).to.equal(initialTotalSupply.sub(100));
    });

    it("Burn/distribute accuracy should be 1000 tokens", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      var initialTotalSupply = await kickToken.totalSupply()

      await kickToken.transfer(addr1.address, 2500);
      
      const addr1Balance = await kickToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(2300);
      const finalOwnerBalance = await kickToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(2401));
      var totalSupply = await kickToken.totalSupply()
      expect(totalSupply).to.equal(initialTotalSupply.sub(100));
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      const initialSenderBalance = await kickToken.balanceOf(addr1.address);

      await expect(
        kickToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.reverted;

      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
      expect(await kickToken.balanceOf(addr1.address)).to.equal(initialSenderBalance);
    });

    it("Should transfer all tokens", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      var initialTotalSupply = await kickToken.totalSupply()

      await kickToken.transfer(addr1.address, 2000);
      
      const addr1Balance = await kickToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(1800);
      const ownerBalance = await kickToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(initialOwnerBalance.sub(1901));
      var totalSupply = await kickToken.totalSupply()
      expect(totalSupply).to.equal(initialTotalSupply.sub(100));

      const initailAddr2Balance = await kickToken.balanceOf(addr2.address);
      expect(initailAddr2Balance).to.equal(0);

      await kickToken.connect(addr1).transferAll(addr2.address);

      const finalAddr1Balance = await kickToken.balanceOf(addr1.address);
      expect(finalAddr1Balance).to.equal(0);
      const finalAddr2Balance = await kickToken.balanceOf(addr2.address);
      expect(finalAddr2Balance).to.equal(1700);
      const finalOwnerBalance = await kickToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(1851));
      var finalSupply = await kickToken.totalSupply()
      expect(finalSupply).to.equal(initialTotalSupply.sub(150));
    });

    it("reflectionFromToken-tokenFromReflection metods should work", async function () {
      const balance = await kickToken.balanceOf(owner.address);
      const reflection = await kickToken.reflectionFromToken(balance,false);
      expect(await kickToken.tokenFromReflection(reflection)).to.equal(balance);

      const reflectionAfterFee = await kickToken.reflectionFromToken(balance,true);
      expect(await kickToken.tokenFromReflection(reflectionAfterFee)).to.equal(balance.div(10).mul(9));
    });

    it("Should grant NO_INCOME_FEE account from owner", async function () {
      expect(await kickToken.isNoIncomeFee(addr1.address)).to.equal(false);

      await kickToken.grantNoIncomeFee(addr1.address);

      expect(await kickToken.isNoIncomeFee(addr1.address)).to.equal(true);
    });

    it("Should fail grant NO_INCOME_FEE account from not owner", async function () {
      expect(await kickToken.isNoIncomeFee(addr1.address)).to.equal(false);

      await expect(kickToken.connect(addr2).grantNoIncomeFee(addr1.address)).to.be.reverted;;

      expect(await kickToken.isNoIncomeFee(addr1.address)).to.equal(false);
    });

    it("Should revoke NO_INCOME_FEE account from owner", async function () {
      expect(await kickToken.isNoIncomeFee(addr1.address)).to.equal(false);

      await kickToken.grantNoIncomeFee(addr1.address);

      expect(await kickToken.isNoIncomeFee(addr1.address)).to.equal(true);

      await kickToken.revokeNoIncomeFee(addr1.address);

      expect(await kickToken.isNoIncomeFee(addr1.address)).to.equal(false);
    });

    it("Should fail revoke NO_INCOME_FEE account from not owner", async function () {
      expect(await kickToken.isNoIncomeFee(addr1.address)).to.equal(false);

      await kickToken.grantNoIncomeFee(addr1.address);

      expect(await kickToken.isNoIncomeFee(addr1.address)).to.equal(true);

      await expect(kickToken.connect(addr2).revokeNoIncomeFee(addr1.address)).to.be.reverted;

      expect(await kickToken.isNoIncomeFee(addr1.address)).to.equal(true);
    });

    it("Should transfer tokens to NO_INCOME_FEE account without fee", async function () {
      await kickToken.grantNoIncomeFee(addr1.address);
      expect(await kickToken.isNoIncomeFee(addr1.address)).to.equal(true);

      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      var initialTotalSupply = await kickToken.totalSupply()

      await kickToken.transfer(addr1.address, 2000);
      
      const addr1Balance = await kickToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(2000);
      const finalOwnerBalance = await kickToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(2000));
      var totalSupply = await kickToken.totalSupply()
      expect(totalSupply).to.equal(initialTotalSupply);
    });

    it("Should fail transfer to NO_INCOME_FEE account if sender doesn’t have enough tokens", 
    async function () {
      await kickToken.grantNoIncomeFee(owner.address);
      expect(await kickToken.isNoIncomeFee(owner.address)).to.equal(true);

      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      const initialSenderBalance = await kickToken.balanceOf(addr1.address);

      await expect(kickToken.connect(addr1).transfer(owner.address, 1)).to.be.reverted;

      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
      expect(await kickToken.balanceOf(addr1.address)).to.equal(initialSenderBalance);
    });

    it("Should multisend from owner account", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      const initialAddr1Balance = await kickToken.balanceOf(addr1.address);
      const initialAddr2Balance = await kickToken.balanceOf(addr2.address);

      await kickToken.multisend([addr1.address, addr2.address], [100,200]);

      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance.sub(300));
      expect(await kickToken.balanceOf(addr1.address)).to.equal(initialAddr1Balance.add(100));
      expect(await kickToken.balanceOf(addr2.address)).to.equal(initialAddr2Balance.add(200));
    });

    it("Should fail multisend from not owner account", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      const initialAddr1Balance = await kickToken.balanceOf(addr1.address);
      const initialAddr2Balance = await kickToken.balanceOf(addr2.address);

      await expect(kickToken.connect(addr1).multisend([addr1.address, addr2.address], [100,200])
        ).to.be.reverted;

      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
      expect(await kickToken.balanceOf(addr1.address)).to.equal(initialAddr1Balance);
      expect(await kickToken.balanceOf(addr2.address)).to.equal(initialAddr2Balance);
    });

    it("Should fail multisend more than 200 recipients", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      const initialAddr1Balance = await kickToken.balanceOf(addr1.address);

      var step;
      var recipients = [addr1.address];
      var values = [100];
      for (step = 0; step < 300; step++) {
        recipients.push(addr1.address);
        values.push(100);
      }

      await expect(kickToken.multisend(recipients, values)
        ).to.be.revertedWith("More than 200 recipients");

      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
      expect(await kickToken.balanceOf(addr1.address)).to.equal(initialAddr1Balance);
    });
  });

  describe("Burn", function () {
    it("Should burn own tokens", async function () {
      const initialBalance = await kickToken.balanceOf(owner.address);
      var initialTotalSupply = await kickToken.totalSupply()

      await kickToken.burn(2000);
      
      const finalBalance = await kickToken.balanceOf(owner.address);
      expect(finalBalance).to.equal(initialBalance.sub(2000));
      var totalSupply = await kickToken.totalSupply()
      expect(totalSupply).to.equal(initialTotalSupply.sub(2000));
    });

    it("Should fail burn if sender doesn’t have enough tokens", async function () {
      const initialBalance = await kickToken.balanceOf(addr1.address);
      var initialTotalSupply = await kickToken.totalSupply()

      await expect(kickToken.connect(addr1).burn(2000)).to.be.reverted;
      
      const finalBalance = await kickToken.balanceOf(addr1.address);
      expect(finalBalance).to.equal(initialBalance);
      var totalSupply = await kickToken.totalSupply()
      expect(totalSupply).to.equal(initialTotalSupply);
    });

    it("Should burnFrom allowed tokens", async function () {
      const initialBalance = await kickToken.balanceOf(owner.address);
      var initialTotalSupply = await kickToken.totalSupply()
      expect(await kickToken.allowance(owner.address, addr1.address)).to.equal(0);

      await kickToken.approve(addr1.address, 2000);

      expect(await kickToken.allowance(owner.address, addr1.address)).to.equal(2000);

      await kickToken.connect(addr1).burnFrom(owner.address, 2000);

      expect(await kickToken.allowance(owner.address, addr1.address)).to.equal(0);
      
      const finalBalance = await kickToken.balanceOf(owner.address);
      expect(finalBalance).to.equal(initialBalance.sub(2000));
      var totalSupply = await kickToken.totalSupply()
      expect(totalSupply).to.equal(initialTotalSupply.sub(2000));
    });

    it("Should fail burnFrom if sender doesn’t have enough allowance", async function () {
      const initialBalance = await kickToken.balanceOf(owner.address);
      var initialTotalSupply = await kickToken.totalSupply()
      expect(await kickToken.allowance(owner.address, addr1.address)).to.equal(0);

      await kickToken.approve(addr1.address, 1000);

      expect(await kickToken.allowance(owner.address, addr1.address)).to.equal(1000);

      await expect(kickToken.connect(addr1).burnFrom(owner.address, 2000)
        ).to.revertedWith("burn amount exceeds allowance");

      expect(await kickToken.allowance(owner.address, addr1.address)).to.equal(1000);
      
      const finalBalance = await kickToken.balanceOf(owner.address);
      expect(finalBalance).to.equal(initialBalance);
      var totalSupply = await kickToken.totalSupply()
      expect(totalSupply).to.equal(initialTotalSupply);
    });

    it("Should burnBatch from owner account", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      const initialAddr1Balance = await kickToken.balanceOf(addr1.address);
      const initialAddr2Balance = await kickToken.balanceOf(addr2.address);

      await kickToken.multisend([addr1.address, addr2.address], [100,200]);

      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance.sub(300));
      expect(await kickToken.balanceOf(addr1.address)).to.equal(initialAddr1Balance.add(100));
      expect(await kickToken.balanceOf(addr2.address)).to.equal(initialAddr2Balance.add(200));
      var initialTotalSupply = await kickToken.totalSupply()

      await kickToken.burnBatch([addr1.address, addr2.address], [100,200]);

      expect(await kickToken.balanceOf(addr1.address)).to.equal(0);
      expect(await kickToken.balanceOf(addr2.address)).to.equal(0);
      expect(await kickToken.totalSupply()).to.equal(initialTotalSupply.sub(300));
    });

    it("Should fail burnBatch from not owner account", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      const initialAddr1Balance = await kickToken.balanceOf(addr1.address);
      const initialAddr2Balance = await kickToken.balanceOf(addr2.address);

      await kickToken.multisend([addr1.address, addr2.address], [100,200]);

      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance.sub(300));
      expect(await kickToken.balanceOf(addr1.address)).to.equal(initialAddr1Balance.add(100));
      expect(await kickToken.balanceOf(addr2.address)).to.equal(initialAddr2Balance.add(200));
      var initialTotalSupply = await kickToken.totalSupply()

      await expect(kickToken.connect(addr1).burnBatch([addr1.address, addr2.address], [100,200])
        ).to.be.reverted;

      expect(await kickToken.balanceOf(addr1.address)).to.equal(100);
      expect(await kickToken.balanceOf(addr2.address)).to.equal(200);
      expect(await kickToken.totalSupply()).to.equal(initialTotalSupply);
    });

    it("Should fail burnBatch more than 200 recipients", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      const initialAddr1Balance = await kickToken.balanceOf(addr1.address);
      const initialAddr2Balance = await kickToken.balanceOf(addr2.address);

      await kickToken.multisend([addr1.address, addr2.address], [100,200]);

      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance.sub(300));
      expect(await kickToken.balanceOf(addr1.address)).to.equal(initialAddr1Balance.add(100));
      expect(await kickToken.balanceOf(addr2.address)).to.equal(initialAddr2Balance.add(200));
      var initialTotalSupply = await kickToken.totalSupply()

      var step;
      var recipients = [addr1.address];
      var values = [100];
      for (step = 0; step < 300; step++) {
        recipients.push(addr1.address);
        values.push(100);
      }

      await expect(kickToken.burnBatch(recipients, values)
        ).to.be.revertedWith("More than 200 accounts");

      expect(await kickToken.balanceOf(addr1.address)).to.equal(100);
      expect(await kickToken.balanceOf(addr2.address)).to.equal(200);
      expect(await kickToken.totalSupply()).to.equal(initialTotalSupply);
    });
  });

  describe("Distribute", function () {
    it("Should distibute own tokens", async function () {
      await kickToken.multisend([addr1.address],[1000]);

      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      expect(await kickToken.balanceOf(addr1.address)).to.equal(1000);

      await kickToken.connect(addr1).distribute(990);
      
      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance.add(989));
      expect(await kickToken.balanceOf(addr1.address)).to.equal(10);
    });

    it("Should fail distribute if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      const initialAddr1Balance = await kickToken.balanceOf(addr1.address);

      await expect(kickToken.connect(addr1).distribute(2000)).to.be.reverted;
      
      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
      expect(await kickToken.balanceOf(addr1.address)).to.equal(initialAddr1Balance);
    });

    it("Should distributeFrom allowed tokens", async function () {
      await kickToken.multisend([addr1.address],[1000]);

      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      expect(await kickToken.balanceOf(addr1.address)).to.equal(1000);
      expect(await kickToken.allowance(addr1.address, owner.address)).to.equal(0);

      await kickToken.connect(addr1).approve(owner.address, 2000);

      expect(await kickToken.allowance(addr1.address, owner.address)).to.equal(2000);

      await kickToken.distributeFrom(addr1.address, 990);

      expect(await kickToken.allowance(addr1.address, owner.address)).to.equal(1010);
      
      expect(await kickToken.balanceOf(addr1.address)).to.equal(10);
      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance.add(989));
    });

    it("Should fail distributeFrom if sender doesn’t have enough allowance", async function () {
      await kickToken.multisend([addr1.address],[1000]);

      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      expect(await kickToken.balanceOf(addr1.address)).to.equal(1000);
      expect(await kickToken.allowance(addr1.address, owner.address)).to.equal(0);

      await kickToken.connect(addr1).approve(owner.address, 500);

      expect(await kickToken.allowance(addr1.address, owner.address)).to.equal(500);

      await expect(kickToken.distributeFrom(addr1.address, 990)
        ).to.be.revertedWith("distribute amount exceeds allowance");

      expect(await kickToken.allowance(addr1.address, owner.address)).to.equal(500);
      
      expect(await kickToken.balanceOf(addr1.address)).to.equal(1000);
      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should distributeBatch from owner account", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      const initialAddr1Balance = await kickToken.balanceOf(addr1.address);
      const initialAddr2Balance = await kickToken.balanceOf(addr2.address);

      await kickToken.multisend([addr1.address, addr2.address], [100,200]);

      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance.sub(300));
      expect(await kickToken.balanceOf(addr1.address)).to.equal(initialAddr1Balance.add(100));
      expect(await kickToken.balanceOf(addr2.address)).to.equal(initialAddr2Balance.add(200));

      await kickToken.distributeBatch([addr1.address, addr2.address], [100,200]);

      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance.sub(1));
      expect(await kickToken.balanceOf(addr1.address)).to.equal(0);
      expect(await kickToken.balanceOf(addr2.address)).to.equal(0);
    });

    it("Should fail distributeBatch from not owner account", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      const initialAddr1Balance = await kickToken.balanceOf(addr1.address);
      const initialAddr2Balance = await kickToken.balanceOf(addr2.address);

      await kickToken.multisend([addr1.address, addr2.address], [100,200]);

      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance.sub(300));
      expect(await kickToken.balanceOf(addr1.address)).to.equal(initialAddr1Balance.add(100));
      expect(await kickToken.balanceOf(addr2.address)).to.equal(initialAddr2Balance.add(200));

      await expect(kickToken.connect(addr1).distributeBatch([addr1.address, addr2.address], [100,200])
        ).to.be.reverted;

      expect(await kickToken.balanceOf(addr1.address)).to.equal(100);
      expect(await kickToken.balanceOf(addr2.address)).to.equal(200);
      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance.sub(300));
    });

    it("Should fail distributeBatch more than 200 recipients", async function () {
      const initialOwnerBalance = await kickToken.balanceOf(owner.address);
      const initialAddr1Balance = await kickToken.balanceOf(addr1.address);
      const initialAddr2Balance = await kickToken.balanceOf(addr2.address);

      await kickToken.multisend([addr1.address, addr2.address], [100,200]);

      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance.sub(300));
      expect(await kickToken.balanceOf(addr1.address)).to.equal(initialAddr1Balance.add(100));
      expect(await kickToken.balanceOf(addr2.address)).to.equal(initialAddr2Balance.add(200));

      var step;
      var recipients = [addr1.address];
      var values = [100];
      for (step = 0; step < 300; step++) {
        recipients.push(addr1.address);
        values.push(100);
      }

      await expect(kickToken.burnBatch(recipients, values)
        ).to.be.revertedWith("More than 200 accounts");

      expect(await kickToken.balanceOf(addr1.address)).to.equal(100);
      expect(await kickToken.balanceOf(addr2.address)).to.equal(200);
      expect(await kickToken.balanceOf(owner.address)).to.equal(initialOwnerBalance.sub(300));
    });
  });

  describe("Denomination", function () {
    it("Should denominate from owner", async function () {
      const initialSupply = await kickToken.totalSupply();
      const initailBalance = await kickToken.balanceOf(owner.address);

      await kickToken.denominate(10);
      
      expect(await kickToken.balanceOf(owner.address)).to.equal(initailBalance.div(10));
      expect(await kickToken.totalSupply()).to.equal(initialSupply.div(10));
    });

    it("Should fail denominate from not owner", async function () {
      const initialSupply = await kickToken.totalSupply();
      const initailBalance = await kickToken.balanceOf(owner.address);

      await expect(kickToken.connect(addr1).denominate(10)).to.be.reverted;
      
      expect(await kickToken.balanceOf(owner.address)).to.equal(initailBalance);
      expect(await kickToken.totalSupply()).to.equal(initialSupply);
    });
  });

  describe("Pause", function () {
    it("Should pause from owner", async function () {
      expect(await kickToken.paused()).to.equal(false);

      await kickToken.pauseTrigger();

      expect(await kickToken.paused()).to.equal(true);

      await kickToken.pauseTrigger();

      expect(await kickToken.paused()).to.equal(false);
    });

    it("Should fail pause from not owner", async function () {
      expect(await kickToken.paused()).to.equal(false);

      await expect(kickToken.connect(addr1).pauseTrigger()).to.be.reverted;

      expect(await kickToken.paused()).to.equal(false);
    });

    it("Should fail transfer when paused", async function () {
      await kickToken.multisend([addr1.address],[1000]);

      const initialBalance = await kickToken.balanceOf(addr1.address);
      var initialTotalSupply = await kickToken.totalSupply()

      expect(await kickToken.paused()).to.equal(false);
      await kickToken.pauseTrigger();
      expect(await kickToken.paused()).to.equal(true);

      await expect(kickToken.connect(addr1).transfer(addr2.address, 500)
        ).to.be.revertedWith("can't perform an action");
      
      expect(await kickToken.balanceOf(addr1.address)).to.equal(initialBalance);
      expect(await kickToken.totalSupply()).to.equal(initialTotalSupply);
    });

    it("Should transfer from UNPAUSED_ROLE when paused", async function () {
      await kickToken.multisend([addr1.address],[1000]);

      const initialBalance = await kickToken.balanceOf(addr1.address);
      var initialTotalSupply = await kickToken.totalSupply()

      expect(await kickToken.paused()).to.equal(false);
      await kickToken.pauseTrigger();
      expect(await kickToken.paused()).to.equal(true);

      const UNPAUSED_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UNPAUSED_ROLE"));
      expect(await kickToken.hasRole(UNPAUSED_ROLE, addr1.address)).to.equal(false);

      await kickToken.grantRole(UNPAUSED_ROLE, addr1.address);

      expect(await kickToken.hasRole(UNPAUSED_ROLE, addr1.address)).to.equal(true);

      await kickToken.connect(addr1).transfer(addr2.address, 500);
      
      expect(await kickToken.balanceOf(addr1.address)).to.equal(initialBalance.sub(500));
      expect(await kickToken.balanceOf(addr2.address)).to.equal(500);
      expect(await kickToken.totalSupply()).to.equal(initialTotalSupply);
    });
  });

  describe("Stuck funds", function () {
    it("Should transfer stuck funds from owner", async function () {
      tokenERC20 = await Token.deploy("ERC20", "ERC20", 9, 1.5 * 10**9, 10, 10);
      
      expect(await tokenERC20.balanceOf(kickToken.address)).to.equal(0);

      await tokenERC20.transfer(kickToken.address, 100);

      expect(await tokenERC20.balanceOf(kickToken.address)).to.equal(100);
      expect(await tokenERC20.balanceOf(addr1.address)).to.equal(0);

      await kickToken.stuckFundsTransfer(tokenERC20.address, addr1.address, 100)

      expect(await tokenERC20.balanceOf(kickToken.address)).to.equal(0);
      expect(await tokenERC20.balanceOf(addr1.address)).to.equal(100);
    });

    it("Should fail transfer stuck funds from not owner", async function () {
      tokenERC20 = await Token.deploy("ERC20", "ERC20", 9, 1.5 * 10**9, 10, 10);
      
      expect(await tokenERC20.balanceOf(kickToken.address)).to.equal(0);

      await tokenERC20.transfer(kickToken.address, 100);

      expect(await tokenERC20.balanceOf(kickToken.address)).to.equal(100);
      expect(await tokenERC20.balanceOf(addr1.address)).to.equal(0);

      await expect(kickToken.connect(addr1).stuckFundsTransfer(
        tokenERC20.address, addr1.address, 100)).to.be.reverted;

      expect(await tokenERC20.balanceOf(kickToken.address)).to.equal(100);
      expect(await tokenERC20.balanceOf(addr1.address)).to.equal(0);
    });
  });
});