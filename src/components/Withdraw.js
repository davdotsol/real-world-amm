import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeLiquidity, loadBalances } from '../store/interaction';
import { ethers } from 'ethers';
import Loading from './Loading';
import Alert from './Alert';

const Withdraw = () => {
  const [amount, setAmount] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const account = useSelector((state) => state.provider.account);
  const provider = useSelector((state) => state.provider.connection);
  const tokens = useSelector((state) => state.tokens.contracts);
  const balances = useSelector((state) => state.tokens.balances);
  const shares = useSelector((state) => state.amm.shares);
  const amm = useSelector((state) => state.amm.contract);
  const isWithdrawing = useSelector(
    (state) => state.amm.withdrawing.isWithdrawing
  );
  const isSuccess = useSelector((state) => state.amm.withdrawing.isSuccess);
  const txHash = useSelector((state) => state.amm.withdrawing.txHash);

  const dispatch = useDispatch();

  const withdrawHandler = async (e) => {
    e.preventDefault();

    setShowAlert(false);

    const sharesAmount = ethers.parseUnits(amount.toString(), 'ether');

    await removeLiquidity(provider, amm, sharesAmount, dispatch);
    await loadBalances(amm, tokens, account, dispatch);

    setShowAlert(true);
  };

  return (
    <div>
      <div className="w-full mx-auto mt-10 max-w-sm p-4 bg-white border border-teal-400 rounded-lg shadow sm:p-6 md:p-8">
        {account ? (
          <form className="space-y-6" onSubmit={withdrawHandler}>
            <div>
              <div className="flex justify-end">
                <span>Shares: {shares}</span>
              </div>
              <div className="flex justify-center">
                <input
                  type="number"
                  name="shares"
                  id="shares"
                  step="any"
                  min="0.0"
                  placeholder="0"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded px-4 py-2 ml-2">
                  Shares
                </span>
              </div>
            </div>
            {isWithdrawing ? (
              <Loading />
            ) : (
              <button
                type="submit"
                className="w-full text-white bg-teal-500 hover:bg-teal-400 focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Withdraw
              </button>
            )}

            <hr />
            <div>
              <p>
                <strong>DDS Balance: </strong>
                {balances[0]}
              </p>
              <p>
                <strong>USD Balance: </strong>
                {balances[1]}
              </p>
            </div>
          </form>
        ) : (
          <div className="text-center text-gray-900">
            Please connect your wallet
          </div>
        )}
      </div>
      {isWithdrawing ? (
        <Alert
          message={'Withdrawing Pending...'}
          txHash={null}
          setShowAlert={setShowAlert}
        />
      ) : isSuccess && showAlert ? (
        <Alert
          message={'Withdrawing Successful...'}
          txHash={txHash}
          setShowAlert={setShowAlert}
        />
      ) : !isSuccess && showAlert ? (
        <Alert
          message={'Withdrawing Failed...'}
          txHash={null}
          setShowAlert={setShowAlert}
        />
      ) : (
        <></>
      )}
    </div>
  );
};
export default Withdraw;
