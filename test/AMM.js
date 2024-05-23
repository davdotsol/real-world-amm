const { expect } = require('chai');

const {
  loadFixture,
} = require('@nomicfoundation/hardhat-toolbox/network-helpers');

describe('AMM Contract', function () {
  async function deployFixture() {
    // Get the Signers here.
    const [deployer, liquidityProvider, investor1, investor2] =
      await ethers.getSigners();

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

    tx = await token1
      .connect(deployer)
      .transfer(investor1.address, ethers.parseUnits('100000', 18));
    await tx.wait();

    tx = await token2
      .connect(deployer)
      .transfer(investor2.address, ethers.parseUnits('100000', 18));
    await tx.wait();

    const AMM = await ethers.getContractFactory('AMM');
    const amm = await AMM.deploy(token1.target, token2.target);
    await amm.waitForDeployment();

    // Fixtures can return anything you consider useful for your tests
    return {
      token1,
      token2,
      amm,
      deployer,
      liquidityProvider,
      investor1,
      investor2,
    };
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

  describe('Liquidity Management', function () {
    let amount = ethers.parseUnits('100000', 18);
    it('adds liquidity and updates balances and shares', async function () {
      const { deployer, liquidityProvider, amm, token1, token2 } =
        await loadFixture(deployFixture);
      await token1.connect(deployer).approve(amm.target, amount);
      await token2.connect(deployer).approve(amm.target, amount);

      await amm.connect(deployer).addLiquidity(amount, amount);

      expect(await token1.balanceOf(amm.target)).to.equal(amount);
      expect(await token2.balanceOf(amm.target)).to.equal(amount);
      expect(await amm.balance1()).to.equal(amount);
      expect(await amm.balance2()).to.equal(amount);
      expect(await amm.shares(deployer.address)).to.equal(
        ethers.parseUnits('100', 18)
      );
      expect(await amm.totalShares()).to.equal(ethers.parseUnits('100', 18));
    });

    it('fails to add liquidity with unequal token amounts', async function () {
      const { deployer, liquidityProvider, amm, token1, token2 } =
        await loadFixture(deployFixture);
      await token1.connect(deployer).approve(amm.target, amount);
      await token2.connect(deployer).approve(amm.target, amount);

      await amm.connect(deployer).addLiquidity(amount, amount);
      await token1.connect(deployer).approve(amm.target, amount);
      await token2
        .connect(deployer)
        .approve(amm.target, ethers.parseUnits('50000', 18));

      await expect(
        amm
          .connect(deployer)
          .addLiquidity(amount, ethers.parseUnits('50000', 18))
      ).to.be.revertedWith('Must provide equal token amounts');
    });

    it('facilitates swaps', async function () {
      const {
        deployer,
        liquidityProvider,
        amm,
        token1,
        token2,
        investor1,
        investor2,
      } = await loadFixture(deployFixture);
      let tx = await token1.connect(deployer).approve(amm.target, amount);
      await tx.wait();
      tx = await token2.connect(deployer).approve(amm.target, amount);
      await tx.wait();

      await amm.connect(deployer).addLiquidity(amount, amount);

      amount = ethers.parseUnits('50000', 18);
      await token1.connect(liquidityProvider).approve(amm.target, amount);
      await token2.connect(liquidityProvider).approve(amm.target, amount);

      let token2Deposit = await amm.calculateToken2Deposit(amount);
      await amm.connect(liquidityProvider).addLiquidity(amount, token2Deposit);

      expect(await amm.shares(liquidityProvider.address)).to.equal(
        ethers.parseUnits('50', 18)
      );
      expect(await amm.shares(deployer.address)).to.equals(
        ethers.parseUnits('100', 18)
      );
      expect(await amm.totalShares()).to.equals(ethers.parseUnits('150', 18));

      // Investor 1 swaps
      await token1
        .connect(investor1)
        .approve(amm.target, ethers.parseUnits('100000', 18));
      let balance = await token2.balanceOf(investor1.address);
      let estimate = await amm.calculateToken1Swap(ethers.parseUnits('1', 18));

      tx = await amm.connect(investor1).swapToken1(ethers.parseUnits('1', 18));
      await tx.wait();

      await expect(tx)
        .to.emit(amm, 'Swap')
        .withArgs(
          investor1.address,
          token1.target,
          ethers.parseUnits('1', 18),
          token2.target,
          estimate,
          await amm.balance1(),
          await amm.balance2(),
          (
            await ethers.provider.getBlock(
              await ethers.provider.getBlockNumber()
            )
          ).timestamp
        );

      balance = await token2.balanceOf(investor1.address);
      expect(estimate).to.equal(balance);

      // Check AMM token balances are in sync
      expect(await token1.balanceOf(amm.target)).to.equal(await amm.balance1());
      expect(await token2.balanceOf(amm.target)).to.equal(await amm.balance2());
    });

    it('fails to swap more tokens than available in the pool', async function () {
      const { investor1, amm, token1 } = await loadFixture(deployFixture);

      await token1
        .connect(investor1)
        .approve(amm.target, ethers.parseUnits('100000', 18));

      await expect(
        amm.connect(investor1).swapToken1(ethers.parseUnits('1000000', 18))
      ).to.be.revertedWith('Swap amount exceeds pool balance');
    });
  });

  // describe.skip('Swapping tokens', function () {
  //   let amount = ethers.parseUnits('100000', 18);
  //   it('facilitates swaps', async function () {
  //     const {
  //       deployer,
  //       liquidityProvider,
  //       amm,
  //       token1,
  //       token2,
  //       investor1,
  //       investor2,
  //     } = await loadFixture(deployFixture);
  //     let tx = await token1.connect(deployer).approve(amm.target, amount);
  //     await tx.wait();

  //     tx = await token2.connect(deployer).approve(amm.target, amount);
  //     await tx.wait();

  //     tx = await amm.connect(deployer).addLiquidity(amount, amount);
  //     await tx.wait();
  //     expect(await token1.balanceOf(amm.target)).to.equal(amount);
  //     expect(await token2.balanceOf(amm.target)).to.equal(amount);

  //     expect(await amm.balance1()).to.equal(amount);
  //     expect(await amm.balance2()).to.equal(amount);

  //     expect(await amm.shares(deployer.address)).to.equal(
  //       ethers.parseUnits('100', 18)
  //     );

  //     expect(await amm.totalShares()).to.equal(ethers.parseUnits('100', 18));

  //     amount = ethers.parseUnits('50000', 18);
  //     tx = await token1.connect(liquidityProvider).approve(amm.target, amount);
  //     await tx.wait();

  //     tx = await token2.connect(liquidityProvider).approve(amm.target, amount);
  //     await tx.wait();

  //     // Calculate token2 deposit
  //     let token2Deposit = await amm.calculateToken2Deposit(amount);
  //     tx = await amm
  //       .connect(liquidityProvider)
  //       .addLiquidity(amount, token2Deposit);
  //     await tx.wait();

  //     expect(await amm.shares(liquidityProvider.address)).to.equal(
  //       ethers.parseUnits('50', 18)
  //     );

  //     expect(await amm.shares(deployer.address)).to.equals(
  //       ethers.parseUnits('100', 18)
  //     );

  //     expect(await amm.totalShares()).to.equals(ethers.parseUnits('150', 18));

  //     // Investor 1 swaps
  //     // Check price before swapping
  //     console.log(`Price: ${(await amm.balance2()) / (await amm.balance1())}`);
  //     // Investor 1 approves all tokens
  //     tx = await token1
  //       .connect(investor1)
  //       .approve(amm.target, ethers.parseUnits('100000', 18));
  //     await tx.wait();

  //     // Check investor1  balance before swap
  //     balance = await token2.balanceOf(investor1.address);
  //     console.log(
  //       `Investor1 Token2 balance before swap: ${ethers.formatEther(balance)}`
  //     );

  //     // Estimate amount of tokens investor1 will receive after swapping token1: include slippage
  //     let estimate = await amm.calculateToken1Swap(ethers.parseUnits('1', 18));
  //     console.log(
  //       `Token2 amount investor1 will receive after swap: ${ethers.formatEther(
  //         estimate
  //       )}`
  //     );

  //     // Investor1 swaps 1 token1
  //     tx = await amm.connect(investor1).swapToken1(ethers.parseUnits('1', 18));
  //     await tx.wait();

  //     // Check swap event
  //     await expect(tx)
  //       .to.emit(amm, 'Swap')
  //       .withArgs(
  //         investor1.address,
  //         token1.target,
  //         ethers.parseUnits('1', 18),
  //         token2.target,
  //         estimate,
  //         await amm.balance1(),
  //         await amm.balance2(),
  //         (
  //           await ethers.provider.getBlock(
  //             await ethers.provider.getBlockNumber()
  //           )
  //         ).timestamp
  //       );

  //     // Check investor1 balance after swap
  //     balance = await token2.balanceOf(investor1.address);
  //     console.log(
  //       `Investor1 Token2 balance after swap: ${ethers.formatEther(balance)}`
  //     );
  //     expect(estimate).to.equal(balance);
  //     // Check AMM token balances are in sync
  //     expect(await token1.balanceOf(amm.target)).to.equal(await amm.balance1());
  //     expect(await token2.balanceOf(amm.target)).to.equal(await amm.balance2());

  //     // Check price after swapping
  //     console.log(`Price: ${(await amm.balance2()) / (await amm.balance1())}`);

  //     // Investor 1 swaps again
  //     balance = await token2.balanceOf(investor1.address);
  //     console.log(
  //       `Investor1 Token2 balance before swap: ${ethers.formatEther(balance)}`
  //     );

  //     estimate = await amm.calculateToken1Swap(ethers.parseUnits('1', 18));
  //     console.log(
  //       `Token2 amount investor1 will receive after swap: ${ethers.formatEther(
  //         estimate
  //       )}`
  //     );

  //     // Investor1 swaps 1 token1
  //     tx = await amm.connect(investor1).swapToken1(ethers.parseUnits('1', 18));
  //     await tx.wait();

  //     // Check investor1 balance after swap
  //     balance = await token2.balanceOf(investor1.address);
  //     console.log(
  //       `Investor1 Token2 balance after swap: ${ethers.formatEther(balance)}`
  //     );
  //     // expect(estimate).to.equal(balance);
  //     // Check AMM token balances are in sync
  //     expect(await token1.balanceOf(amm.target)).to.equal(await amm.balance1());
  //     expect(await token2.balanceOf(amm.target)).to.equal(await amm.balance2());

  //     // Check price after swapping
  //     console.log(`Price: ${(await amm.balance2()) / (await amm.balance1())}`);

  //     // Investor 1 swaps large amount
  //     balance = await token2.balanceOf(investor1.address);
  //     console.log(
  //       `Investor1 Token2 balance before swap: ${ethers.formatEther(balance)}`
  //     );

  //     estimate = await amm.calculateToken1Swap(ethers.parseUnits('100', 18));
  //     console.log(
  //       `Token2 amount investor1 will receive after swap: ${ethers.formatEther(
  //         estimate
  //       )}`
  //     );

  //     // Investor1 swaps 1 token1
  //     tx = await amm
  //       .connect(investor1)
  //       .swapToken1(ethers.parseUnits('100', 18));
  //     await tx.wait();

  //     // Check investor1 balance after swap
  //     balance = await token2.balanceOf(investor1.address);
  //     console.log(
  //       `Investor1 Token2 balance after swap: ${ethers.formatEther(balance)}`
  //     );
  //     // expect(estimate).to.equal(balance);
  //     // Check AMM token balances are in sync
  //     expect(await token1.balanceOf(amm.target)).to.equal(await amm.balance1());
  //     expect(await token2.balanceOf(amm.target)).to.equal(await amm.balance2());

  //     // Check price after swapping
  //     console.log(`Price: ${(await amm.balance2()) / (await amm.balance1())}`);

  //     // Investor 2 swaps
  //     // Investor 2 approves all tokens
  //     tx = await token2
  //       .connect(investor2)
  //       .approve(amm.target, ethers.parseUnits('100000', 18));
  //     await tx.wait();

  //     // Check investor 2 balance before swap
  //     balance = await token1.balanceOf(investor2.address);
  //     console.log(
  //       `Investor2 Token1 balance before swap: ${ethers.formatEther(balance)}`
  //     );

  //     // Estimate amount of tokens1 tokens investor 2 will receive after swapping token2: include slippage
  //     estimate = await amm.calculateToken2Swap(ethers.parseUnits('1', 18));
  //     console.log(
  //       `Token1 amount investor2 will receive after swap: ${ethers.formatEther(
  //         estimate
  //       )}`
  //     );

  //     tx = await amm.connect(investor2).swapToken2(ethers.parseUnits('1', 18));
  //     await tx.wait();

  //     // Check swap event
  //     await expect(tx)
  //       .to.emit(amm, 'Swap')
  //       .withArgs(
  //         investor2.address,
  //         token2.target,
  //         ethers.parseUnits('1', 18),
  //         token1.target,
  //         estimate,
  //         await amm.balance1(),
  //         await amm.balance2(),
  //         (
  //           await ethers.provider.getBlock(
  //             await ethers.provider.getBlockNumber()
  //           )
  //         ).timestamp
  //       );

  //     // Check investor 2 balance after swap
  //     balance = await token1.balanceOf(investor2.address);
  //     console.log(
  //       `Investor2 Token1 balance after swap: ${ethers.formatEther(balance)}`
  //     );
  //     expect(estimate).to.equal(balance);

  //     // Check AMM token balances are in sync
  //     expect(await token1.balanceOf(amm.target)).to.equal(await amm.balance1());
  //     expect(await token2.balanceOf(amm.target)).to.equal(await amm.balance2());

  //     // Check price after swapping
  //     console.log(`Price: ${(await amm.balance2()) / (await amm.balance1())}`);
  //   });
  // });
});
