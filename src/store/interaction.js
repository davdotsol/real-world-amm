import { setAccount, setProvider, setNetwork } from './reducers/provider';
import { setContracts, setSymbols, setBalances } from './reducers/tokens';
import {
  setContract,
  setShares,
  swapRequest,
  swapSuccess,
  swapFailure,
  depositRequest,
  depositSuccess,
  depositFailure,
  withdrawRequest,
  withdrawSuccess,
  withdrawFailure,
} from './reducers/amm';
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
  if (config[chainId]) {
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
  }
};

export const loadAMM = async (provider, chainId, dispatch) => {
  if (config[chainId]) {
    const amm = new ethers.Contract(
      config[chainId].amm.address,
      AMM_ABI,
      provider
    );

    dispatch(setContract(amm));
    return amm;
  }
};

// ------------------------
// LOAD BALANCES AND SHARES
export const loadBalances = async (amm, tokens, account, dispatch) => {
  if (amm) {
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
  }
};

// ------------------------
// ADD LIQUIDITY
export const addLiquidity = async (
  provider,
  amm,
  tokens,
  amounts,
  dispatch
) => {
  try {
    dispatch(depositRequest());
    let tx;

    const signer = await provider.getSigner();

    tx = await tokens[0].connect(signer).approve(amm.target, amounts[0]);
    await tx.wait();

    tx = await tokens[1].connect(signer).approve(amm.target, amounts[1]);
    await tx.wait();

    tx = await amm.connect(signer).addLiquidity(amounts[0], amounts[1]);
    await tx.wait();
    dispatch(depositSuccess(tx.hash));
  } catch (error) {
    dispatch(depositFailure());
  }
};

// ------------------------
// REMOVE LIQUIDITY
export const removeLiquidity = async (provider, amm, shares, dispatch) => {
  try {
    dispatch(withdrawRequest());
    let tx;

    const signer = await provider.getSigner();

    tx = await amm.connect(signer).removeLiquidity(shares);
    await tx.wait();

    dispatch(withdrawSuccess(tx.hash));
  } catch (error) {
    dispatch(withdrawFailure());
  }
};

// ------------------------
// SWAP
export const swap = async (provider, amm, token, symbol, amount, dispatch) => {
  try {
    dispatch(swapRequest());
    let tx;

    const signer = await provider.getSigner();

    tx = await token.connect(signer).approve(amm.target, amount);
    await tx.wait();

    if (symbol === 'DDS') {
      tx = await amm.connect(signer).swapToken1(amount);
    } else {
      tx = await amm.connect(signer).swapToken2(amount);
    }
    await tx.wait();

    // Tell redux that swap has finished
    dispatch(swapSuccess(tx.hash));
  } catch (error) {
    dispatch(swapFailure());
  }
};
