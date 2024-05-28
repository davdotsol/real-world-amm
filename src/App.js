import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import { ethers } from 'ethers';
import Swap from './components/Swap';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import Charts from './components/Charts';
import Tabs from './components/Tabs';

import Loading from './components/Loading';

import {
  loadAccount,
  loadProvider,
  loadNetwork,
  loadTokens,
  loadBalances,
  loadAMM,
} from './store/interaction';

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    const tempProvider = loadProvider(dispatch);

    const chainId = await loadNetwork(tempProvider, dispatch);

    if (chainId) {
      // Fetch current account from Metamask when changed
      window.ethereum.on('chainChanged', async () => {
        window.location.reload();
      });
      window.ethereum.on('accountsChanged', async () => {
        await loadAccount(dispatch);
      });
      await loadTokens(tempProvider, chainId, dispatch);
      await loadAMM(tempProvider, chainId, dispatch);
    }
  };

  useEffect(() => {
    try {
      loadBlockchainData();
    } catch (error) {
      console.log(error);
    } finally {
    }
  }, []);

  return (
    <div className="container mx-auto px-4">
      <BrowserRouter>
        <Navigation />

        <h1 className="my-4 text-center">Introducing My NFT</h1>
        <Tabs />
        <Routes>
          <Route exact path="/" element={<Swap />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/charts" element={<Charts />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
