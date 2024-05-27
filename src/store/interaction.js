import { setAccount, setProvider, setNetwork } from './reducers/provider';
import { setContracts, setSymbols, setBalances } from './reducers/tokens';
import { setContract, setShares, setSwaps } from './reducers/amm';
import { ethers } from 'ethers';

import config from '../config.json';
import TOKEN_ABI from '../abis/Token.json';
import AMM_ABI from '../abis/AMM.json';

export const loadProvider = (dispatch) => {
  const tempProvider = new ethers.BrowserProvider(window.ethereum);
  dispatch(setProvider(tempProvider));

  return tempProvider;
};

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork();
  dispatch(setNetwork(chainId.toString()));

  return chainId;
};

export const loadAccount = async (dispatch) => {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  const tempAccount = ethers.getAddress(accounts[0]);
  dispatch(setAccount(tempAccount));

  return tempAccount;
};

// ------------------------
// LOAD CONTRACTS

export const loadTokens = async (provider, chainId, dispatch) => {
  const ddsToken = new ethers.Contract(
    config[chainId].dds.address,
    TOKEN_ABI,
    provider
  );

  const usdToken = new ethers.Contract(
    config[chainId].usd.address,
    TOKEN_ABI,
    provider
  );

  dispatch(setContracts([ddsToken, usdToken]));
  dispatch(setSymbols([await ddsToken.symbol(), await usdToken.symbol()]));
};

export const loadAMM = async (provider, chainId, dispatch) => {
  const amm = new ethers.Contract(
    config[chainId].amm.address,
    AMM_ABI,
    provider
  );

  dispatch(setContract(amm));
  return amm;
};

// ------------------------
// LOAD BALANCES AND SHARES
export const loadBalances = async (amm, tokens, account, dispatch) => {
  const balance1 = await tokens[0].balanceOf(account);
  const balance2 = await tokens[1].balanceOf(account);
  dispatch(
    setBalances([
      ethers.formatUnits(balance1.toString(), 'ether'),
      ethers.formatUnits(balance2.toString(), 'ether'),
    ])
  );

  const shares = await amm.shares(account);
  dispatch(setShares(ethers.formatUnits(shares.toString(), 'ether')));
};
