import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addLiquidity, loadBalances } from '../store/interaction';
import { ethers } from 'ethers';
import Loading from './Loading';
import Alert from './Alert';

const Deposit = () => {
  const [input1Amount, setInput1Amount] = useState(0);
  const [input2Amount, setInput2Amount] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const account = useSelector((state) => state.provider.account);
  const provider = useSelector((state) => state.provider.connection);
  const tokens = useSelector((state) => state.tokens.contracts);
  const symbols = useSelector((state) => state.tokens.symbols);
  const balances = useSelector((state) => state.tokens.balances);
  const amm = useSelector((state) => state.amm.contract);
  const isDepositing = useSelector(
    (state) => state.amm.depositing.isDepositing
  );
  const isSuccess = useSelector((state) => state.amm.depositing.isSuccess);
  const txHash = useSelector((state) => state.amm.depositing.txHash);

  const dispatch = useDispatch();

  const amountHandler = async (e) => {
    if (e.target.id === 'input1') {
      setInput1Amount(e.target.value);
      // Fetch value from chain
      const token1Amount = ethers.parseUnits(e.target.value, 'ether');
      const result = await amm.calculateToken2Deposit(token1Amount);
      const token2Amount = ethers.formatUnits(result.toString(), 'ether');

      // Set Token 2 amount
      setInput2Amount(token2Amount);
    } else {
      setInput2Amount(e.target.value);
      // Fetch value from chain
      const token2Amount = ethers.parseUnits(e.target.value, 'ether');
      const result = await amm.calculateToken2Deposit(token2Amount);
      const token1Amount = ethers.formatUnits(result.toString(), 'ether');

      // Set Token 1 amount
      setInput1Amount(token1Amount);
    }
  };

  const depositHandler = async (e) => {
    e.preventDefault();
    setShowAlert(false);
    const token1Amount = ethers.parseUnits(input1Amount, 'ether');
    const token2Amount = ethers.parseUnits(input2Amount, 'ether');
    await addLiquidity(
      provider,
      amm,
      tokens,
      [token1Amount, token2Amount],
      dispatch
    );

    await loadBalances(amm, tokens, account, dispatch);
    setShowAlert(true);
  };

  return (
    <div>
      <div className="w-full mx-auto mt-10 max-w-sm p-4 bg-white border border-teal-400 rounded-lg shadow sm:p-6 md:p-8">
        {account ? (
          <form className="space-y-6" onSubmit={depositHandler}>
            <div>
              <div className="flex justify-end">
                <span>Balance: {balances[0]}</span>
              </div>
              <div className="flex justify-center">
                <input
                  type="number"
                  name="input1"
                  id="input1"
                  min="0.0"
                  placeholder="0.0"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
                  onChange={amountHandler}
                  value={input1Amount === 0 ? '' : input1Amount}
                />
                <span className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded px-4 py-2 ml-2">
                  {symbols && symbols[0]}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-end">
                <span>Balance: {balances[1]}</span>
              </div>
              <div className="flex justify-center">
                <input
                  type="number"
                  name="input2"
                  id="input2"
                  min="0.0"
                  step="any"
                  placeholder="0.0"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
                  onChange={amountHandler}
                  value={input2Amount === 0 ? '' : input2Amount}
                />
                <span className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded px-4 py-2 ml-2">
                  {symbols && symbols[1]}
                </span>
              </div>
            </div>
            {isDepositing ? (
              <Loading />
            ) : (
              <button
                type="submit"
                className="w-full text-white bg-teal-500 hover:bg-teal-400 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Deposit
              </button>
            )}
          </form>
        ) : (
          <div className="text-center text-gray-900">
            Please connect your wallet
          </div>
        )}
      </div>
      {isDepositing ? (
        <Alert
          message={'Depositing Pending...'}
          txHash={null}
          setShowAlert={setShowAlert}
        />
      ) : isSuccess && showAlert ? (
        <Alert
          message={'Depositing Successful...'}
          txHash={txHash}
          setShowAlert={setShowAlert}
        />
      ) : !isSuccess && showAlert ? (
        <Alert
          message={'Depositing Failed...'}
          txHash={null}
          setShowAlert={setShowAlert}
        />
      ) : (
        <></>
      )}
    </div>
  );
};
export default Deposit;
