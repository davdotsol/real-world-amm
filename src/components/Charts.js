import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadAllSwaps } from '../store/interaction';
import { chartSelector } from '../store/selectors';
import { ethers } from 'ethers';
import Chart from 'react-apexcharts';
import Loading from './Loading';
import { options, series } from './Charts.config';

const Charts = () => {
  const provider = useSelector((state) => state.provider.connection);
  const tokens = useSelector((state) => state.tokens.contracts);
  const symbols = useSelector((state) => state.tokens.symbols);
  const amm = useSelector((state) => state.amm.contract);
  const chart = useSelector(chartSelector);

  const dispatch = useDispatch();

  useEffect(() => {
    if (provider && amm) {
      loadAllSwaps(provider, amm, dispatch);
    }
  }, [provider, amm, dispatch]);
  return (
    <div class="relative overflow-x-auto mt-10">
      {provider && amm ? (
        <div>
          <Chart
            options={options}
            series={chart ? chart.series : series}
            type="line"
            width="100%"
            height="300"
          />
          <hr />
          <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" class="px-6 py-3">
                  Transaction Hash
                </th>
                <th scope="col" class="px-6 py-3">
                  Token Give
                </th>
                <th scope="col" class="px-6 py-3">
                  Amount Give
                </th>
                <th scope="col" class="px-6 py-3">
                  Token Get
                </th>
                <th scope="col" class="px-6 py-3">
                  Amount Get
                </th>
                <th scope="col" class="px-6 py-3">
                  User
                </th>
                <th scope="col" class="px-6 py-3">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {chart.swaps &&
                chart.swaps.map((swap, index) => {
                  return (
                    <tr
                      key={index}
                      class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    >
                      <td class="px-6 py-4">
                        {swap.hash.slice(0, 5) +
                          '...' +
                          swap.hash.slice(61, 66)}
                      </td>
                      <td class="px-6 py-4">
                        {swap.args.tokenGive === tokens[0].target
                          ? symbols[0]
                          : symbols[1]}
                      </td>
                      <td class="px-6 py-4">
                        {ethers.formatUnits(
                          swap.args.tokenGiveAmount.toString(),
                          'ether'
                        )}
                      </td>
                      <td class="px-6 py-4">
                        {swap.args.tokenGet === tokens[0].target
                          ? symbols[0]
                          : symbols[1]}
                      </td>
                      <td class="px-6 py-4">
                        {ethers.formatUnits(
                          swap.args.tokenGetAmount.toString(),
                          'ether'
                        )}
                      </td>
                      <td class="px-6 py-4">
                        {swap.args.user.slice(0, 5) +
                          '...' +
                          swap.args.user.slice(-4)}
                      </td>
                      <td class="px-6 py-4">
                        {new Date(
                          Number(swap.args.timestamp.toString() + '000')
                        ).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          second: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
};
export default Charts;
