const hre = require('hardhat');
const config = require('../src/config.json');

const tokens = (m) => {
  return ethers.parseUnits(m.toString(), 18);
};

const ether = tokens;
const shares = ether;

async function main() {
  console.log(`Fetching accounts & network\n`);
  const accounts = await hre.ethers.getSigners();

  const deployer = accounts[0];
  const investor1 = accounts[1];
  const investor2 = accounts[2];
  const investor3 = accounts[3];
  const investor4 = accounts[4];

  const { chainId } = await hre.ethers.provider.getNetwork();

  console.log('chainid', chainId);
  console.log('config[chainId]', config[chainId]);

  console.log(`Fetching token and transferring to accounts...\n`);

  const dapp = await hre.ethers.getContractAt(
    'Token',
    config[chainId].dapp.address
  );
  console.log(`Dapp token fetched ${dapp.target}`);

  const usd = await hre.ethers.getContractAt(
    'Token',
    config[chainId].usd.address
  );
  console.log(`usd token fetched ${usd.target}`);

  let tx = await dapp.connect(deployer).transfer(investor1.address, tokens(10));
  await tx.wait();
  tx = await usd.connect(deployer).transfer(investor2.address, tokens(10));
  await tx.wait();
  tx = await dapp.connect(deployer).transfer(investor3.address, tokens(10));
  await tx.wait();
  tx = await usd.connect(deployer).transfer(investor4.address, tokens(10));
  await tx.wait();

  let amount = tokens(100);

  console.log(`Fetching AMM...\n`);
  const amm = await hre.ethers.getContractAt(
    'AMM',
    config[chainId].amm.address
  );
  console.log(`AMM fetched ${amm.target}`);

  tx = await dapp.connect(deployer).approve(amm.target, amount);
  await tx.wait();

  tx = await usd.connect(deployer).approve(amm.target, amount);
  await tx.wait();

  console.log(`Adding liquidity...\n`);
  tx = await amm.connect(deployer).addLiquidity(amount, amount);
  await tx.wait();

  console.log(`Investor 1 swaps: Dapp --> USD...\n`);

  tx = await dapp.connect(investor1).approve(amm.target, tokens(10));
  await tx.wait();

  tx = await amm.connect(investor1).swapToken1(tokens(1));
  await tx.wait();

  console.log(`Investor 2 swaps: USD --> Dapp...\n`);

  tx = await usd.connect(investor2).approve(amm.target, tokens(10));
  await tx.wait();

  tx = await amm.connect(investor2).swapToken2(tokens(1));
  await tx.wait();

  console.log(`Investor 3 swaps: Dapp --> USD...\n`);

  tx = await dapp.connect(investor3).approve(amm.target, tokens(10));
  await tx.wait();

  tx = await amm.connect(investor3).swapToken1(tokens(10));
  await tx.wait();

  console.log(`Investor 4 swaps: USD --> Dapp...\n`);

  tx = await usd.connect(investor4).approve(amm.target, tokens(10));
  await tx.wait();

  tx = await amm.connect(investor4).swapToken2(tokens(5));
  await tx.wait();

  console.log(`Finished.\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
