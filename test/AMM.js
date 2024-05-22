const { expect } = require('chai');

const {
  loadFixture,
} = require('@nomicfoundation/hardhat-toolbox/network-helpers');

describe('AMM Contract', function () {
  async function deployFixture() {
    // Get the Signers here.
    const [deployer, liquidityProvider] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('Token');
    const token1 = await Token.deploy('Dapp Dot Sol', 'DDS', 1000000);
    const token2 = await Token.deploy('USD Token', 'USD', 1000000);
    await token1.waitForDeployment();
    await token2.waitForDeployment();

    // Send tokens to liquidity provider
    let tx = await token1
      .connect(deployer)
      .transfer(liquidityProvider.address, ethers.parseUnits('100000', 18));
    await tx.wait();

    tx = await token2
      .connect(deployer)
      .transfer(liquidityProvider.address, ethers.parseUnits('100000', 18));
    await tx.wait();

    const AMM = await ethers.getContractFactory('AMM');
    const amm = await AMM.deploy(token1.target, token2.target);
    amm.waitForDeployment();

    // Fixtures can return anything you consider useful for your tests
    return { token1, token2, amm, deployer, liquidityProvider };
  }

  describe('Deployment', function () {
    it('has an address', async function () {
      const { amm } = await loadFixture(deployFixture);
      expect(amm.target).to.not.equal(0x0);
    });

    it('Should return token1', async () => {
      const { amm, token1 } = await loadFixture(deployFixture);
      expect(await amm.token1()).to.equal(token1.target);
    });

    it('Should return token2', async () => {
      const { amm, token2 } = await loadFixture(deployFixture);
      expect(await amm.token2()).to.equal(token2.target);
    });
  });

  describe('Swapping tokens', function () {
    let amount = ethers.parseUnits('100000', 18);
    it('facilitates swaps', async function () {
      const { deployer, liquidityProvider, amm, token1, token2 } =
        await loadFixture(deployFixture);
      let tx = await token1.connect(deployer).approve(amm.target, amount);
      await tx.wait();

      tx = await token2.connect(deployer).approve(amm.target, amount);
      await tx.wait();

      tx = await amm.connect(deployer).addLiquidity(amount, amount);
      await tx.wait();
      expect(await token1.balanceOf(amm.target)).to.equal(amount);
      expect(await token2.balanceOf(amm.target)).to.equal(amount);

      expect(await amm.balance1()).to.equal(amount);
      expect(await amm.balance2()).to.equal(amount);

      expect(await amm.shares(deployer.address)).to.equal(
        ethers.parseUnits('100', 18)
      );

      expect(await amm.totalShares()).to.equal(ethers.parseUnits('100', 18));

      amount = ethers.parseUnits('50000', 18);
      tx = await token1.connect(liquidityProvider).approve(amm.target, amount);
      await tx.wait();

      tx = await token2.connect(liquidityProvider).approve(amm.target, amount);
      await tx.wait();

      // Calculate token2 deposit
      let token2Deposit = await amm.calculateToken2Deposit(amount);
      tx = await amm
        .connect(liquidityProvider)
        .addLiquidity(amount, token2Deposit);
      await tx.wait();

      expect(await amm.shares(liquidityProvider.address)).to.equal(
        ethers.parseUnits('50', 18)
      );

      expect(await amm.shares(deployer.address)).to.equals(
        ethers.parseUnits('100', 18)
      );

      expect(await amm.totalShares()).to.equals(ethers.parseUnits('150', 18));
    });
  });
});
