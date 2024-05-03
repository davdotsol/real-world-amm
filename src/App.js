import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import { ethers } from 'ethers';
import Info from './components/Info';

import TOKEN_ABI from './abis/Token.json';

import config from './config.json';
import Loading from './components/Loading';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadBlockchainData = async () => {
    const tempProvider = new ethers.BrowserProvider(window.ethereum);
    setProvider(tempProvider);

    const { chainId } = await tempProvider.getNetwork();

    if (chainId && config[chainId]) {
      const tempToken = new ethers.Contract(
        config[chainId].token.address,
        TOKEN_ABI,
        tempProvider
      );

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const tempAccount = ethers.getAddress(accounts[0]);
      setAccount(tempAccount);

      const tempAccountBalance = ethers.formatUnits(
        await tempToken.balanceOf(tempAccount),
        18
      );
      setAccountBalance(tempAccountBalance);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (isLoading) {
      try {
        loadBlockchainData();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoading]);

  return (
    <div className="container mx-auto px-4">
      <Navigation />

      <h1 className="my-4 text-center">Introducing My NFT</h1>

      {isLoading ? <Loading /> : <div>Content</div>}

      <hr />
      {account && <Info account={account} accountBalance={accountBalance} />}
    </div>
  );
}

export default App;
