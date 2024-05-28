import { NavLink } from 'react-router-dom';

const Tabs = () => {
  return (
    <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
      <ul className="flex flex-wrap -mb-px">
        <li className="me-2">
          <NavLink
            to="/"
            exact
            className={({ isActive, isPending }) =>
              isPending
                ? 'inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                : isActive
                ? 'inline-block p-4 text-teal-600 border-b-2 border-teal-600 rounded-t-lg active dark:text-teal-500 dark:border-teal-500'
                : 'inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
            }
          >
            Swap
          </NavLink>
        </li>
        <li className="me-2">
          <NavLink
            to="/deposit"
            className={({ isActive, isPending }) =>
              isPending
                ? 'inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                : isActive
                ? 'inline-block p-4 text-teal-600 border-b-2 border-teal-600 rounded-t-lg active dark:text-teal-500 dark:border-teal-500'
                : 'inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
            }
          >
            Deposit
          </NavLink>
        </li>
        <li className="me-2">
          <NavLink
            to="/withdraw"
            className={({ isActive, isPending }) =>
              isPending
                ? 'inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                : isActive
                ? 'inline-block p-4 text-teal-600 border-b-2 border-teal-600 rounded-t-lg active dark:text-teal-500 dark:border-teal-500'
                : 'inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
            }
          >
            Withdraw
          </NavLink>
        </li>
        <li className="me-2">
          <NavLink
            to="/charts"
            className={({ isActive, isPending }) =>
              isPending
                ? 'inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                : isActive
                ? 'inline-block p-4 text-teal-600 border-b-2 border-teal-600 rounded-t-lg active dark:text-teal-500 dark:border-teal-500'
                : 'inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
            }
          >
            Charts
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Tabs;
