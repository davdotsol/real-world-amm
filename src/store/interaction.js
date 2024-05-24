import { setAccount, setProvider, setNetwork } from './reducers/provider';
import { ethers } from 'ethers';

export const loadProvider = (dispatch) => {
  const tempProvider = new ethers.BrowserProvider(window.ethereum);
  dispatch(setProvider(tempProvider));

  return tempProvider;
};

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork();
  dispatch(setNetwork(chainId));

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
