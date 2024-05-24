import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Navigation from './components/Navigation';
import { ethers } from 'ethers';
import Info from './components/Info';

import TOKEN_ABI from './abis/Token.json';

import config from './config.json';
import Loading from './components/Loading';

import { loadAccount, loadProvider, loadNetwork } from './store/interaction';

function App() {
  let account = '0x0...';
  const [accountBalance, setAccountBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    const tempProvider = loadProvider(dispatch);

    const { chainId } = await loadNetwork(tempProvider, dispatch);

    if (chainId && config[chainId]) {
      const tempToken = new ethers.Contract(
        config[chainId].dapp.address,
        TOKEN_ABI,
        tempProvider
      );

      const tempAccount = await loadAccount(dispatch);

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
