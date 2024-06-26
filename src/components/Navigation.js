import { useDispatch, useSelector } from 'react-redux';
import Blockies from 'react-blockies';
import { loadAccount, loadBalances } from '../store/interaction';
import config from '../config.json';

const Navigation = () => {
  const chainId = useSelector((state) => state.provider.chainId);
  const account = useSelector((state) => state.provider.account);
  const tokens = useSelector((state) => state.tokens.contracts);
  const amm = useSelector((state) => state.amm.contract);
  const dispatch = useDispatch();

  const onConnectHandler = async () => {
    const account = await loadAccount(dispatch);
    await loadBalances(amm, tokens, account, dispatch);
  };

  const networkHandler = async (e) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: e.target.value }],
      });
      console.log('`0x${chainId.toString(16)}`', `0x${chainId.toString(16)}`);
    } catch (error) {
      console.error('Network switch failed', error);
    }
  };

  return (
    <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <svg
          className="fill-current h-8 w-8 mr-2"
          width="54"
          height="54"
          viewBox="0 0 54 54"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M13.5 22.1c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05zM0 38.3c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05z" />
        </svg>
        <span className="font-semibold text-xl tracking-tight">
          Real World AMM
        </span>
      </div>
      <div className="block lg:hidden">
        <button className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
          <svg
            className="fill-current h-3 w-3"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div className="text-sm lg:flex-grow"></div>
        <div className="flex items-center">
          <form className="mr-4">
            <select
              value={config[chainId] ? `0x${chainId.toString(16)}` : ''}
              onChange={networkHandler}
              className="bg-teal-500 text-white border border-white rounded px-4 py-2"
            >
              <option value="" disabled>
                Select Network
              </option>
              <option value="0x7A69">Localhost</option>
              <option value="0x11155111">Sepolia</option>
            </select>
          </form>
          {account ? (
            <div className="inline-block text-sm px-4 py-2 text-white mt-4 lg:mt-0 flex items-center">
              <span className="mr-2">
                {account.slice(0, 5) + '...' + account.slice(-4)}
              </span>
              <Blockies seed={account} size={10} scale={3} />
            </div>
          ) : (
            <a
              href="#"
              className="inline-block text-sm px-4 py-3 leading-none border rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white"
              onClick={(e) => {
                e.preventDefault();
                onConnectHandler();
              }}
            >
              Connect
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
