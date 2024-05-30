import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';
import { swap, loadBalances } from '../store/interaction';
import Loading from './Loading';
import Alert from './Alert';

const Swap = () => {
  const [price, setPrice] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [inputToken, setInputToken] = useState('');
  const [outputToken, setOutputToken] = useState('');
  const [inputAmount, setInputAmount] = useState(0);
  const [outputAmount, setOutputAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const account = useSelector((state) => state.provider.account);
  const provider = useSelector((state) => state.provider.connection);
  const amm = useSelector((state) => state.amm.contract);
  const isSwapping = useSelector((state) => state.amm.swapping.isSwapping);
  const isSuccess = useSelector((state) => state.amm.swapping.isSuccess);
  const txHash = useSelector((state) => state.amm.swapping.txHash);
  const tokens = useSelector((state) => state.tokens.contracts);
  const symbols = useSelector((state) => state.tokens.symbols);
  const balances = useSelector((state) => state.tokens.balances);
  const dispatch = useDispatch();

  const getPrice = async () => {
    if (!inputToken || !outputToken || inputToken === outputToken) {
      setPrice(0);
      return;
    }
    const b1 = parseFloat(
      ethers.formatUnits((await amm.balance1()).toString(), 18).toString()
    );
    const b2 = parseFloat(
      ethers.formatUnits((await amm.balance2()).toString(), 18).toString()
    );

    // Avoid division by zero
    if (b1 === 0 || b2 === 0) {
      setPrice(0);
      return;
    }

    const price = inputToken === 'DDS' ? b2 / b1 : b1 / b2;
    setPrice(price.toFixed(2));
  };

  const inputHandler = async (e) => {
    if (!inputToken || !outputToken || inputToken === outputToken) {
      return;
    }

    setInputAmount(e.target.value);

    if (inputToken === 'DDS') {
      if (balances[0] === '0.0') {
        setOutputAmount(0);
        setErrorMessage('Insufficient DDS balance.');
        return;
      }
      setErrorMessage('');
      const amount1 = ethers.parseUnits(e.target.value, 'ether');
      const result = await amm.calculateToken1Swap(amount1);
      const amount2 = ethers.formatUnits(result.toString(), 'ether');
      setOutputAmount(amount2.toString());
    } else {
      if (balances[1] === '0.0') {
        setOutputAmount(0);
        setErrorMessage('Insufficient USD balance.');
        return;
      }
      setErrorMessage('');
      const amount2 = ethers.parseUnits(e.target.value, 'ether');
      const result = await amm.calculateToken2Swap(amount2);
      const amount1 = ethers.formatUnits(result.toString(), 'ether');
      setOutputAmount(amount1.toString());
    }
  };

  useEffect(() => {
    const fetchPrice = async () => {
      await getPrice();
    };
    if (inputToken && outputToken) {
      fetchPrice();
    }
  }, [inputToken, outputToken, provider, amm]);

  const swapHandler = async (e) => {
    e.preventDefault();
    setShowAlert(false);
    setErrorMessage(''); // Reset error message
    if (!inputToken || !outputToken || inputToken === outputToken) {
      return;
    }

    if (inputAmount <= 0) {
      setErrorMessage('Swap amount must be greater than zero.');
      return;
    }

    const amount = ethers.parseUnits(inputAmount, 'ether');
    const tokenIndex = inputToken === 'DDS' ? 0 : 1;

    await swap(provider, amm, tokens[tokenIndex], inputToken, amount, dispatch);
    await loadBalances(amm, tokens, account, dispatch);
    await getPrice();
    setShowAlert(true);
  };

  return (
    <div>
      <div className="w-full mx-auto mt-10 max-w-sm p-4 bg-white border border-teal-400 rounded-lg shadow sm:p-6 md:p-8">
        {account ? (
          <form className="space-y-6" onSubmit={swapHandler}>
            <div>
              <div className="flex justify-between">
                <label
                  htmlFor="input"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Your Input
                </label>
                <span>
                  Balance:{' '}
                  {inputToken === symbols[0]
                    ? balances[0]
                    : inputToken === symbols[1]
                    ? balances[1]
                    : 0}
                </span>
              </div>
              <div className="flex justify-center">
                <input
                  type="number"
                  name="input"
                  id="input"
                  onChange={inputHandler}
                  min="0.0"
                  step="any"
                  placeholder="0.0"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
                  disabled={!inputToken}
                />
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded px-4 py-2 ml-2"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                >
                  <option value="" disabled>
                    Select Token
                  </option>
                  <option value="DDS">DDS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <label
                  htmlFor="output"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Your Output
                </label>
                <span>
                  Balance:{' '}
                  {outputToken === symbols[0]
                    ? balances[0]
                    : outputToken === symbols[1]
                    ? balances[1]
                    : 0}
                </span>
              </div>
              <div className="flex justify-center">
                <input
                  type="number"
                  name="output"
                  id="output"
                  value={outputAmount === 0 ? '' : outputAmount}
                  min="0.0"
                  step="any"
                  placeholder="0.0"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
                  disabled
                />
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded px-4 py-2 ml-2"
                  value={outputToken}
                  onChange={(e) => setOutputToken(e.target.value)}
                >
                  <option value="" disabled>
                    Select Token
                  </option>
                  <option value="DDS">DDS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            {errorMessage && (
              <div className="text-sm text-red-500">{errorMessage}</div>
            )}
            {isSwapping ? (
              <Loading />
            ) : (
              <button
                type="submit"
                className="w-full text-white bg-teal-500 hover:bg-teal-400 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Swap
              </button>
            )}
            <div className="text-sm font-medium text-gray-500">
              Exchange Rate: <span className="text-gray-900">{price}</span>
            </div>
          </form>
        ) : (
          <div className="text-center text-gray-900">
            Please connect your wallet
          </div>
        )}
      </div>
      {showAlert && (
        <Alert
          message={
            isSwapping
              ? 'Swap Pending...'
              : isSuccess
              ? 'Swap Successful...'
              : 'Swap Failed...'
          }
          txHash={isSwapping ? null : txHash}
          setShowAlert={setShowAlert}
        />
      )}
    </div>
  );
};

export default Swap;
