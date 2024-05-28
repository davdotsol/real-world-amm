import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';
import { swap, loadBalances } from '../store/interaction';
import Loading from './Loading';
import Alert from './Alert';

const Swap = () => {
  const [price, setPrice] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [inputToken, setInputToken] = useState(null);
  const [outputToken, setOutputToken] = useState(null);
  const [inputAmount, setInputAmount] = useState(0);
  const [outputAmount, setOutputAmount] = useState(0);
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
    const b1 = parseFloat(
      ethers.formatUnits((await amm.balance1()).toString(), 18).toString()
    );
    const b2 = parseFloat(
      ethers.formatUnits((await amm.balance2()).toString(), 18).toString()
    );
    if (inputToken === outputToken) {
      setPrice(0);
      return;
    }

    if (inputToken === 'DDS') {
      const p = b2 / b1;
      setPrice(p.toFixed(2));
    } else {
      const p = b1 / b2;
      setPrice(p);
    }
  };

  const inputHandler = async (e) => {
    if (!inputToken || !outputToken) {
      return;
    }

    if (inputToken === outputToken) {
      return;
    }

    if (inputToken === 'DDS') {
      setInputAmount(e.target.value);
      const amount1 = ethers.parseUnits(e.target.value, 'ether');
      const result = await amm.calculateToken1Swap(amount1);
      const amount2 = ethers.formatUnits(result.toString(), 'ether');

      setOutputAmount(amount2.toString());
    } else {
      setInputAmount(e.target.value);
      const amount2 = ethers.parseUnits(e.target.value, 'ether');
      const result = await amm.calculateToken2Swap(amount2);
      const amount1 = ethers.formatUnits(result.toString(), 'ether');

      setOutputAmount(amount1.toString());
    }
  };

  useEffect(() => {
    if (inputToken && outputToken) {
      getPrice();
    }
  }, [inputToken, outputToken]);

  const swapHandler = async (e) => {
    e.preventDefault();
    setShowAlert(false);
    if (!inputToken || !outputToken) {
      return;
    }

    if (inputToken === outputToken) {
      return;
    }

    const amount = ethers.parseUnits(inputAmount, 'ether');
    // Swap token depending upon which one we're doing...
    if (inputToken === 'DDS') {
      await swap(provider, amm, tokens[0], inputToken, amount, dispatch);
    } else {
      await swap(provider, amm, tokens[1], inputToken, amount, dispatch);
    }
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
                  onChange={(e) => inputHandler(e)}
                  min="0.0"
                  placeholder="0.0"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
                  disabled={!inputToken}
                />
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded px-4 py-2 ml-2"
                  value={inputToken ? inputToken : 0}
                  onChange={(e) => setInputToken(e.target.value)}
                >
                  <option value="0" disabled selected>
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
                  placeholder="0.0"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
                  disabled
                />
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded px-4 py-2 ml-2"
                  value={outputToken ? outputToken : 0}
                  onChange={(e) => setOutputToken(e.target.value)}
                >
                  <option value="0" disabled selected>
                    Select Token
                  </option>
                  <option value="DDS">DDS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
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

      {isSwapping ? (
        <Alert
          message={'Swap Pending...'}
          txHash={null}
          setShowAlert={setShowAlert}
        />
      ) : isSuccess && showAlert ? (
        <Alert
          message={'Swap Successful...'}
          txHash={txHash}
          setShowAlert={setShowAlert}
        />
      ) : !isSuccess && showAlert ? (
        <Alert
          message={'Swap Failed...'}
          txHash={null}
          setShowAlert={setShowAlert}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default Swap;
