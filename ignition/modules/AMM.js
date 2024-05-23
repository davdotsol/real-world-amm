const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

const AMMModule = buildModule('AMMModule', (m) => {
  const name1 = m.getParameter('name', 'Dapp Dot Sol');
  const symbol1 = m.getParameter('symbol', 'DDS');
  const totalSupply1 = m.getParameter('totalSupply', 1000000);
  const token1 = m.contract('Token', [name1, symbol1, totalSupply1], {
    id: 'Token1',
  });

  const name2 = m.getParameter('name', 'USD Token');
  const symbol2 = m.getParameter('symbol', 'USD');
  const totalSupply2 = m.getParameter('totalSupply', 1000000);
  const token2 = m.contract('Token', [name2, symbol2, totalSupply2], {
    id: 'Token2',
  });

  const amm = m.contract('AMM', [token1, token2]);

  return { amm, token1, token2 };
});

module.exports = AMMModule;
